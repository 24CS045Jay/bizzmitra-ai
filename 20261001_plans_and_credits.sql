-- ─────────────────────────────────────────────────────────────────────────
-- Plans, subscriptions & credit ledger — server-side source of truth.
--
-- WHY THIS MIGRATION EXISTS:
-- Right now CreditWallet (balance, tier, transactions) lives only in
-- browser localStorage (see admin-rbac-data.ts: STORAGE_KEY_WALLET). Any
-- user can open devtools, run
--   localStorage.setItem('bizzmitra.creditWallet', JSON.stringify({balance: 999999, tier: 'Enterprise Scale', ...}))
-- and grant themselves unlimited paid credits. Billing state must live in
-- the database, be written only by a trusted server function (Edge
-- Function / RPC with service role), and be read-only from the client.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.plans (
  id text primary key,                         -- 'free_starter' | 'growth_pro' | 'enterprise_scale'
  name text not null,
  monthly_price_inr integer not null,
  annual_price_inr integer not null,
  workspace_limit integer,                      -- null = unlimited
  extra_workspace_price_inr integer not null default 0,
  monthly_credits integer not null,
  seat_limit integer,                           -- null = unlimited
  allowed_models text[] not null default '{}',
  credit_top_up_allowed boolean not null default false
);

insert into public.plans (id, name, monthly_price_inr, annual_price_inr, workspace_limit, extra_workspace_price_inr, monthly_credits, seat_limit, allowed_models, credit_top_up_allowed)
values
  ('free_starter', 'Free Starter', 0, 0, 1, 0, 100, 1, array['gemini-2-flash'], false),
  ('growth_pro', 'Growth Pro', 3999, 3199, 5, 499, 1000, 8, array['gemini-2-flash','gpt-4o','claude-3-5-sonnet'], true),
  ('enterprise_scale', 'Enterprise Scale', 15999, 12799, null, 0, 5000, null, array['gemini-2-flash','gpt-4o','claude-3-5-sonnet','deepseek-v3'], true)
on conflict (id) do nothing;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null references public.plans(id),
  status text not null default 'active',        -- active | past_due | canceled
  billing_cycle text not null default 'monthly',-- monthly | annual
  extra_workspaces integer not null default 0,  -- paid add-on slots beyond plan.workspace_limit
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

create table if not exists public.credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0,
  monthly_quota integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  action text not null,                         -- FeatureAction id, e.g. 'full_blueprint_synthesis'
  model_id text not null,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  credits_deducted integer not null,
  balance_after integer not null,
  created_at timestamptz not null default now()
);

-- Row Level Security: users may only READ their own billing state.
-- All writes happen through a SECURITY DEFINER function called from an
-- Edge Function that also verifies the actual model API response before
-- charging (never trust a client-reported token count).
alter table public.subscriptions enable row level security;
alter table public.credit_wallets enable row level security;
alter table public.credit_transactions enable row level security;

create policy "read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "read own wallet" on public.credit_wallets
  for select using (auth.uid() = user_id);

create policy "read own transactions" on public.credit_transactions
  for select using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- Provider buckets — tracks live usage against your ACTUAL Groq/Gemini
-- account-level limits, broken down by plan tier, so checkProviderCapacity()
-- in pricing-config.ts has real numbers to divide fairly.
--
-- NOTE ON SCALE: this table works fine at low-to-moderate request volume.
-- Once you're doing many requests/second, move this to Redis (INCR with a
-- 60s TTL per `provider:model:plan` key) — Postgres row scanning becomes
-- the bottleneck before Groq/Gemini's own rate limit does. Keep this table
-- as your dev/staging fallback and for the audit trail either way.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.provider_usage_log (
  id uuid primary key default gen_random_uuid(),
  provider text not null,        -- 'groq' | 'gemini'
  model_id text not null,
  plan_id text not null references public.plans(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  requests integer not null default 1,
  tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_provider_usage_window
  on public.provider_usage_log (provider, created_at);

alter table public.provider_usage_log enable row level security;

-- Only the server (service role / SECURITY DEFINER functions) writes or
-- reads this table in aggregate — it spans every user, so no end-user
-- policy grants direct select/insert here.

-- Returns the current 1-minute window's usage for a provider, split by
-- plan tier — exactly the shape ProviderBucketUsage expects in
-- pricing-config.ts's checkProviderCapacity().
create or replace function public.get_provider_bucket_usage(p_provider text)
returns table (
  plan_id text,
  requests bigint,
  tokens bigint
)
language sql
security definer
as $$
  select
    plan_id,
    coalesce(sum(requests), 0) as requests,
    coalesce(sum(tokens), 0) as tokens
  from public.provider_usage_log
  where provider = p_provider
    and created_at >= now() - interval '1 minute'
  group by plan_id;
$$;

-- Call this immediately after a successful Groq/Gemini call returns, using
-- its REAL token usage — logging before the call (with an estimate) means
-- a failed or retried call still counts twice against the shared bucket.
create or replace function public.log_provider_usage(
  p_provider text,
  p_model_id text,
  p_plan_id text,
  p_user_id uuid,
  p_tokens integer
) returns void
language sql
security definer
as $$
  insert into public.provider_usage_log (provider, model_id, plan_id, user_id, requests, tokens)
  values (p_provider, p_model_id, p_plan_id, p_user_id, 1, p_tokens);
$$;

-- Rate limits: SAME ceiling for every plan — this throttles how fast a
-- single user can spend credits (protects shared inference capacity from
-- a burst script or runaway loop), separate from monthly_quota which
-- differs per plan. Free Starter's small monthly allowance (100 credits)
-- almost always runs out before these windows would bind; for Growth Pro
-- / Enterprise this is what actually caps a heavy session.
--
-- rate_limit_override lets support raise the ceiling for a specific
-- Enterprise account by contract, without changing the shared default.
alter table public.credit_wallets
  add column if not exists five_hour_limit_override integer,
  add column if not exists weekly_limit_override integer;

create or replace function public.deduct_credits(
  p_user_id uuid,
  p_workspace_id uuid,
  p_action text,
  p_model_id text,
  p_cost_multiplier numeric,
  p_prompt_tokens integer,
  p_completion_tokens integer,
  p_base_credits integer,
  p_token_metered boolean
) returns table (
  success boolean,
  credits_deducted integer,
  new_balance integer,
  denial_reason text
)
language plpgsql
security definer
as $$
declare
  v_wallet public.credit_wallets;
  v_total_tokens integer := p_prompt_tokens + p_completion_tokens;
  v_token_credits integer := ceil(v_total_tokens::numeric / 250);
  v_credits integer;
  v_five_hour_limit integer := 150; -- default shared ceiling, see RATE_LIMITS in pricing-config.ts
  v_weekly_limit integer := 500;    -- default shared ceiling, see RATE_LIMITS in pricing-config.ts
  v_five_hour_used integer;
  v_weekly_used integer;
begin
  select * into v_wallet from public.credit_wallets where user_id = p_user_id for update;

  v_five_hour_limit := coalesce(v_wallet.five_hour_limit_override, v_five_hour_limit);
  v_weekly_limit := coalesce(v_wallet.weekly_limit_override, v_weekly_limit);

  if p_token_metered then
    v_credits := greatest(p_base_credits, round(v_token_credits * p_cost_multiplier));
  else
    v_credits := greatest(1, round(p_base_credits * p_cost_multiplier));
  end if;

  select coalesce(sum(credits_deducted), 0) into v_five_hour_used
    from public.credit_transactions
    where user_id = p_user_id and created_at >= now() - interval '5 hours';

  select coalesce(sum(credits_deducted), 0) into v_weekly_used
    from public.credit_transactions
    where user_id = p_user_id and created_at >= now() - interval '7 days';

  if v_five_hour_used + v_credits > v_five_hour_limit then
    return query select false, 0, v_wallet.balance, format('5-hour usage limit reached (%s credits). Resets on a rolling basis.', v_five_hour_limit);
    return;
  end if;

  if v_weekly_used + v_credits > v_weekly_limit then
    return query select false, 0, v_wallet.balance, format('Weekly usage limit reached (%s credits). Resets on a rolling 7-day basis.', v_weekly_limit);
    return;
  end if;

  if v_wallet.balance < v_credits then
    return query select false, 0, v_wallet.balance, 'Insufficient credit balance for this plan.';
    return;
  end if;

  update public.credit_wallets
    set balance = balance - v_credits, updated_at = now()
    where user_id = p_user_id;

  insert into public.credit_transactions
    (user_id, workspace_id, action, model_id, prompt_tokens, completion_tokens, credits_deducted, balance_after)
  values
    (p_user_id, p_workspace_id, p_action, p_model_id, p_prompt_tokens, p_completion_tokens, v_credits, v_wallet.balance - v_credits);

  return query select true, v_credits, v_wallet.balance - v_credits, null::text;
end;
$$;

-- Workspace-creation guard: enforce plan.workspace_limit + purchased add-ons
-- server-side too, so the free-tier localStorage check in
-- workspace-plan-limit.ts becomes a UX convenience, not the real gate.
-- Housekeeping: provider_usage_log grows fast at real traffic volume and
-- is only ever queried for the last 1 minute — prune it on a schedule
-- (pg_cron or an external cron hitting an Edge Function) rather than
-- letting it grow unbounded:
--   delete from public.provider_usage_log where created_at < now() - interval '1 day';

create or replace function public.can_create_workspace(p_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_plan_id text;
  v_limit integer;
  v_extra integer;
  v_count integer;
begin
  select s.plan_id, s.extra_workspaces into v_plan_id, v_extra
    from public.subscriptions s
    where s.user_id = p_user_id and s.status = 'active'
    order by s.created_at desc limit 1;

  if v_plan_id is null then
    v_plan_id := 'free_starter';
    v_extra := 0;
  end if;

  select workspace_limit into v_limit from public.plans where id = v_plan_id;

  if v_limit is null then
    return true; -- unlimited (enterprise)
  end if;

  select count(*) into v_count from public.workspaces where owner_id = p_user_id;

  return v_count < (v_limit + coalesce(v_extra, 0));
end;
$$;

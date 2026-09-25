# BizzMitra — Pricing & Plan Architecture

This document explains **how plans, workspaces, and credits are distributed**
across Free Starter, Growth Pro, and Enterprise Scale — and the reasoning
behind every number, so you (or anyone on the team) can justify or adjust
them later without guessing.

Companion files:
- `pricing-config.ts` — the actual code (plans, feature costs, models, helper functions)
- `20261001_plans_and_credits.sql` — server-side tables + enforcement (Supabase)

---

## 1. The core idea: Credits = standardized AI cost

A **credit** is a unit pegged to your cheapest model, **Gemini 2.0 Flash = 1.0×**.
Every other model has a `costMultiplier` relative to that baseline:

| Model | Tier required | Cost multiplier |
|---|---|---|
| Gemini 2.0 Flash | Free Starter | 1.0× |
| DeepSeek V3 Reasoner | Enterprise Scale | 1.5× |
| GPT-4o Omnichannel | Growth Pro | 2.0× |
| Claude 3.5 Sonnet | Growth Pro | 2.5× |

**Real cost of any AI action = `base credits × model multiplier`.**
So the same feature costs more credits if the user picks a pricier model —
this is what makes the pricing "API/parameter based" instead of a flat
dummy number per plan.

> ⚠️ These multipliers are ratios, not absolute prices. Re-check them
> against current provider pricing pages before you finalize — token
> prices move.

---

## 2. Every feature has its own cost, not one flat number

The mistake in the old dummy pricing was charging a flat "credits/mo" pool
with no connection to what each button actually does. A one-line AI
Copilot reply and a full HLD+LLD+DDL+REST blueprint synthesis do **not**
cost the same in tokens, so they shouldn't cost the same in credits.

| Feature (what the user clicks) | Base credits (Gemini) | Billing method |
|---|---|---|
| AI Copilot chat turn | 1 (floor) | Real tokens used, `⌈tokens/250⌉` |
| Discovery interview turn | 2 (floor) | Real tokens used |
| Confidence / maturity score recalc | 3 | Flat |
| Export — basic HLD (PDF) | 5 | Flat |
| Roadmap regenerate | 12 | Flat |
| Solution Studio regenerate | 15 | Flat |
| Wireframe generate | 18 | Flat |
| Export — full deliverable pack + pitch deck | 20 | Flat |
| Data model (PostgreSQL DDL + REST API spec) | 20 | Flat |
| BPMN process pipeline | 20 | Flat |
| HLD/LLD architecture regenerate | 25 | Flat |
| **Full blueprint synthesis** (everything at once) | **50** | Flat |

Two billing methods, by design:
- **Token-metered** (chat-style actions): cost tracks exactly what the
  model actually used — cheap short messages stay cheap.
- **Flat** (structured generation actions): predictable cost regardless of
  how verbose the AI's output is, so a user can't be overcharged for a
  chatty model.

---

## 3. Plan quotas are sized *against* that cost table

Once you know what things cost, plan credit quotas stop being arbitrary:

| | Free Starter | Growth Pro | Enterprise Scale |
|---|---|---|---|
| Price | ₹0 | ₹3,999/mo (₹3,199 annual) | ₹15,999/mo (custom above) |
| Monthly credits | 100 | 1,000 | 5,000 (negotiable) |
| What that roughly buys | ~1 full blueprint synthesis + light chat/regeneration | ~15–20 full blueprints, or many smaller regenerations across several client workspaces | High-volume usage across an unlimited client roster |

Free's 100 credits is deliberately just enough for **one real "wow"
moment** (one full blueprint) plus enough chat to explore — enough to
evaluate the product, not enough to run a business on for free.

---

## 4. Workspace allocation

| | Free Starter | Growth Pro | Enterprise Scale |
|---|---|---|---|
| Workspaces included | **1** (hard cap) | **5** | Unlimited (fair-use monitored) |
| Extra workspace add-on | Not purchasable — forces upgrade | ₹499/month per extra | N/A |
| Seats | 1 | 8 | Unlimited |

**Why Growth Pro is capped at 5, not "unlimited":** a workspace isn't
free to keep alive even when idle — it holds ongoing artifacts, versioned
diagrams, and AI context. "Unlimited workspaces" on a flat seat+credit
price would let one ₹3,999/mo subscription silently serve unlimited
client tenants, breaking the pricing model. Capping and selling extra
slots as an add-on keeps workspace count a real cost lever, the same way
Free's 1-workspace cap already works today — just extended upward
instead of jumping straight to infinity at the next tier.

---

## 5. Feature gating by plan

Not every feature is available on every plan — this is the second lever
(alongside credits) that makes upgrading worth it:

| | Free Starter | Growth Pro | Enterprise Scale |
|---|---|---|---|
| Core generation (blueprint, architecture, data model, roadmap) | ✅ | ✅ | ✅ |
| BPMN process pipelines | ❌ | ✅ | ✅ |
| Wireframe generation | ❌ | ✅ | ✅ |
| CRM / insights AI analysis | ❌ | ✅ | ✅ |
| Export: basic HLD (PDF) | ✅ | ✅ | ✅ |
| Export: full deliverable pack + pitch deck | ❌ | ✅ | ✅ |
| AI models | Gemini Flash only | + GPT-4o, Claude 3.5 Sonnet | + DeepSeek V3 |
| Credit top-ups when quota runs out | ❌ | ✅ | ✅ |
| Support | Community | Priority (4h SLA) | Dedicated architect |

---

## 6. Rate limits — same for every plan, on purpose

Separate from the monthly quota (which *differs* per plan), every plan
shares the **same** short-window throttle:

| Window | Limit (all plans) |
|---|---|
| Rolling 5 hours | 150 credits |
| Rolling 7 days | 500 credits |

This isn't a pricing lever — it's infra protection. A Free user and an
Enterprise user both hammering "regenerate" 30 times in an hour put the
same load on the AI provider, so both get capped the same way regardless
of how much they're paying.

**How this plays out on Free Starter:** a Free user works through their
one workspace (discovery → blueprint → export) by spending their 100
monthly credits on AI Copilot questions and regenerations. Those spends
draw from the *same* 5-hour/weekly buckets as every other plan — they
just almost never hit the rate limit, because their much smaller monthly
quota (100 credits) runs out first. For Growth Pro and Enterprise, the
rate limit is what actually caps a heavy single session, since their
monthly quota (1,000 / 5,000) is large enough to hit the weekly ceiling
before month-end.

If a specific Enterprise account contractually needs a higher ceiling,
raise it per-account (`five_hour_limit_override` / `weekly_limit_override`
in the SQL) rather than changing the shared default for everyone.

---

## 7. Dividing your Groq/Gemini key across users (provider buckets)

This is the piece that's easy to miss: **Groq and Gemini give the rate
limit to your account/project as a whole — not to each of your
subscribers.** They have no concept of "Free user" vs "Enterprise user."
If you don't divide it yourself, one Free-tier user running a loop can
eat your entire shared TPM and 429 a paying Enterprise customer at the
same moment.

**Roughly what Groq/Gemini actually give you** (illustrative — pull your
real numbers from `console.groq.com/settings/limits` and Google AI
Studio, they change with your spend tier):

| Provider | RPM | TPM | RPD |
|---|---|---|---|
| Groq (free tier) | ~30 | ~15,000 | ~14,400 |
| Gemini 2.0 Flash (free tier) | ~15 | ~1,000,000 | ~200 |

**How the division works — two layers, checked in order:**

1. **Per-user throttle** (`checkRateLimit`, section 6) — same 150 credits/5h
   and 500 credits/week ceiling for every user, regardless of plan. Stops
   any single account from being the problem.
2. **Per-plan-tier bucket** (`checkProviderCapacity`, new) — the *shared*
   Groq/Gemini ceiling gets carved into reserved slices per plan tier:

   | Plan | Reserved share of shared capacity |
   |---|---|
   | Enterprise Scale | 30% |
   | Growth Pro | 55% |
   | Free Starter | 15% |

   A plan tier can **borrow** another tier's currently-unused slice (so a
   quiet night doesn't waste Enterprise's reserved 30%), but the instant a
   higher-priority tier needs that capacity back, lower-priority
   borrowing is the first thing cut off. In practice: Free users get
   pushed to "try again shortly" before Growth Pro or Enterprise ever
   feel it.

**Worked example** — Groq TPM = 15,000. At a quiet moment, Free Starter
is using 500 tokens against its reserved 2,250 (15%), Growth Pro is using
9,000 against its reserved 8,250 (55%, already borrowing 750 from idle
Enterprise slack) — a new Free request for 200 tokens is still allowed
because it's under its own reserved slice. If Enterprise traffic then
spikes and claims its reserved 4,500, Growth Pro's borrowed 750 gets
reclaimed first, then Growth Pro is capped at its own 8,250 — Free's
reserved 2,250 is untouched throughout, because reserved shares are a
floor, not first-come-first-served.

**Where this needs to live:** the counters this depends on
(`ProviderBucketUsage.global` / `.byPlan`) must be shared, low-latency,
and accurate across every concurrent request — a plain in-memory variable
in one server process won't see requests handled by another process. Use
Redis (`INCR` with a 60-second TTL, keyed `provider:model:plan`) once you
have real traffic. `20261001_plans_and_credits.sql` includes a Postgres
`provider_usage_log` table + `get_provider_bucket_usage()` /
`log_provider_usage()` functions as a dev/staging fallback and audit
trail — swap the read path for Redis first as you scale, since Postgres
row scanning becomes the bottleneck before Groq/Gemini's own limit does.

**Call order for every AI request:**
1. `canUseFeature` / `canUseModel` — is this plan even allowed to do this?
2. `checkRateLimit` — has this *user* hit their 5h/weekly ceiling?
3. `checkProviderCapacity` — is there room in this *plan tier's* slice of the shared Groq/Gemini bucket right now?
4. Make the actual Groq/Gemini call.
5. `log_provider_usage()` with the real token count from the response — never the estimate.
6. `deduct_credits()` with the real token count.

---

## 8. Credit top-up packs (paid plans only)

For when a busy team burns through their monthly quota before renewal —
priced with a small premium over the plan's effective per-credit rate,
so upgrading the plan is still the better deal long-term:

| Pack | Credits | Price |
|---|---|---|
| Small | 150 | ₹699 |
| Medium | 500 | ₹2,099 |
| Large | 2,000 | ₹7,499 |

Free Starter cannot buy top-ups — running out is the intended nudge to
upgrade (standard freemium lever). Top-up credits still count against the
same shared 5-hour/weekly rate limits above — buying more credits doesn't
buy a higher spend rate.

---

## 9. Where this needs to live (important)

Today, plan tier and credit balance are stored in **localStorage**
(`bizzmitra.creditWallet`). That's fine for a demo, but it means a user
can edit it in devtools and grant themselves unlimited Enterprise
credits — nothing is actually enforced by the server.

`20261001_plans_and_credits.sql` moves the source of truth to Supabase:

- `plans` — the table version of the plan config above
- `subscriptions` — which plan a user is on, extra workspace add-ons purchased
- `credit_wallets` / `credit_transactions` — real balance + audit log, writable only through a `SECURITY DEFINER` function
- `deduct_credits()` — call this **after** the real AI provider response comes back, using its actual `usage.prompt_tokens` / `usage.completion_tokens` — never trust a client-reported token count for billing
- `can_create_workspace()` — server-side version of the workspace cap check, so the client-side check in `workspace-plan-limit.ts` becomes a UX convenience, not the real gate

Row Level Security is set so the client can only **read** its own
subscription/wallet — never write it directly.

---

## 10. How to use `pricing-config.ts` in the app

```ts
import { calculateCreditCost, canCreateWorkspace, canUseFeature, canUseModel, PLANS } from "@/lib/pricing-config";

// Before letting a user click "generate":
if (!canUseFeature(userPlanId, "wireframe_generate")) {
  // show upgrade prompt
}

// Before deducting credits for a flat-cost action:
const cost = calculateCreditCost("full_blueprint_synthesis", activeModelId);

// Before deducting credits for a token-metered action (e.g. AI Copilot):
const cost = calculateCreditCost("ai_copilot_turn", activeModelId, {
  promptTokens, completionTokens,
});

// Before letting a user create a new workspace:
const { allowed, reason } = canCreateWorkspace(userPlanId, currentWorkspaceCount);

// Before deducting credits, also check the shared rate limit (same for every plan):
const rate = checkRateLimit(recentTransactions, cost);
if (!rate.allowed) {
  // show rate.reason — e.g. "5-hour usage limit reached (150 credits)."
}

// Then check there's room in this plan's slice of the shared Groq/Gemini bucket:
const provider = PROVIDERS[PROVIDER_FOR_MODEL[activeModelId]];
const bucket = checkProviderCapacity(provider, userPlanId, estimatedTokens, currentBucketUsage);
if (!bucket.allowed) {
  // show bucket.reason — e.g. "Free tier's share of shared AI capacity is busy right now."
}

// Only now call Groq/Gemini — then log real usage and deduct real credits
// using the response's actual token counts, not the estimate.
```

This keeps every plan/credit/workspace decision reading from **one file**
instead of numbers scattered across `admin-rbac-data.ts` and
`Pricing13.tsx`.

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);

    // Direct registration endpoint using Supabase service role key (bypasses SMTP deliverability issues)
    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      try {
        const body = (await request.json()) as { email?: string; password?: string; fullName?: string };
        const email = body.email?.trim().toLowerCase();
        const password = body.password;
        const fullName = body.fullName?.trim();

        if (!email || !password) {
          return new Response(JSON.stringify({ error: "Email and password are required." }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const supabaseUrl =
          (env as any)?.SUPABASE_URL ||
          (env as any)?.VITE_SUPABASE_URL ||
          process.env.SUPABASE_URL ||
          process.env.VITE_SUPABASE_URL ||
          "https://pyqbmgkusnvyyjdsyqyj.supabase.co";

        const serviceRoleKey =
          (env as any)?.SUPABASE_SERVICE_ROLE_KEY ||
          process.env.SUPABASE_SERVICE_ROLE_KEY ||
          "sb_secret_r-9ktd2UNo0Dv1xZEJwhLQ_PQBKXa5n";

        const { createClient } = await import("@supabase/supabase-js");
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });

        // 1. Create or confirm user in Supabase Auth
        const { data: userRes, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName || email.split("@")[0] },
        });

        if (createErr) {
          // If already exists, update user password and confirm
          if (
            createErr.message.toLowerCase().includes("already") ||
            createErr.message.toLowerCase().includes("exists")
          ) {
            const { data: listRes } = await supabaseAdmin.auth.admin.listUsers();
            const existing = listRes?.users?.find((u) => u.email?.toLowerCase() === email);
            if (existing) {
              await supabaseAdmin.auth.admin.updateUserById(existing.id, {
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName || email.split("@")[0] },
              });
              await supabaseAdmin.from("profiles").upsert({
                id: existing.id,
                full_name: fullName || email.split("@")[0],
                plan: "free",
              });
              return new Response(JSON.stringify({ success: true, userId: existing.id }), {
                status: 200,
                headers: { "content-type": "application/json" },
              });
            }
          }
          return new Response(JSON.stringify({ error: createErr.message }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        // 2. Insert profile record in public.profiles table
        if (userRes?.user) {
          await supabaseAdmin.from("profiles").upsert({
            id: userRes.user.id,
            full_name: fullName || email.split("@")[0],
            plan: "free",
          });
        }

        return new Response(JSON.stringify({ success: true, userId: userRes?.user?.id }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err?.message || "Registration failed" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }

    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

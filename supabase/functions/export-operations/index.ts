import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*"
};

function csvEscape(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function asDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { headers: corsHeaders, status: 405 });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return Response.json({ error: "Missing authorization header" }, { headers: corsHeaders, status: 401 });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: userError
    } = await userClient.auth.getUser(token);

    if (userError || !user) {
      return Response.json({ error: "Invalid user session" }, { headers: corsHeaders, status: 401 });
    }

    const { data: callerProfile, error: callerError } = await adminClient
      .from("staff_profiles")
      .select("permission_role")
      .eq("id", user.id)
      .single();

    if (callerError || callerProfile?.permission_role !== "admin") {
      return Response.json({ error: "Only admins can export operations data" }, { headers: corsHeaders, status: 403 });
    }

    const body = await req.json();
    const kind = body.kind === "report_summary" ? "report_summary" : "visitor_logs";

    if (kind === "visitor_logs") {
      const query = typeof body.query === "string" && body.query.trim() ? body.query.trim() : undefined;
      const status = typeof body.status === "string" && body.status.trim() ? body.status.trim() : "all";

      const { data, error } = await userClient.rpc("list_admin_visitor_logs", {
        p_limit: 5000,
        p_offset: 0,
        p_query: query,
        p_status: status
      });

      if (error) {
        return Response.json({ error: error.message }, { headers: corsHeaders, status: 400 });
      }

      const headers = [
        "reference_code",
        "visitor_name",
        "visitor_email",
        "visitor_phone",
        "visitor_organization",
        "host_name",
        "host_email",
        "department_name",
        "entrance_name",
        "purpose",
        "scheduled_for",
        "status",
        "risk_level",
        "check_in_at",
        "check_out_at"
      ];

      const lines = [headers.join(",")];
      for (const row of data ?? []) {
        lines.push(
          [
            csvEscape(row.reference_code),
            csvEscape(row.visitor_name),
            csvEscape(row.visitor_email),
            csvEscape(row.visitor_phone),
            csvEscape(row.visitor_organization),
            csvEscape(row.host_name),
            csvEscape(row.host_email),
            csvEscape(row.department_name),
            csvEscape(row.entrance_name),
            csvEscape(row.purpose),
            csvEscape(row.scheduled_for),
            csvEscape(row.status),
            csvEscape(row.risk_level),
            csvEscape(row.check_in_at),
            csvEscape(row.check_out_at)
          ].join(",")
        );
      }

      return Response.json(
        {
          content: lines.join("\n"),
          filename: `visitor-logs-${asDateStamp()}.csv`,
          mimeType: "text/csv;charset=utf-8"
        },
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    const [{ data: summary, error: summaryError }, { data: activity, error: activityError }] = await Promise.all([
      userClient.rpc("get_admin_report_summary"),
      userClient.rpc("list_recent_visit_activity", { p_limit: 20 })
    ]);

    if (summaryError) {
      return Response.json({ error: summaryError.message }, { headers: corsHeaders, status: 400 });
    }

    if (activityError) {
      return Response.json({ error: activityError.message }, { headers: corsHeaders, status: 400 });
    }

    return Response.json(
      {
        content: JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            reportSummary: summary?.[0] ?? null,
            recentActivity: activity ?? []
          },
          null,
          2
        ),
        filename: `report-summary-${asDateStamp()}.json`,
        mimeType: "application/json"
      },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 500
      }
    );
  }
});

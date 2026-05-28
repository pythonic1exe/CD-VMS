import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*"
};

const defaultAppUrl = "https://cd-vms.vercel.app";

function normalizeBaseUrl(value: string | null | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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
      return Response.json({ error: "Only admins can invite staff" }, { headers: corsHeaders, status: 403 });
    }

    const body = await req.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const fullName = String(body.fullName ?? "").trim();
    const permissionRole = body.permissionRole === "admin" ? "admin" : "host";
    const departmentId = body.departmentId ? String(body.departmentId) : null;
    const canHostVisits = permissionRole === "host";
    const jobTitle = String(body.jobTitle ?? (permissionRole === "admin" ? "Admin / Security" : "Host")).trim();

    if (!email || !fullName) {
      return Response.json({ error: "Email and full name are required" }, { headers: corsHeaders, status: 400 });
    }

    if (canHostVisits && !departmentId) {
      return Response.json({ error: "A department is required when inviting a host" }, { headers: corsHeaders, status: 400 });
    }

    const redirectBaseUrl = normalizeBaseUrl(Deno.env.get("PUBLIC_APP_URL")) ?? defaultAppUrl;
    const redirectTo = new URL("/auth/callback?next=/reset-password", redirectBaseUrl).toString();

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        can_host_visits: canHostVisits,
        full_name: fullName,
        job_title: jobTitle
      },
      redirectTo
    });

    if (inviteError) {
      return Response.json({ error: inviteError.message }, { headers: corsHeaders, status: 400 });
    }

    const invitedUserId = inviteData.user?.id;
    if (!invitedUserId) {
      return Response.json({ error: "Invite completed without a user id" }, { headers: corsHeaders, status: 500 });
    }

    const { error: profileError } = await adminClient
      .from("staff_profiles")
      .update({
        account_status: "invited",
        can_host_visits: canHostVisits,
        department_id: departmentId,
        full_name: fullName,
        job_title: jobTitle,
        permission_role: permissionRole
      })
      .eq("id", invitedUserId);

    if (profileError) {
      return Response.json({ error: profileError.message }, { headers: corsHeaders, status: 400 });
    }

    return Response.json(
      {
        email,
        id: invitedUserId,
        permissionRole
      },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
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

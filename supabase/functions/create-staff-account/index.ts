import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => {
  return Response.json(
    {
      error: "This bootstrap account-creation function has been disabled. Use invite-staff instead."
    },
    {
      status: 410,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
});

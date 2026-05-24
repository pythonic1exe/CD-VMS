import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => {
  return Response.json(
    {
      error: "This bootstrap repair function has been disabled."
    },
    {
      status: 410,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
});

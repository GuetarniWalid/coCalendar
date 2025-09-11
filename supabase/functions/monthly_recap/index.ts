// @ts-ignore
Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const clientId = url.searchParams.get('client_id');
    const month = url.searchParams.get('month');
    return new Response(JSON.stringify({ clientId, month, total_minutes: 0 }), { headers: { "content-type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { "content-type": "application/json" } });
  }
});



// @ts-ignore
Deno.serve(async req => {
  if (req.method !== 'POST')
    return new Response('Method Not Allowed', { status: 405 });
  try {
    const body = await req.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok: true, body }), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});

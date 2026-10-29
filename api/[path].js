const FORWARDED_HEADERS = ['accept', 'content-type', 'cookie', 'user-agent'];

export default async function handler(req, res) {
  const apiOrigin = process.env.API_ORIGIN;
  const proxySecret = process.env.PROXY_SECRET;
  if (!apiOrigin || !proxySecret) {
    return res.status(503).json({ error: 'The API proxy is not configured. Set API_ORIGIN and PROXY_SECRET in Vercel.' });
  }

  let target;
  try {
    const origin = new URL(apiOrigin);
    if (origin.protocol !== 'https:') throw new Error('HTTPS is required.');
    const incoming = new URL(req.url, 'https://vercel.invalid');
    target = new URL(`${incoming.pathname}${incoming.search}`, origin);
  } catch {
    return res.status(500).json({ error: 'The API_ORIGIN setting is invalid.' });
  }

  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = req.headers[name];
    if (value) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  }
  headers.set('x-mystery-proxy-secret', proxySecret);
  headers.set('cache-control', 'no-store');

  let body;
  if (!['GET', 'HEAD'].includes(req.method)) {
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) body = req.body;
    else if (req.body !== undefined) body = JSON.stringify(req.body);
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      signal: AbortSignal.timeout(115_000),
      redirect: 'manual',
    });
    res.status(upstream.status);
    res.setHeader('cache-control', 'no-store');
    for (const name of ['content-type', 'retry-after']) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    const cookies = upstream.headers.getSetCookie?.();
    if (cookies?.length) res.setHeader('set-cookie', cookies);
    const location = upstream.headers.get('location');
    if (location) res.setHeader('location', location);
    const payload = Buffer.from(await upstream.arrayBuffer());
    return res.end(payload);
  } catch {
    return res.status(502).json({ error: 'The hosted investigation API is temporarily unavailable. Please retry shortly.' });
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './[...path].js';

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    status(code) { this.statusCode = code; return this; },
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    json(value) { this.payload = value; return this; },
    end(value) { this.payload = value; return this; },
  };
}

test('Vercel proxy returns a setup message when its deployment variables are missing', async () => {
  const originalOrigin = process.env.API_ORIGIN;
  const originalSecret = process.env.PROXY_SECRET;
  delete process.env.API_ORIGIN;
  delete process.env.PROXY_SECRET;
  const response = mockResponse();
  await handler({ method: 'GET', url: '/api/health', headers: {} }, response);
  assert.equal(response.statusCode, 503);
  assert.match(response.payload.error, /API_ORIGIN and PROXY_SECRET/);
  if (originalOrigin === undefined) delete process.env.API_ORIGIN; else process.env.API_ORIGIN = originalOrigin;
  if (originalSecret === undefined) delete process.env.PROXY_SECRET; else process.env.PROXY_SECRET = originalSecret;
});

test('Vercel proxy forwards API paths and session cookies, then relays Set-Cookie', async () => {
  const originalOrigin = process.env.API_ORIGIN;
  const originalSecret = process.env.PROXY_SECRET;
  const originalFetch = global.fetch;
  process.env.API_ORIGIN = 'https://mystery-api.example.onrender.com';
  process.env.PROXY_SECRET = 'test-proxy-secret';
  let calledUrl; let calledOptions;
  global.fetch = async (url, options) => {
    calledUrl = String(url); calledOptions = options;
    return new Response(JSON.stringify({ status: 'ok' }), { status: 200, headers: {
      'content-type': 'application/json',
      'set-cookie': 'mystery_session=opaque; Path=/; HttpOnly; Secure; SameSite=Lax',
    } });
  };
  try {
    const response = mockResponse();
    await handler({ method: 'GET', url: '/api/health?probe=1', headers: { cookie: 'mystery_session=opaque' } }, response);
    assert.equal(calledUrl, 'https://mystery-api.example.onrender.com/api/health?probe=1');
    assert.equal(calledOptions.headers.get('cookie'), 'mystery_session=opaque');
    assert.equal(calledOptions.headers.get('x-mystery-proxy-secret'), 'test-proxy-secret');
    assert.equal(response.statusCode, 200);
    assert.match(response.headers['set-cookie'][0], /HttpOnly/);
    assert.equal(response.payload.toString(), JSON.stringify({ status: 'ok' }));
  } finally {
    global.fetch = originalFetch;
    if (originalOrigin === undefined) delete process.env.API_ORIGIN; else process.env.API_ORIGIN = originalOrigin;
    if (originalSecret === undefined) delete process.env.PROXY_SECRET; else process.env.PROXY_SECRET = originalSecret;
  }
});

// www -> apex (301, path and query kept); directory paths serve their index.html;
// everything else is served from the static assets (html_handling is "none").
// Missing pages get the branded 404.html with a real 404 status.
// Every response gets basic security headers.
// Deploys automatically from GitHub main via Cloudflare Workers Builds.
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

function secure(res, status) {
  const out = new Response(res.body, { status: status ?? res.status, statusText: res.statusText, headers: res.headers });
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) out.headers.set(k, v);
  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.fieldforcemedia.com') {
      url.hostname = 'fieldforcemedia.com';
      return Response.redirect(url.toString(), 301);
    }
    let res;
    if (url.pathname.endsWith('/')) {
      url.pathname += 'index.html';
      res = await env.ASSETS.fetch(new Request(url, request));
    } else {
      res = await env.ASSETS.fetch(request);
    }
    if (res.status === 404 && (request.method === 'GET' || request.method === 'HEAD')) {
      const nf = await env.ASSETS.fetch(new Request(new URL('/404.html', url), request));
      if (nf.ok) return secure(nf, 404);
    }
    return secure(res);
  },
};

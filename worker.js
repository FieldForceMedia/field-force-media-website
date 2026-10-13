// www -> apex (301, path and query kept); directory paths serve their index.html;
// everything else is served from the static assets (html_handling is "none").
// Deploys automatically from GitHub main via Cloudflare Workers Builds.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.fieldforcemedia.com') {
      url.hostname = 'fieldforcemedia.com';
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.endsWith('/')) {
      url.pathname += 'index.html';
      return env.ASSETS.fetch(new Request(url, request));
    }
    return env.ASSETS.fetch(request);
  },
};

// www -> apex (301, path and query kept); everything else is served from the static assets.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.fieldforcemedia.com') {
      url.hostname = 'fieldforcemedia.com';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};

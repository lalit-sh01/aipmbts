// Sends every visitor to one address: https://lalitshewani.com.
// www.lalitshewani.com and the old workers.dev address get a permanent (301) redirect,
// keeping the path and query. Everything else is served from the built site in dist/.
// Preview URLs (<version>-aipmbts.lalit-shewani01.workers.dev) and local dev are left alone.
const HOME = 'lalitshewani.com';
const REDIRECT_FROM = new Set(['www.lalitshewani.com', 'aipmbts.lalit-shewani01.workers.dev']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (REDIRECT_FROM.has(url.hostname)) {
      url.protocol = 'https:';
      url.hostname = HOME;
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};

/**
 * Pass through every request to the origin without user-agent-specific HTML.
 *
 * The GitHub Pages build already prerenders page-specific SEO and social metadata
 * (canonical, hreflang, Open Graph, Twitter, and Product JSON-LD).
 *
 * Returning separate, generic HTML to Googlebot and other crawlers can hide the
 * real page content, collapse page-specific canonical signals, and turn origin
 * 404 responses into misleading 200 responses.
 *
 * Keep the original request, URL, status, headers, and response body unchanged.
 * Do not add a custom redirect or a crawler-only fallback here.
 */
export default {
  async fetch(request) {
    return fetch(request);
  },
};

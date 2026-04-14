/**
 * Image optimization utilities.
 *
 * All self-hosted product images live on cdn.tcdashop.com and have matching
 * WebP counterparts at the same path with a .webp extension.
 * External images (Printful CDN, etc.) are served as-is.
 */

const CDN_BASE = "https://cdn.tcdashop.com";

/**
 * Returns a WebP URL for CDN-hosted images.
 * Returns null for Printful or other external URLs — they have no WebP variant.
 *
 * Example:
 *   https://cdn.tcdashop.com/products/abc/img.jpg
 *   → https://cdn.tcdashop.com/products/abc/img.webp
 */
export function toCdnWebpUrl(url: string | null | undefined): string | null {
  if (!url || !url.startsWith(CDN_BASE)) return null;
  return url.replace(/\.(jpg|jpeg|png)$/i, ".webp");
}

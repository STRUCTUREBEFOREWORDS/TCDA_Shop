export function pushDataLayer(event: string, data: Record<string, unknown>): void {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

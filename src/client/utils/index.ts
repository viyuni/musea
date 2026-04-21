export function resolvePreviewUrl(url: string) {
  return new URL(url.endsWith('/') ? url : `${url}/`, window.location.origin);
}

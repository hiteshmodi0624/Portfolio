/** Hostname for display: parsed with the URL API, leading "www." dropped —
 * the PDF's browser bars and link pills show "ditchnavigation.com", never
 * "www.ditchnavigation.com". Content URLs are schema-validated https, so
 * parsing never throws at render time. */
export function displayHost(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '')
}

export function isHtmlEmpty(html: string | null | undefined): boolean {
  if (!html) return true;
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = doc.body.textContent?.trim() ?? "";
  return text.length === 0;
}

export const getTextSnippet = (html: string, maxLength: number = 100): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

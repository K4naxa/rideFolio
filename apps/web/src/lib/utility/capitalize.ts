export function capitalize(val: string) {
  const lowercased = String(val).toLowerCase();
  return lowercased.charAt(0).toUpperCase() + lowercased.slice(1);
}

import { type MaybeRef, unref } from "vue";

export function handleEmpty(data: MaybeRef<string | undefined>): string {
  const value = unref(data);
  return value ? value : "empty";
}

type QueryParamValue = string | number | boolean | Date | string[] | null | undefined;

/**
 * Converts a params object into a URL query string.
 * - Skips null/undefined values automatically
 * - Arrays are repeated: `key=a&key=b`
 * - Dates are serialised as ISO strings
 * - Returns an empty string when there are no params
 */
export function toQueryString(params: Record<string, QueryParamValue>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value == null) continue;

    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else if (value instanceof Date) {
      searchParams.set(key, value.toISOString());
    } else {
      searchParams.set(key, String(value));
    }
  }

  const str = searchParams.toString();
  return str ? str : "";
}

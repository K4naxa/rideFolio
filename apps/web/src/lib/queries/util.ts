import { type MaybeRef, unref } from "vue";

export function handleEmpty(data: MaybeRef<string | undefined>): string {
  const value = unref(data);
  return value ? value : "empty";
}

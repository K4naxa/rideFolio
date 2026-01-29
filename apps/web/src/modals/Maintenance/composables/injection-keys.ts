import type { MaintenancePartInput } from "@repo/validation";
import type { FieldEntry } from "vee-validate";
import type { ComputedRef, InjectionKey, Ref } from "vue";

export const PartsFieldKey: InjectionKey<{
  push: (item: MaintenancePartInput) => void;
  remove: (index: number) => void;
  update: (index: number, item: MaintenancePartInput) => void;
  replace: (items: MaintenancePartInput[]) => void;
  fields: Ref<FieldEntry<MaintenancePartInput>[]>;
}> = Symbol("PartsField");

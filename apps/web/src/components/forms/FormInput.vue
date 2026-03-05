<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useField } from "vee-validate";
import Input from "@/components/ui/input/Input.vue";
import type { IconProps } from "@/components/icons/Icon.vue";

/**
 * FormInput — vee-validate bridge component.
 */
const props = defineProps<{
  /** Field name — must match your vee-validate schema key */
  name: string;
  type: "text" | "email" | "password" | "number" | "date" | "url";
  label?: string;
  placeholder?: string;
  dataCy?: string;

  prefix?: string;
  suffix?: string;
  icon?: IconProps["name"];

  toUpperCase?: boolean;

  /**
   * Optional vee-validate validator rule string (e.g. "required").
   * Only needed if you're not using a schema-level validator.
   */
  validator?: string;
  initialValue?: string | number | null;

  validateOnChange?: boolean;
  validateOnBlur?: boolean;

  onValueChange?: (value: string | number) => void;

  class?: HTMLAttributes["class"];
  inputClass?: HTMLAttributes["class"];
}>();

const { value, errorMessage, validate, setErrors } = useField<string | number | null>(
  () => props.name,
  props.validator,
  {
    initialValue: props.initialValue ?? null,
    validateOnValueUpdate: props.validateOnChange ?? false,
  },
);

function handleChange(val: string | number | null) {
  value.value = val;
  setErrors("");
  if (props.onValueChange && val !== null) {
    props.onValueChange(val as string | number);
  }
}

async function handleBlur() {
  if (props.validateOnBlur) await validate();
}
</script>

<template>
  <Input
    v-bind="$attrs"
    :model-value="value"
    :type="props.type"
    :icon="props.icon"
    :label="props.label"
    :placeholder="props.placeholder"
    :data-cy="props.dataCy"
    :prefix="props.prefix"
    :suffix="props.suffix"
    :to-upper-case="props.toUpperCase"
    :error-message="errorMessage"
    :class="props.class"
    :input-class="props.inputClass"
    @change="handleChange"
    @blur="handleBlur"
  />
</template>

<style scoped></style>

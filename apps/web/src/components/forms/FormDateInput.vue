<script setup lang="ts">
import { useField } from "vee-validate";
import DateInput from "./DateInput.vue";

/**
 * FormDateInput — vee-validate bridge component.
 */
const props = defineProps<{
  /** Field name — must match your vee-validate schema key */
  name: string;
  label?: string;
  placeholder?: string;
  disableFuture?: boolean;
  disabled?: boolean;
  /**
   * Optional vee-validate validator rule string (e.g. "required").
   * Only needed if you're not using a schema-level validator.
   */
  validator?: string;
  initialValue?: Date;

  validateOnChange?: boolean;
}>();

const { value, errorMessage, handleChange, handleBlur } = useField<Date | null>(
  () => props.name, // Reactive getter so dynamic field names work correctly
  props.validator,
  {
    initialValue: props.initialValue ?? null,
    validateOnValueUpdate: props.validateOnChange ?? false,
  },
);
</script>

<template>
  <DateInput
    v-bind="$attrs"
    :model-value="value"
    :label="label"
    :placeholder="placeholder"
    :disable-future="disableFuture"
    :disabled="disabled"
    :error-message="errorMessage"
    @change="handleChange"
    @blur="handleBlur"
  />
</template>

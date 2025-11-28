<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useField } from "vee-validate";
import { twMerge } from "tailwind-merge";
import Label from "../label/Label.vue";

defineOptions({
  inheritAttrs: false,
});

interface InputProps {
  initialValue?: string | number | null;
  type: "text" | "email" | "password" | "number" | "date" | "search";
  name?: string;
  validator?: string;
  label?: string;
  placeholder?: string;
  dataCy?: string;
  suffix?: string;

  validateOnChange?: boolean;
  validateOnBlur?: boolean;

  toUpperCase?: boolean;

  onValueChange?: (value: string | number) => void;

  class?: HTMLAttributes["class"];
  inputClass?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<InputProps>(), {
  validator: undefined,
  initialValue: undefined,
  validateOnChange: false,
  validateOnBlur: false,

  toUpperCase: false,
});

const { value, errorMessage, validate, setErrors } = useField(props.name || "", props.validator, {
  initialValue: props.initialValue,
  validateOnValueUpdate: props.validateOnChange,
});

function handleInput() {
  if (props.toUpperCase) value.value = String(value.value).toUpperCase();
  setErrors("");

  // Call the onValueChange callback if provided
  if (props.onValueChange && value.value !== null) {
    props.onValueChange(value.value);
  }
}
async function handleBlur() {
  if (props.validateOnBlur) await validate();
}
</script>

<template>
  <div :aria-invalid="!!errorMessage" :class="['group', props.class]">
    <Label v-if="label" class="group-aria-invalid:text-destructive mb-2">{{ label }}</Label>
    <div class="relative flex-1">
      <input
        v-bind="$attrs"
        v-model="value"
        autocomplete="off"
        :type="props.type"
        :name="props.name"
        :placeholder="props.placeholder"
        :aria-invalid="!!errorMessage"
        :data-cy="props.dataCy"
        @input="handleInput"
        @blur="handleBlur"
        :class="
          twMerge(
            suffix && 'mr-12',
            'appearance-none',
            'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-input flex w-full min-w-0 rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-2',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            props.inputClass,
          )
        "
      />
      <span v-if="suffix" class="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-sm">{{
        suffix
      }}</span>
    </div>
    <p
      v-if="errorMessage"
      :data-cy="props.dataCy ? `${props.dataCy}-error` : undefined"
      class="text-destructive mt-1 ml-2 text-sm"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<style scoped>
/* Chrome, Safari, Edge, Opera */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  appearance: textfield;
}
</style>

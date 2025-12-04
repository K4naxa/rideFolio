<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";
import { useField } from "vee-validate";
import Label from "../label/Label.vue";

interface InputProps {
  class?: HTMLAttributes["class"];
  modelValue?: string;
  initialValue?: string | null;

  name: string;
  validator?: string;
  label?: string;
  placeholder?: string;

  validateOnChange?: boolean;
  validateOnBlur?: boolean;

  toUpperCase?: boolean;
}

const props = withDefaults(defineProps<InputProps>(), {
  InputProps: {
    type: String,
  },
  validator: undefined,
  initialValue: undefined,
  validateOnChange: false,
  validateOnBlur: true,

  toUpperCase: false,
});

const { value, errorMessage, validate, setErrors } = useField(props.name, props.validator, {
  initialValue: props.initialValue,
  validateOnValueUpdate: props.validateOnChange,
});

function handleInput() {
  if (props.toUpperCase) value.value = String(value.value).toUpperCase();
  setErrors("");
}

async function handleBlur() {
  if (props.validateOnBlur) await validate();
}
</script>

<template>
  <div :aria-invalid="!!errorMessage" class="group">
    <Label v-if="label" class="group-aria-invalid:text-destructive mb-2">{{ label }}</Label>

    <textarea
      v-model="value"
      :name="props.name"
      :placeholder="props.placeholder"
      :aria-invalid="!!errorMessage"
      @input="handleInput"
      @blur="handleBlur"
      :class="
        cn(
          'placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-input flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
          props.class,
        )
      "
    />
    <p v-if="errorMessage" class="text-destructive mt-1 ml-2 text-sm">{{ errorMessage }}</p>
  </div>
</template>

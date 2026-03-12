<script setup lang="ts">
import { type HTMLAttributes, useTemplateRef, type InputHTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import Label from "../label/Label.vue";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";

defineOptions({
  inheritAttrs: true,
});

interface InputProps {
  modelValue?: string | number | null;
  type: "text" | "email" | "password" | "number" | "date" | "url";
  name?: string;
  label?: string;
  icon?: IconProps["name"];
  placeholder?: string;
  autocomplete?: InputHTMLAttributes["autocomplete"];

  dataCy?: string;

  prefix?: string;
  suffix?: string;

  toUpperCase?: boolean;

  errorMessage?: string | null;
  disabled?: boolean;

  class?: HTMLAttributes["class"];
  inputClass?: HTMLAttributes["class"];
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: undefined,
  toUpperCase: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "change", value: string | number | null): void;
  (e: "blur"): void;
}>();

function handleInput(event: Event) {
  let val: string | number | null = (event.target as HTMLInputElement).value;
  if (props.toUpperCase) val = val.toUpperCase();
  emit("update:modelValue", val);
  emit("change", val);
}

function handleBlur() {
  emit("blur");
}

const inputRef = useTemplateRef("inputRef");
</script>

<template lang="html">
  <div :aria-invalid="!!errorMessage" :class="['group', props.class]">
    <Label v-if="label" class="group-aria-invalid:text-destructive mb-1 ml-1 font-medium">{{ label }}</Label>

    <!-- input wrapper-->
    <div class="inputField relative flex flex-1" @click="inputRef?.focus()" :aria-invalid="!!errorMessage">
      <Icon v-if="props.icon" :name="props.icon" class="text-muted-foreground" />

      <span v-if="props.prefix" class="text-muted-foreground text-sm">
        {{ props.prefix }}
      </span>

      <input
        v-bind="$attrs"
        :value="modelValue ?? ''"
        :type="props.type"
        ref="inputRef"
        :name="props.name"
        :autocomplete="props.autocomplete"
        :placeholder="props.placeholder"
        :aria-invalid="!!errorMessage"
        :data-cy="props.dataCy"
        :disabled="disabled"
        @input="handleInput"
        @blur="handleBlur"
        :class="
          twMerge(
            'file:text-foreground selection:bg-primary selection:text-primary-foreground flex-1 bg-transparent outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
            props.inputClass,
          )
        "
      />
      <span v-if="suffix" class="text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-sm">
        {{ suffix }}
      </span>
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

<style>
@reference "@/assets/main.css";

.inputField {
  @apply placeholder:text-muted-foreground bg-input aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-within:border-ring focus-within:ring-ring/50 flex w-full min-w-0 appearance-none items-center gap-2 rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-within:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50;
}
</style>

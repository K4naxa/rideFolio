<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { DateFormatter, fromDate, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";

import { computed, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useField } from "vee-validate";
import { useMediaQuery } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    validator?: string;
    initialValue?: Date;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    disableFuture?: boolean;
    placeholder?: string;
  }>(),
  {
    validateOnBlur: true,
    validateOnChange: false,
    initialValue: undefined,
  },
);

const open = ref(false);
const isMobile = useMediaQuery("(max-width: 768px)");

const { value, errorMessage, handleChange } = useField(props.name, props.validator, {
  initialValue: props.initialValue,
  validateOnValueUpdate: props.validateOnChange,
});

const selectedDate = ref<DateValue | undefined>(
  props.initialValue ? fromDate(new Date(props.initialValue), getLocalTimeZone()) : undefined,
);
const df = computed(
  () =>
    new DateFormatter(navigator.language, {
      dateStyle: isMobile.value ? "short" : "long",
    }),
);

function onCalendarSelect(val: DateValue | undefined) {
  selectedDate.value = val;
  handleChange(val ? val.toDate(getLocalTimeZone()) : null);
  open.value = false;
}

const formattedDate = computed(() => {
  return value.value ? df.value.format(value.value) : null;
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="font-semibold text-sm group-aria-invalid:text-destructive">{{
      label
    }}</label>
    <!-- Desktop / Tablet -->
    <div>
      <Popover v-model:open="open" key="DateInput">
        <PopoverTrigger as-child>
          <Button variant="input">
            <CalendarIcon :class="['mr-2 h-4 w-4', value ? '' : 'stroke-muted-foreground ']" />
            <span v-if="value">{{ formattedDate }}</span>
            <span v-else class="text-muted-foreground">{{ placeholder || "Pick a date" }}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" key="DateInputContent">
          <Calendar
            :v-model="selectedDate"
            @update:model-value="onCalendarSelect"
            initial-focus
            :disable-future-dates="disableFuture"
          />
        </PopoverContent>
      </Popover>
    </div>

    <!-- Validation error -->
    <p v-if="errorMessage" class="text-red-500 text-xs mt-1">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { DateFormatter, fromDate, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";

import { computed, onMounted, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useField } from "vee-validate";

const props = withDefaults(
  defineProps<{
    name: string;
    label?: string;
    validator?: string;
    initialValue?: Date;
    validateOnBlur?: boolean;
    validateOnChange?: boolean;
    disableFuture?: boolean;
  }>(),
  {
    validateOnBlur: true,
    validateOnChange: false,
    initialValue: undefined,
  },
);

const open = ref(false);
const isMobile = ref(false);
onMounted(() => {
  isMobile.value = window.innerWidth < 768; // switch threshold as you like
});

const { value, errorMessage, handleChange } = useField(props.name, props.validator, {
  initialValue: props.initialValue,
  validateOnValueUpdate: props.validateOnChange,
});

const selectedDate = ref<DateValue | undefined>(
  props.initialValue ? fromDate(new Date(props.initialValue), getLocalTimeZone()) : undefined,
);
const df = new DateFormatter(navigator.language, {
  dateStyle: "long",
});

function onCalendarSelect(val: DateValue | undefined) {
  selectedDate.value = val;
  handleChange(val ? val.toDate(getLocalTimeZone()) : null);
  open.value = false;
}
function onNativeChange(e: Event) {
  const val = (e.target as HTMLInputElement).value;
  handleChange(val ? new Date(val) : null);
}

const formattedDate = computed(() => {
  return value.value ? df.format(value.value) : "Pick a date";
});
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="font-semibold text-sm group-aria-invalid:text-destructive">{{
      label
    }}</label>
    <!-- Desktop / Tablet -->
    <div v-if="!isMobile">
      <Popover v-model:open="open" key="DateInput">
        <PopoverTrigger as-child>
          <Button variant="input">
            <CalendarIcon class="mr-2 h-4 w-4" />
            {{ formattedDate }}
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" key="DateInputContent">
          <Calendar :v-model="selectedDate" @update:model-value="onCalendarSelect" initial-focus />
        </PopoverContent>
      </Popover>
    </div>

    <!-- Mobile -->
    <div v-else>
      <input
        type="date"
        class="rounded-md border border-input bg-background px-3 py-2 text-sm"
        :value="value ? new Date(value).toISOString().split('T')[0] : ''"
        @input="onNativeChange"
      />
    </div>

    <!-- Validation error -->
    <p v-if="errorMessage" class="text-red-500 text-xs mt-1">
      {{ errorMessage }}
    </p>
  </div>
</template>

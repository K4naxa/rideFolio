<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { DateFormatter, fromDate, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";

import { computed, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useField } from "vee-validate";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import Drawer from "@/components/ui/drawer/Drawer.vue";
import DrawerTrigger from "@/components/ui/drawer/DrawerTrigger.vue";
import DrawerContent from "@/components/ui/drawer/DrawerContent.vue";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import DrawerClose from "@/components/ui/drawer/DrawerClose.vue";

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
const isMobile = useIsMobile();

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
    <label v-if="label" class="group-aria-invalid:text-destructive text-sm font-semibold"> {{ label }} </label>
    <Popover v-if="!isMobile" v-model:open="open" key="DateInput">
      <PopoverTrigger as-child>
        <Button variant="input">
          <CalendarIcon :class="['mr-2 h-4 w-4', value ? '' : 'stroke-muted-foreground']" />
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

    <Drawer v-else v-model:open="open" title="Select Date" key="DateInputDrawer">
      <DrawerTrigger as-child>
        <Button variant="input">
          <CalendarIcon :class="['mr-2 h-4 w-4', value ? '' : 'stroke-muted-foreground']" />
          <span v-if="value">{{ formattedDate }}</span>
          <span v-else class="text-muted-foreground">{{ placeholder || "Pick a date" }}</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Select Date</DrawerTitle>
          <DrawerDescription>Choose a date from the calendar below</DrawerDescription>
        </DrawerHeader>
        <div class="px-4 pb-20">
          <Calendar
            :v-model="selectedDate"
            @update:model-value="onCalendarSelect"
            initial-focus
            :disable-future-dates="disableFuture"
          />
        </div>
        <DrawerFooter class="pt-2">
          <DrawerClose as-child> <Button variant="outline">Cancel</Button> </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>

    <!-- Validation error -->
    <p v-if="errorMessage" class="mt-1 text-xs text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

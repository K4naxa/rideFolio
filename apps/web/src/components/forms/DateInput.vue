<script setup lang="ts">
import type { DateValue } from "@internationalized/date";
import { DateFormatter, fromDate, getLocalTimeZone } from "@internationalized/date";
import { CalendarIcon } from "lucide-vue-next";

import { computed, ref, watch } from "vue";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import Drawer from "@/components/ui/drawer/Drawer.vue";
import DrawerTrigger from "@/components/ui/drawer/DrawerTrigger.vue";
import DrawerContent from "@/components/ui/drawer/DrawerContent.vue";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTitle from "@/components/ui/drawer/DrawerTitle.vue";
import DrawerDescription from "@/components/ui/drawer/DrawerDescription.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import DrawerClose from "@/components/ui/drawer/DrawerClose.vue";
import { Label } from "@/components/ui/label";

const props = withDefaults(
  defineProps<{
    modelValue?: Date | null;
    label?: string;
    placeholder?: string;
    disableFuture?: boolean;

    errorMessage?: string | null;
    disabled?: boolean;
  }>(),
  {
    modelValue: null,
    disableFuture: false,
    disabled: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: Date | null): void;
  (e: "change", value: Date | null): void;
}>();

const open = ref(false);
const isMobile = useIsMobile();

const selectedDate = ref<DateValue | undefined>(
  props.modelValue ? fromDate(new Date(props.modelValue), getLocalTimeZone()) : undefined,
);

watch(
  () => props.modelValue,
  (newVal) => {
    selectedDate.value = newVal ? fromDate(new Date(newVal), getLocalTimeZone()) : undefined;
  },
);

const df = computed(
  () =>
    new DateFormatter(navigator.language, {
      dateStyle: isMobile.value ? "short" : "long",
    }),
);

function onCalendarSelect(val: DateValue | undefined) {
  selectedDate.value = val;
  const dateOrNull = val ? val.toDate(getLocalTimeZone()) : null;
  // Emitted both so v-model works AND FormDateInput can bind to @change.
  emit("update:modelValue", dateOrNull);
  emit("change", dateOrNull);
  open.value = false;
}

const formattedDate = computed(() => (props.modelValue ? df.value.format(props.modelValue) : null));
</script>

<template>
  <div class="">
    <Label v-if="label" class="group-aria-invalid:text-destructive mb-1 ml-1 font-medium">{{ label }}</Label>

    <Popover v-if="!isMobile" v-model:open="open" key="DateInput">
      <PopoverTrigger as-child>
        <button class="inputField items-center gap-2">
          <CalendarIcon :class="['mr-2 h-4 w-4', modelValue ? '' : 'stroke-muted-foreground']" />
          <span v-if="modelValue">{{ formattedDate }}</span>
          <span v-else class="text-muted-foreground">{{ placeholder || "Pick a date" }}</span>
        </button>
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
        <button class="inputField items-center gap-2">
          <CalendarIcon :class="['mr-2 h-4 w-4', modelValue ? '' : 'stroke-muted-foreground']" />
          <span v-if="modelValue">{{ formattedDate }}</span>
          <span v-else class="text-muted-foreground">{{ placeholder || "Pick a date" }}</span>
        </button>
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

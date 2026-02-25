<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AlertDialogTrigger from "@/components/ui/alert-dialog/AlertDialogTrigger.vue";
import { computed, ref, useSlots } from "vue";

const props = withDefaults(
  defineProps<{
    open?: boolean;
    title: string;
    description?: string;
    actionClass?: string;
    actionVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    actionLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    title: "Are you sure?",
    description: "This action cannot be undone.",
    actionLabel: "Continue",
    cancelLabel: "Cancel",
  },
);

const emit = defineEmits<{
  action: [];
  "update:open": [value: boolean];
}>();

const slots = useSlots();
const internalOpen = ref(false);

const isControlled = computed(() => props.open !== undefined);
const openState = computed({
  get: () => (isControlled.value ? props.open! : internalOpen.value),
  set: (value: boolean) => {
    if (!isControlled.value) {
      internalOpen.value = value;
    }
    emit("update:open", value);
  },
});

const hasTrigger = computed(() => !!slots.default);

function onOpenChange(value: boolean) {
  openState.value = value;
}

function onActionClick() {
  emit("action");
  openState.value = false;
}
</script>

<template>
  <AlertDialog :open="openState" @update:open="onOpenChange">
    <AlertDialogTrigger v-if="hasTrigger">
      <slot />
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        <AlertDialogDescription>
          <slot name="description">
            <template v-if="description">
              <p v-html="description" />
            </template>
          </slot>
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel data-cy="cancel">
          {{ cancelLabel }}
        </AlertDialogCancel>
        <AlertDialogAction @click="onActionClick" :class="actionClass" :variant="actionVariant" data-cy="action">
          {{ actionLabel }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

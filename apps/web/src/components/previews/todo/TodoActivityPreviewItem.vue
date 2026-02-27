<script setup lang="ts">
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import { useTodoDelete, useTodoToggle } from "@/lib/queries/todos/todo-mutations";
import { useModalStore } from "@/stores/modal";
import type { BaseTodo } from "@repo/validation";
import { useTimeAgoIntl } from "@vueuse/core";

const props = defineProps<{
  activity: BaseTodo;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const { mutateAsync: deleteTodo } = useTodoDelete();
const { mutateAsync: toggleTodo } = useTodoToggle();
const { onOpen } = useModalStore();

async function handleDelete() {
  await deleteTodo({ todoId: props.activity.id, vehicleId: props.activity.vehicleId });
  emit("close");
}
</script>

<template>
  <div class="gaps-sm flex flex-col">
    <div v-if="props.activity.title" class="flex items-center justify-between gap-2">
      <h3 class="mr-8">{{ props.activity.title }}</h3>
      <ResponsiveDropdown
        trigger-class="absolute top-3 right-3"
        title="Options"
        :items="[
          {
            label: 'Edit',
            icon: 'edit',
            action: () => {
              (onOpen('createTodo', props.activity.id), emit('close'));
            },
          },
          {
            label: 'Delete',
            icon: 'trash',
            action: () => {
              handleDelete();
              emit('close');
            },
          },
        ]"
        ;
      />
    </div>
    <div>
      <Label class="text-muted-foreground">Description</Label>
      <p v-if="props.activity.description">{{ props.activity.description }}</p>
      <span v-else class="text-muted-foreground text-xs">No description</span>
    </div>

    <div>
      <Label class="text-muted-foreground"> Due info: </Label>
      <div class="mt-1 flex gap-2" v-if="props.activity.dueDate || props.activity.dueOdometer">
        <Badge
          v-if="props.activity.dueDate"
          :variant="props.activity.dueDate?.overdue ? 'destructive' : 'accent'"
          class="font-normal"
        >
          {{ useTimeAgoIntl(props.activity.dueDate?.date) }}
        </Badge>

        <Badge
          v-if="props.activity.dueOdometer"
          :variant="props.activity.dueOdometer.overdue ? 'destructive' : 'accent'"
          class="flex gap-1 font-normal"
        >
          <span v-if="!props.activity.dueOdometer.overdue">in</span>
          {{ Math.abs(Number(props.activity.dueOdometer?.remaining)).toFixed(0) }}
          {{ props.activity.dueOdometer?.unit }}
          <span v-if="props.activity.dueOdometer.overdue">ago</span>
        </Badge>
      </div>
      <span v-else class="text-muted-foreground text-xs">No due information</span>
    </div>

    <!-- footer -->
    <div class="">
      <Button
        variant="secondary"
        size="sm"
        class="w-full"
        @click="
          toggleTodo({ todoId: props.activity.id, complete: !props.activity.isCompleted });
          emit('close');
        "
      >
        Mark as {{ props.activity.isCompleted ? "incomplete" : "complete" }}
      </Button>
    </div>
  </div>
</template>

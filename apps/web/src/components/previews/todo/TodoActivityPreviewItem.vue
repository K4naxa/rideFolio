<script setup lang="ts">
import ResponsiveDropdown from "@/components/forms/ResponsiveDropdown.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Label from "@/components/ui/label/Label.vue";
import { useTodoDelete, useTodoToggle } from "@/lib/queries/todos/todo-mutations";
import { useModalStore } from "@/stores/modal";
import type { TodoActivity } from "@repo/validation";
import { useTimeAgoIntl } from "@vueuse/core";

const props = defineProps<{
  activity: TodoActivity;
}>();

const { mutateAsync: deleteTodo } = useTodoDelete();
const { mutateAsync: toggleTodo } = useTodoToggle();
const { onOpen } = useModalStore();

async function handleDelete() {
  await deleteTodo({ todoId: props.activity.data.id, vehicleId: props.activity.vehicle.id });
}
</script>

<template>
  <div class="gaps-sm flex flex-col">
    <div v-if="props.activity.data.title" class="flex items-center justify-between gap-2">
      <h3 class="mr-8">{{ props.activity.data.title }}</h3>
      <ResponsiveDropdown
        trigger-class="absolute top-3 right-3"
        title="Options"
        :items="[
          {
            label: 'Edit',
            icon: 'edit',
            action: () => onOpen('createTodo', props.activity.data.id),
          },
          {
            label: 'Delete',
            icon: 'trash',
            action: () => handleDelete(),
          },
        ]"
        ;
      />
    </div>
    <div v-if="props.activity.data.description">
      <Label class="text-muted-foreground">Description</Label>
      <p>{{ props.activity.data.description }}</p>
    </div>

    <div v-if="props.activity.data.dueDate || props.activity.data.dueOdometer">
      <Label class="text-muted-foreground mb-1"> Due info: </Label>
      <div class="flex gap-2">
        <Badge
          v-if="props.activity.data.dueDate"
          :variant="props.activity.data.dueDate?.overdue ? 'destructive' : 'accent'"
          class="font-normal"
        >
          {{ useTimeAgoIntl(props.activity.data.dueDate?.date) }}
        </Badge>

        <Badge
          v-if="props.activity.data.dueOdometer"
          :variant="props.activity.data.dueOdometer.overdue ? 'destructive' : 'accent'"
          class="flex gap-1 font-normal"
        >
          <span v-if="!props.activity.data.dueOdometer.overdue">in</span>
          {{ Math.abs(Number(props.activity.data.dueOdometer?.remaining)).toFixed(0) }}
          {{ props.activity.data.dueOdometer?.unit }}
          <span v-if="props.activity.data.dueOdometer.overdue">ago</span>
        </Badge>
      </div>
    </div>

    <!-- footer -->
    <div class="">
      <Button
        variant="secondary"
        size="sm"
        class="w-full"
        @click="toggleTodo({ todoId: props.activity.data.id, complete: true })"
      >
        Mark as done
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from "@/components/ui/badge/Badge.vue";
import Icon from "@/components/icons/Icon.vue";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import { useVehicles } from "@/lib/composables/useVehicles";
import type { BaseTodo } from "@repo/validation";
import { computed } from "vue";
import { useTimeAgoIntl } from "@vueuse/core";
import DetailRow from "@/components/ui/DetailRow.vue";
import StatCard from "@/components/ui/StatCard.vue";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const props = withDefaults(
  defineProps<{
    todo: BaseTodo;
    /** "compact" for inline/dialog previews, "full" for the detail modal */
    variant?: "compact" | "full";
    /** Show vehicle info (name/avatar) */
    showVehicle?: boolean;
    /** Vehicle image src (for full variant) */
    vehicleImage?: string | null;
    /** Vehicle type code (for full variant avatar fallback) */
    vehicleType?: string | null;
  }>(),
  { variant: "compact", showVehicle: false },
);

const { getVehicleNameById } = useVehicles();

const isOverdue = computed(
  () => (props.todo.dueOdometer?.overdue || props.todo.dueDate?.overdue) && !props.todo.isCompleted,
);

const dueDateAgo = computed(() =>
  props.todo.dueDate?.date ? useTimeAgoIntl(new Date(props.todo.dueDate.date)) : null,
);

const odometerText = computed(() => {
  if (!props.todo.dueOdometer) return "";
  const { overdue, value, remaining, unit } = props.todo.dueOdometer;

  if (props.todo.isCompleted) return `${value.toLocaleString()} ${unit}`;
  return overdue ? `${Math.abs(Number(remaining))} ${unit} ago` : `in ${remaining} ${unit}`;
});

const isOdoOverdue = computed(() => props.todo.dueOdometer?.overdue && !props.todo.isCompleted);
const isDateOverdue = computed(() => props.todo.dueDate?.overdue && !props.todo.isCompleted);

const dueDateFormatted = computed(() => {
  if (!props.todo.dueDate?.date) return null;
  return new Date(props.todo.dueDate.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const completedDateFormatted = computed(() => {
  if (!props.todo.completedData?.date) return null;
  return new Date(props.todo.completedData.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const createdDate = computed(() => {
  if (!props.todo.createdData.date) return "";
  return new Date(props.todo.createdData.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

const statusColor = computed(() => {
  if (props.todo.isCompleted) return "success";
  if (isOverdue.value) return "destructive";
  return "todo";
});

const vehicleName = computed(() => getVehicleNameById(props.todo.vehicleId));
</script>

<template>
  <!-- ─── COMPACT variant ─── -->
  <div v-if="variant === 'compact'" class="todo-details-compact">
    <div class="flex min-w-0 flex-1 flex-col gap-3">
      <!-- Header: status + title -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <Badge
            v-if="todo.isCompleted"
            class="bg-success/10 text-success gap-1 border-transparent text-xs font-medium"
          >
            <Icon name="circleCheck" size="sm" />
            Done
          </Badge>
          <Badge
            v-else-if="isOverdue"
            class="bg-destructive/10 text-destructive gap-1 border-transparent text-xs font-medium"
          >
            <Icon name="alert" size="sm" />
            Overdue
          </Badge>
          <Badge v-else class="bg-todo/10 text-todo gap-1 border-transparent text-xs font-medium">
            <Icon name="circle" size="sm" />
            Open
          </Badge>

          <Badge v-if="showVehicle && vehicleName" variant="default" class="">
            {{ vehicleName }}
          </Badge>
        </div>
      </div>

      <!--    Basic info -->
      <div>
        <h3>
          {{ todo.title }}
        </h3>
        <p v-if="todo.description" class="text-muted-foreground text-sm leading-relaxed">
          {{ todo.description }}
        </p>
      </div>

      <!-- Due info badges -->
      <div v-if="todo.dueDate || todo.dueOdometer" class="flex items-center gap-2">
        <Label class="text-muted-foreground text-xs">Due: </Label>

        <Badge v-if="todo.dueDate && dueDateAgo" class="text-sm" :variant="isDateOverdue ? 'destructive' : 'muted'">
          <Icon name="calendar" />
          {{ dueDateFormatted }}
        </Badge>

        <Badge v-if="todo.dueOdometer" class="text-sm" :variant="isOdoOverdue ? 'destructive' : 'muted'">
          <Icon name="odoDistance" />
          {{ odometerText }}
        </Badge>
      </div>
    </div>
  </div>

  <!-- ─── FULL variant ─── -->
  <div v-else class="todo-details-full flex flex-col gap-5">
    <!-- Vehicle identity -->
    <div v-if="showVehicle && vehicleName" class="flex items-center gap-3.5">
      <VehicleAvatar :src="vehicleImage" :type="vehicleType" class="h-14 w-20 shrink-0 rounded-lg" />
      <div class="flex min-w-0 flex-col gap-0.5">
        <span class="text-foreground truncate text-[15px] leading-tight font-medium">{{ vehicleName }}</span>
        <span class="text-muted-foreground text-xs">{{ createdDate }}</span>
      </div>
    </div>

    <Separator v-if="showVehicle && vehicleName" />

    <!-- Status + Title block -->
    <div class="flex flex-col gap-2.5">
      <div class="flex items-center gap-2">
        <div class="todo-status-dot" :class="`bg-${statusColor}`" />
        <Badge v-if="todo.isCompleted" class="bg-success/10 text-success gap-1 border-transparent text-xs font-medium">
          <Icon name="circleCheck" size="sm" />
          Completed
        </Badge>
        <Badge
          v-else-if="isOverdue"
          class="bg-destructive/10 text-destructive gap-1 border-transparent text-xs font-medium"
        >
          <Icon name="alert" size="sm" />
          Overdue
        </Badge>
        <Badge v-else class="bg-todo/10 text-todo gap-1 border-transparent text-xs font-medium">
          <Icon name="circle" size="sm" />
          Open
        </Badge>
      </div>
    </div>

    <!--    Basic info -->
    <div>
      <h3>
        {{ todo.title }}
      </h3>
      <p v-if="todo.description" class="text-muted-foreground text-sm leading-relaxed">
        {{ todo.description }}
      </p>
    </div>

    <!-- Due info badges -->
    <div v-if="todo.dueDate || todo.dueOdometer" class="flex items-center gap-2">
      <Label class="text-muted-foreground text-xs">Due: </Label>

      <Badge v-if="todo.dueDate && dueDateAgo" class="text-sm" :variant="isDateOverdue ? 'destructive' : 'muted'">
        <Icon name="calendar" />
        {{ dueDateFormatted }}
      </Badge>

      <Badge v-if="todo.dueOdometer" class="text-sm" :variant="isOdoOverdue ? 'destructive' : 'muted'">
        <Icon name="odoDistance" />
        {{ odometerText }}
      </Badge>
    </div>

    <!-- Completion info -->
    <section v-if="todo.completedData" class="todo-info-section">
      <span class="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">Completion</span>
      <div class="grid grid-cols-2 gap-x-6 gap-y-3">
        <DetailRow v-if="completedDateFormatted" label="Completed on" :value="completedDateFormatted" />
        <DetailRow
          v-if="todo.completedData.odometer"
          :value="`${todo.completedData.odometer.value.toLocaleString()}   ${todo.completedData.odometer.unit} `"
          label="At odometer"
        />
      </div>
      <div v-if="todo.completedData.user" class="flex items-center gap-2 pt-1">
        <div class="bg-success/10 flex size-6 items-center justify-center rounded-full">
          <Icon name="user" size="sm" class="text-success" />
        </div>
        <span class="text-foreground text-sm">{{ todo.completedData.user.name }}</span>
      </div>
    </section>

    <!-- Created by -->
    <section v-if="todo.createdData.user && !showVehicle" class="todo-info-section">
      <span class="text-muted-foreground text-[11px] font-medium tracking-wider uppercase">Created by</span>
      <div class="flex items-center gap-2">
        <div class="bg-muted flex size-6 items-center justify-center rounded-full">
          <Icon name="user" size="sm" class="text-muted-foreground" />
        </div>
        <span class="text-foreground text-sm">{{ todo.createdData.user.name }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.todo-details-compact {
  display: flex;
  min-width: 0;
  overflow: hidden;
}

.todo-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}

.todo-info-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
</style>

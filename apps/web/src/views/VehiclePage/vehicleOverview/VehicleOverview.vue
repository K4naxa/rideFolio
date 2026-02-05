<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";
import { computed } from "vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { useVehicleShopping } from "@/lib/queries/shopping/shopping-queries";
import { useTodoToggle } from "@/lib/queries/todos/todo-mutations";
import Separator from "@/components/ui/separator/Separator.vue";
import { EllipsisVertical } from "lucide-vue-next";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import { useShoppingToggle } from "@/lib/queries/shopping/shopping-mutations";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useModalStore } from "@/stores/modal";
import EmptyContent from "@/components/ui/empty/EmptyContent.vue";
import VehicleRecentActivity from "@/views/VehiclePage/vehicleOverview/components/VehicleRecentActivity.vue";
import { useVehicleNotes } from "@/lib/queries/notes/note-queries";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import type { Note } from "@repo/validation";
import { useRouter } from "vue-router";
import NotesList from "@/components/notes/NotesList.vue";
import { getTextSnippet } from "@/lib/utils/noteUtils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Badge from "@/components/ui/badge/Badge.vue";

const { currentVehicleId } = useCurrentVehicle();
const { preferredCurrencySymbol } = useCurrentUser();
const router = useRouter();
const isMobile = useIsMobile();
const modalStore = useModalStore();
const { data: todos, isLoading: isTodosLoading, isError: isTodosError } = useVehicleTodos(currentVehicleId);
const uncompletedTodos = computed(() => todos.value?.filter((todo) => !todo.isCompleted) || []);

const {
  data: shoppingList,
  isLoading: isShoppingLoading,
  isError: isShoppingError,
} = useVehicleShopping(currentVehicleId);

const { data: notes, isLoading: isNotesLoading, isError: isNotesError } = useVehicleNotes(currentVehicleId);

const { mutate: toggleTodo } = useTodoToggle();
const { mutate: toggleItem } = useShoppingToggle();

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function handleNoteClick(note: Note) {
  if (isMobile.value) {
    modalStore.onOpen("createNote", note);
  } else {
    router.push({
      path: "/vehicles" + `/${currentVehicleId.value}/notes`,
      query: { note: note.id },
    });
  }
}
</script>
<template>
  <div class="mainGaps flex w-full flex-col">
    <!-- First row -->

    <div class="flex h-52 min-h-0 w-full md:h-80">
      <VehicleConsumptionChart />
    </div>

    <!-- second row -->
    <div class="mainGaps grid w-full grid-cols-1 lg:grid-cols-2">
      <section class="flex h-full max-h-86 min-h-0 flex-col gap-4 lg:h-86">
        <VehicleRecentActivity />
      </section>

      <section class="flex h-full max-h-86 min-h-0 flex-col gap-4 lg:h-86">
        <header class="mb-4">
          <div class="flex justify-between gap-4">
            <h2 class="font-medium">Todos</h2>
            <Button variant="ghost" size="icon-sm">
              <EllipsisVertical />
            </Button>
          </div>
          <Separator class="mt-1" />
        </header>
        <div v-if="isTodosLoading" class="grid flex-1 place-items-center">
          <Spinner class="text-muted-foreground size-10" />
        </div>
        <div v-else-if="isTodosError" class="grid flex-1 place-items-center">
          <span class="text-destructive">Error loading todos.</span>
        </div>
        <Empty v-else-if="uncompletedTodos.length === 0">
          <EmptyTitle>No pending todos</EmptyTitle>
          <EmptyDescription class="text-center"> You have completed all your todos for this vehicle. </EmptyDescription>
          <EmptyContent>
            <Button variant="outline" @click="modalStore.onOpen('createTodo')"> Create new </Button>
          </EmptyContent>
        </Empty>
        <ul v-else class="space-y-4">
          <li v-for="todo in uncompletedTodos" :key="todo.id" class="group flex items-center gap-4">
            <Checkbox
              :model-value="todo.isCompleted"
              @update:model-value="
                toggleTodo({
                  todoId: todo.id,
                  complete: !todo.isCompleted,
                })
              "
              class="group-hover:bg-accent/10 group-hover:border-foreground/50 size-6 bg-transparent"
            />
            <div class="flex flex-col gap-0">
              <span class="leading-tight">{{ todo.title }}</span>
              <span class="text-muted-foreground text-sm">{{ todo.description }}</span>
            </div>

            <!-- Due Info -->
            <div class="ml-auto flex flex-col justify-center text-sm">
              <div
                v-if="todo.dueOdometer"
                :class="{ 'text-destructive font-medium': todo.dueOdometer.overdue && !todo.isCompleted }"
              >
                {{ todo.dueOdometer.value.toLocaleString() }} {{ todo.dueOdometer.unit }}
              </div>
              <div
                v-if="todo.dueDate"
                :class="{ 'text-destructive font-medium': todo.dueDate.overdue && !todo.isCompleted }"
              >
                {{ formatDate(String(todo.dueDate.date)) }}
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Third row -->
    <div class="mainGaps grid w-full grid-cols-1 md:grid-cols-2">
      <section class="flex h-full max-h-86 min-h-0 flex-col gap-4 lg:h-86">
        <header>
          <div class="flex justify-between gap-4">
            <h2 class="font-medium">Notes</h2>
            <Button variant="ghost" size="icon-sm">
              <EllipsisVertical />
            </Button>
          </div>
          <Separator class="mt-1" />
        </header>
        <div v-if="isNotesLoading" class="grid flex-1 place-items-center">
          <Spinner class="text-muted-foreground size-10" />
        </div>
        <div v-else-if="isNotesError" class="grid flex-1 place-items-center">
          <span class="text-destructive">Error loading notes.</span>
        </div>
        <Empty v-else-if="notes && notes.length === 0">
          <EmptyHeader>
            <Icon name="circleCheck" class="text-muted-foreground size-8" />
          </EmptyHeader>
          <EmptyTitle>No pending notes</EmptyTitle>
          <EmptyDescription class="text-center"> You have no notes for this vehicle. </EmptyDescription>
        </Empty>
        <ScrollArea v-else class="h-full w-full" as="ul">
          <ul v-auto-animate class="flex w-full flex-col divide-y">
            <li
              v-for="note in notes"
              :key="note.id"
              :class="['group flex cursor-pointer justify-between gap-2 py-2.5']"
              @click="handleNoteClick(note)"
            >
              <div class="flex w-full flex-col gap-1">
                <span class="min-w-0 font-medium break-all">{{ note.title }}</span>
                <span class="text-muted-foreground min-w-0 text-sm break-all">
                  {{ getTextSnippet(String(note.content), 80) }}</span
                >
                <div class="truncate">
                  <Badge v-for="tag in note.tags" variant="outline" :key="tag" class="mt-2 mr-1 px-2 py-1.5 text-xs">
                    {{ tag }}
                  </Badge>
                </div>
              </div>
              <div class="text-muted-foreground mt-1 line-clamp-6 min-w-0 text-sm break-all lg:line-clamp-3"></div>

              <div class="ml-auto flex flex-col items-center justify-center gap-1 text-sm">
                <Icon name="pin" v-if="note.pinned" class="stroke-primary size-4" />
                <button class="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <Icon name="chevronRight" />
                </button>
              </div>
            </li>
          </ul>
        </ScrollArea>
      </section>

      <section class="flex h-full max-h-86 min-h-0 flex-col gap-4 lg:h-86">
        <header>
          <div class="flex justify-between gap-4">
            <h2 class="font-medium">Shopping list</h2>
            <Button variant="ghost" size="icon-sm">
              <EllipsisVertical />
            </Button>
          </div>
          <Separator class="mt-1" />
        </header>
        <div v-if="isShoppingLoading" class="grid flex-1 place-items-center">
          <Spinner class="text-muted-foreground size-10" />
        </div>
        <div v-else-if="isShoppingError" class="grid flex-1 place-items-center">
          <span class="text-destructive">Error loading shopping list.</span>
        </div>
        <Empty v-else-if="shoppingList && shoppingList.length === 0">
          <EmptyHeader>
            <Icon name="circleCheck" class="text-muted-foreground size-8" />
          </EmptyHeader>
          <EmptyTitle>No pending items</EmptyTitle>
          <EmptyDescription class="text-center"> No pending items in your shopping list. </EmptyDescription>
        </Empty>
        <ul v-else class="space-y-4">
          <li v-for="item in shoppingList" :key="item.id" class="group flex items-center gap-4">
            <Checkbox
              :model-value="item.isPurchased"
              @update:model-value="
                toggleItem({
                  itemId: item.id,
                  purchased: !item.isPurchased,
                })
              "
              class="group-hover:bg-accent/10 group-hover:border-foreground/50 size-6 bg-transparent"
            />
            <div class="flex flex-col gap-0">
              <span class="leading-tight">{{ item.name }}</span>
            </div>

            <!-- Due Info -->
            <span class="ml-auto"> {{ item.price }} {{ preferredCurrencySymbol }} </span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
<style scoped></style>

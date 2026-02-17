<script setup lang="ts">
import VehicleConsumptionChart from "./components/VehicleConsumptionChart.vue";
import { computed, ref } from "vue";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import Icon from "@/components/icons/Icon.vue";
import { useVehicleTodos } from "@/lib/queries/todos/todo-queries";
import { useVehicleShopping } from "@/lib/queries/shopping/shopping-queries";
import { useTodoToggle } from "@/lib/queries/todos/todo-mutations";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import { useShoppingToggle } from "@/lib/queries/shopping/shopping-mutations";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useModalStore } from "@/stores/modal";
import VehicleRecentActivity from "@/views/VehiclePage/vehicleOverview/components/VehicleRecentActivity.vue";
import { useVehicleNotes } from "@/lib/queries/notes/note-queries";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import type { Note } from "@repo/validation";
import { useRouter } from "vue-router";
import { getTextSnippet } from "@/lib/utils/noteUtils";
import Badge from "@/components/ui/badge/Badge.vue";
import OverviewTodos from "@/views/VehiclePage/vehicleOverview/components/OverviewTodos.vue";
import OverviewShoppinglist from "@/views/VehiclePage/vehicleOverview/components/OverviewShoppinglist.vue";

const { currentVehicleId } = useCurrentVehicle();
const router = useRouter();
const isMobile = useIsMobile();
const modalStore = useModalStore();

const { data: notes, isLoading: isNotesLoading, isError: isNotesError } = useVehicleNotes(currentVehicleId);

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
  <div class="gaps-lg mb-8 flex w-full flex-col">
    <!-- First row -->

    <div class="flex h-52 min-h-0 w-full md:h-80">
      <VehicleConsumptionChart />
    </div>

    <!-- second row -->
    <div class="gaps-lg grid min-h-0 w-full lg:grid-cols-2">
      <!-- Right column -->
      <OverviewTodos />
      <OverviewShoppinglist />

      <div class="flex h-full max-h-96 min-h-0 flex-col lg:col-span-2">
        <h2 class="mb-2">Notes</h2>
        <Separator class="mb-4" />

        <div class="scrollbar-macos overflow-y-auto">
          <div v-if="isNotesLoading" class="grid flex-1 place-items-center">
            <Spinner class="text-muted-foreground size-10" />
          </div>
          <div v-else-if="isNotesError" class="grid flex-1 place-items-center">
            <span class="text-destructive">Error loading notes.</span>
          </div>
          <Empty v-else-if="notes && notes.length === 0">
            <EmptyDescription class=""> You have no notes for this vehicle. </EmptyDescription>
          </Empty>
          <ul v-auto-animate class="flex w-full flex-col gap-6">
            <li
              v-for="note in notes"
              :key="note.id"
              :class="['group flex cursor-pointer justify-between gap-2 border-l pl-4']"
              @click="handleNoteClick(note)"
            >
              <div class="flex w-full flex-col gap-1">
                <span class="min-w-0 break-all">{{ note.title }}</span>
                <span class="text-muted-foreground min-w-0 text-sm break-all">
                  {{ getTextSnippet(String(note.content), 200) }}</span
                >
                <div class="truncate">
                  <Badge v-for="tag in note.tags" variant="outline" :key="tag" class="mt-2 mr-1 px-2 py-1.5 text-xs">
                    {{ tag }}
                  </Badge>
                </div>
              </div>

              <div class="ml-auto flex flex-col items-center justify-center gap-1 text-sm">
                <Icon name="pin" v-if="note.pinned" class="stroke-primary size-4" />
                <button class="opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <Icon name="chevronRight" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Input from "@/components/ui/input/Input.vue";
import { useNoteQueries } from "@/lib/queries/useNoteQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import NoteSection from "./components/NoteSection.vue";
import { useMediaQuery } from "@vueuse/core";
import { useModalStore } from "@/stores/modal";
import { type Note } from "@repo/validation";
import Badge from "@/components/ui/badge/Badge.vue";
import Icon from "@/components/icons/Icon.vue";

const searchQuery = ref("");

const router = useRouter();
const route = useRoute();
const { onOpen } = useModalStore();
const isMobile = useMediaQuery("(max-width: 1024px)");

const { activeVehicleId } = useActiveVehicle();
const { vehicleNotes, vehicleNotesLoading } = useNoteQueries(activeVehicleId);

const selectedNoteId = computed({
  get: () => route.query.note as string | null,
  set: (noteId: Note["id"] | null) => {
    router.push({
      query: { ...route.query, note: noteId || undefined },
    });
  },
});

const selectNote = (note: Note) => {
  if (!isMobile.value) selectedNoteId.value = note.id;
  else {
    console.log("Opening modal for mobile view");
    onOpen("createNote", note);
  }
};

const getTextSnippet = (html: string, maxLength: number = 100): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  const text = div.textContent || div.innerText || "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const handleNewClick = () => {
  if (!isMobile.value) selectedNoteId.value = "new";
  else {
    onOpen("createNote", null);
  }
};
</script>

<template>
  <div class="flex gap-8 lg:min-h-0 flex-1">
    <!-- left side -->
    <div class="flex flex-col gap-8 lg:border-r lg:max-w-96 min-w-0 w-full">
      <!-- controls -->
      <div class="flex flex-col gap-4 lg:pr-8">
        <Input
          v-model="searchQuery"
          type="text"
          name="search"
          id="VehicleNoteSearch"
          placeholder="Search notes..."
          class="w-full"
        />
        <div class="flex gap-4 justify-evenly content-center">
          <DropdownMenu :modal="false">
            <DropdownMenuTrigger as-child>
              <Button variant="outline" class="flex-1">
                <Icon name="filter" /> <span class="md:hidden">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="w-52"> </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="default" class="flex-1 sm:w-auto" @click="handleNewClick">
            <Icon name="plus" class="stroke-white" />
            Create Note
          </Button>
        </div>
      </div>

      <div class="flex overflow-y-auto scrollbar lg:pr-8" v-if="!vehicleNotesLoading">
        <ul
          v-auto-animate
          v-if="vehicleNotes && vehicleNotes.length"
          class="flex flex-col gap-6 lg:gap-2 w-full"
        >
          <li
            v-for="note in vehicleNotes"
            :key="note.id"
            :class="[
              'py-3 px-3 bg-accent/50 rounded cursor-pointer border-transparent hover:bg-accent/50 block listHover group',
              selectedNoteId === note.id ? 'bg-accent/60' : 'lg:bg-transparent',
            ]"
            @click="selectNote(note)"
          >
            <div class="flex justify-between items-center gap-1">
              <span class="font-medium truncate">{{ note.title }}</span>

              <Icon
                name="pin"
                v-if="note.pinned"
                className="size-4 text-primary stroke-primary hover:text-primary hover:stroke-primary transition-colors"
              />
            </div>
            <div class="text-muted-foreground text-sm mt-1 line-clamp-6 lg:line-clamp-3">
              {{ getTextSnippet(String(note.content), 80) }}
            </div>
            <div class="truncate">
              <Badge
                v-for="tag in note.tags"
                variant="outline"
                :key="tag"
                class="mt-2 mr-1 px-2 py-1.5 text-xs"
              >
                {{ tag }}
              </Badge>
            </div>
          </li>
        </ul>
        <div v-else class="flex-1 flex justify-center items-center">
          <div class="flex justify-center flex-col text-center p-6">
            <h3>No notes found</h3>
            <p class="text-sm text-muted-foreground mt-2">
              You don't have any notes for this vehicle yet.
            </p>
            <Button
              variant="default"
              class="mt-4 items-center flex content-center justify-center"
              @click="handleNewClick"
            >
              <Icon name="plus" class="stroke-white" />
              Create Note
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div class="hidden lg:flex flex-1 flex-col">
      <NoteSection
        v-if="selectedNoteId"
        :note-id="selectedNoteId"
        :vehicle-id="activeVehicleId || ''"
      />
      <div v-else class="flex-1 flex items-center justify-center text-muted-foreground">
        Select a note to view or edit

        {{ selectedNoteId }}
      </div>
    </div>
  </div>
</template>

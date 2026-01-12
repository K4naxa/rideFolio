<script setup lang="ts">
import Tooltip from "@/components/ui/tooltip/Tooltip.vue";
import TooltipTrigger from "@/components/ui/tooltip/TooltipTrigger.vue";
import TooltipContent from "@/components/ui/tooltip/TooltipContent.vue";
import Button from "@/components/ui/button/Button.vue";
import Icon from "@/components/icons/Icon.vue";
import Empty from "@/components/ui/empty/Empty.vue";

import { useModalStore } from "@/stores/modal";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import { useQuicklinks } from "@/lib/queries/quicklinks/quicklink-queries";
import EmptyContent from "@/components/ui/empty/EmptyContent.vue";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { ref } from "vue";
import { useQuicklinkDelete } from "@/lib/queries/quicklinks/quicklink-mutation";
import Label from "@/components/ui/label/Label.vue";
import { getFaviconUrl } from "@/lib/utils";

const isEditing = ref(false);

const { data: links, isPending: isLoading } = useQuicklinks();
const { mutateAsync: deleteQuicklink } = useQuicklinkDelete();

const modalStore = useModalStore();

function handleNewQuickLink() {
  modalStore.onOpen("quicklink");
}
function handleEditing(boolean: boolean) {
  isEditing.value = boolean;
}
async function handleDeleteQuicklink(id: string) {
  await deleteQuicklink(id);
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between gap-8">
      <Label>Your Quicklinks</Label>
      <DropdownMenu v-if="!isEditing" :modal="false">
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon-sm">
            <Icon name="dotsHorizontal" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Quicklinks</DropdownMenuLabel>
          <Separator />
          <DropdownMenuItem @click="handleEditing(true)"> Edit </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div v-else>
        <Button variant="outline" size="sm" @click="handleEditing(false)">Done</Button>
      </div>
    </div>

    <!-- Content -->
    <ul class="flex flex-wrap items-center gap-4" v-if="(links && links.length > 0) || isLoading">
      <!-- Loader -->
      <li v-if="isLoading" v-for="n in 4" :key="n" class="bg-muted h-8 w-28 animate-pulse rounded-md" />

      <!-- Quicklinks -->
      <Tooltip placement="top" v-for="link in links" :key="link.id" :delay-duration="200">
        <TooltipTrigger>
          <a
            v-if="!isEditing"
            :href="link.url"
            target="_blank"
            class="hover:border-border flex items-center gap-2.5 rounded border border-transparent px-3 py-2 hover:shadow-md"
          >
            <div class="flex items-center gap-2">
              <img
                v-if="getFaviconUrl(link.url)"
                :src="getFaviconUrl(link.url)"
                :alt="'favicon for ' + link.name"
                class="size-4"
              />
              <span class="font-medium">{{ link.name }}</span>
            </div>
          </a>
          <div v-else class="flex items-center gap-2.5 rounded border px-3 py-2">
            <div class="flex items-center gap-2">
              <img v-if="getFaviconUrl(link.url)" :src="getFaviconUrl(link.url)" alt="Favicon" class="size-5" />
              <span class="font-medium">{{ link.name }}</span>
            </div>
            <button class="hover:cursor-pointer" @click="handleDeleteQuicklink(link.id)">
              <Icon
                name="close"
                class="stroke-muted-foreground hover:stroke-destructive size-4 duration-75 hover:scale-110"
              />
              <span class="sr-only">Delete Quicklink</span>
            </button>
          </div>
        </TooltipTrigger>

        <TooltipContent v-if="link.description && !isEditing">{{ link.description }}</TooltipContent>
      </Tooltip>

      <Button v-if="!isEditing" variant="ghost" size="icon-sm" @click="handleNewQuickLink">
        <Icon name="plus" class="size-4" />
        <span class="sr-only">Add Quicklink</span>
      </Button>
    </ul>
    <Empty v-else class="">
      <EmptyDescription>No quicklinks added yet. Click the + button to add your first quicklink.</EmptyDescription>
      <EmptyContent>
        <Button variant="outline" size="sm" @click="handleNewQuickLink">
          <Icon name="plus" class="mr-2 size-4" />
          Add Quicklink
        </Button>
      </EmptyContent>
    </Empty>
  </div>
</template>
<style></style>

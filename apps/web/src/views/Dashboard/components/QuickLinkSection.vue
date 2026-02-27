<script setup lang="ts">
import Tooltip from "@/components/ui/tooltip/Tooltip.vue";
import TooltipTrigger from "@/components/ui/tooltip/TooltipTrigger.vue";
import TooltipContent from "@/components/ui/tooltip/TooltipContent.vue";
import Button from "@/components/ui/button/Button.vue";
import Icon from "@/components/icons/Icon.vue";

import { useModalStore } from "@/stores/modal";
import { useQuicklinks } from "@/lib/queries/quicklinks/quicklink-queries";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { ref } from "vue";
import { useQuicklinkDelete } from "@/lib/queries/quicklinks/quicklink-mutation";
import { getFaviconUrl } from "@/lib/utils";
import { ExternalLinkIcon } from "lucide-vue-next";

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
  <section class="flex max-h-96 flex-col">
    <header class="mb-1 flex items-center justify-between gap-2">
      <h3>Quick Links</h3>
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
      <div v-else class="">
        <Button variant="outline" size="sm" @click="handleEditing(false)">Done</Button>
      </div>
    </header>

    <!-- Content -->
    <div class="scrollbar-macos cardBackground flex flex-col divide-y overflow-y-auto rounded border">
      <!-- Loader -->
      <li v-if="isLoading" v-for="n in 4" :key="n" class="bg-muted h-8 w-28 animate-pulse rounded-md" />

      <!-- Quicklinks -->
      <Tooltip placement="top" v-else v-for="link in links" :key="link.id" :delay-duration="200">
        <TooltipTrigger>
          <a :href="link.url" target="_blank" class="listHover flex items-center justify-between gap-2.5 p-3 py-3">
            <div class="flex items-center gap-3 text-base font-medium">
              <img
                v-if="link.url"
                :src="getFaviconUrl(link.url)"
                :alt="'favicon for ' + link.name"
                class="size-5 rounded object-cover"
              />
              <span> {{ link.name }}</span>
            </div>

            <ExternalLinkIcon v-if="!isEditing" class="text-muted-foreground/70 size-4" />
            <Button
              v-else
              variant="outline"
              size="icon-sm"
              class="text-muted-foreground"
              @click.prevent="handleDeleteQuicklink(link.id)"
            >
              <Icon name="trash" class="size-4" />
            </Button>
          </a>
        </TooltipTrigger>

        <TooltipContent v-if="link.description && !isEditing">{{ link.description }}</TooltipContent>
      </Tooltip>

      <li
        v-if="!isEditing"
        class="text-muted-foreground hover:text-foreground flex cursor-pointer list-none items-center gap-3 px-3 py-2.5 transition-colors duration-100"
        @click="handleNewQuickLink"
      >
        <Icon name="plus" class="size-4" />
        <span class="">Add new link</span>
      </li>
    </div>
  </section>
</template>
<style></style>

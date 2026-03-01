<script setup lang="ts">
import { computed, ref } from "vue";

import { Dialog, DialogHeader, DialogScrollContent, DialogTitle } from "@/components/ui/dialog";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useModalStore } from "@/stores/modal";
import { getInitials } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import { twMerge } from "tailwind-merge";
import AccountTab from "@/modals/Settings/tabs/AccountTab.vue";
import StorageUsageTab from "@/modals/Settings/tabs/StorageUsageTab.vue";
import SessionsTab from "@/modals/Settings/tabs/SessionsTab.vue";
import PreferencesTab from "@/modals/Settings/tabs/PreferencesTab.vue";

// Responsive check
const isMobile = useIsMobile();
const user = useCurrentUser();
const modalStore = useModalStore();
const isOpen = computed(() => modalStore.isOpen && modalStore.type === "settings");

// Active tab tracking
const activeTab = ref("preferences");

// Tabs configuration
interface Tab {
  id: string;
  label: string;
  icon: IconProps["name"];
}
const tabs: Tab[] = [
  {
    id: "account",
    label: user.currentUser.value?.name || "Account",
    icon: "user",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: "preferences",
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: "key",
  },
  {
    id: "storage",
    icon: "database",
    label: "Storage Usage",
  },
] as const;

// Get user initials for avatar fallback
const initials = getInitials(user.currentUser.value?.name || "");

// Set active tab
function setActiveTab(tabId: string) {
  activeTab.value = tabId;
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="modalStore.onClose" class="max-w-7xl">
    <DialogScrollContent class="w-full max-w-7xl gap-0 overflow-hidden p-0! md:h-200">
      <div class="flex h-full flex-col">
        <!-- Mobile Tabs Navigation (sticky) -->
        <div v-if="isMobile" class="bg-background sticky top-0 z-10">
          <DialogHeader class="p-4 pb-2">
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div class="mobileOffScreenScroll scrollbar-none">
            <Tabs :model-value="activeTab" class="scrollbar-none overflow-x-auto">
              <TabsList class="min-w-fit">
                <TabsTrigger
                  v-for="tab in tabs"
                  :key="tab.id"
                  :value="tab.id"
                  class="flex items-center gap-1.5 px-3 py-2"
                  @click="setActiveTab(tab.id)"
                >
                  <Icon :name="tab.icon" />
                  <span>{{ tab.label }}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <!-- Desktop Layout with Sidebar -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Desktop Sidebar -->

          <div class="bg-muted/20 hidden w-60 flex-col gap-4 border-r px-2 py-4 md:flex lg:px-3 lg:py-6">
            <Label class="text-muted-foreground text-xs">Settings</Label>
            <ul class="flex flex-col gap-1">
              <li
                v-for="tab in tabs"
                :key="tab.id"
                @click="setActiveTab(tab.id)"
                :class="
                  twMerge(
                    'hover:bg-accent/50 text-foreground/80 flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2 py-1 text-sm font-medium',
                    activeTab === tab.id ? 'bg-accent hover:bg-accent text-foreground' : '',
                  )
                "
              >
                <div class="size-5 w-5">
                  <template v-if="tab.avatar">
                    <Avatar class="h-5 w-5">
                      <AvatarImage
                        v-if="user.currentUser.value?.image"
                        :src="user.currentUser.value?.image"
                        :alt="user.currentUser.value?.name"
                      />
                      <AvatarFallback class="text-[10px]">
                        {{ initials }}
                      </AvatarFallback>
                    </Avatar>
                  </template>
                  <template v-else-if="tab.icon">
                    <Icon :name="tab.icon" class="h-4 w-4" />
                  </template>
                </div>

                {{ tab.label }}
              </li>
            </ul>
          </div>

          <!-- Main Content Area -->
          <div class="scrollArea flex-1 overflow-y-auto p-4 lg:p-8">
            <!-- Tab Content -->
            <div>
              <!-- Account Content -->
              <div v-if="activeTab === 'account'">
                <AccountTab />
              </div>

              <!-- Preferences Content -->
              <div v-else-if="activeTab === 'preferences'">
                <PreferencesTab />
              </div>
              <!-- Sessions Content -->
              <div v-else-if="activeTab === 'sessions'">
                <SessionsTab />
              </div>
              <!-- Storage Usage Content -->
              <div v-else-if="activeTab === 'storage'">
                <StorageUsageTab />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DialogScrollContent>
  </Dialog>
</template>

<style scoped>
/* Ensure sidebar fits within dialog */
:deep(.sidebar) {
  --sidebar-width: 220px;
  height: 100%;
}
</style>

<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import Button from "@/components/ui/button/Button.vue";
import Drawer from "@/components/ui/drawer/Drawer.vue";
import DrawerContent from "@/components/ui/drawer/DrawerContent.vue";
import DrawerFooter from "@/components/ui/drawer/DrawerFooter.vue";
import DrawerHeader from "@/components/ui/drawer/DrawerHeader.vue";
import DrawerTrigger from "@/components/ui/drawer/DrawerTrigger.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuGroup from "@/components/ui/dropdown-menu/DropdownMenuGroup.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuLabel from "@/components/ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuSeparator from "@/components/ui/dropdown-menu/DropdownMenuSeparator.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { useSidebar } from "@/components/ui/sidebar";
import SidebarMenuButton from "@/components/ui/sidebar/SidebarMenuButton.vue";
import { useAuth } from "@/lib/authClient";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useIsMobile } from "@/lib/composables/useMediaQuery";
import { getInitials } from "@/lib/utils";
import { useModalStore } from "@/stores/modal";
import { EllipsisVerticalIcon } from "lucide-vue-next";
import { ref } from "vue";

const isMobile = useIsMobile();
const { currentUser: user } = useCurrentUser();
const modalStore = useModalStore();

const auth = useAuth();

const isOpen = ref(false);
</script>

<template>
  <DropdownMenu v-if="!isMobile" v-model:open="isOpen">
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton class="hover:bg-accent/50 h-fit py-2">
        <Avatar class="h-9 w-9 rounded-lg">
          <AvatarImage v-if="user?.image" :src="user?.image || ''" :alt="user?.name" />
          <AvatarFallback v-else class="bg-accent rounded-lg">{{ getInitials(user?.name) }}</AvatarFallback>
        </Avatar>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-medium">{{ user?.name }}</span>
          <span class="text-muted-foreground truncate text-xs">
            {{ user?.email }}
          </span>
        </div>
        <EllipsisVerticalIcon class="ml-auto" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent
      class="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side="right"
      align="end"
      :sideOffset="4"
    >
      <DropdownMenuLabel class="p-0 font-normal">
        <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar class="h-8 w-8 rounded-lg">
            <AvatarImage v-if="user?.image" :src="user?.image || ''" :alt="user?.name" />
            <AvatarFallback v-else class="bg-accent rounded-lg">{{ getInitials(user?.name) }}</AvatarFallback>
          </Avatar>
          <div class="grid flex-1 text-left text-sm leading-tight">
            <span class="truncate font-medium">{{ user?.name }}</span>
            <span class="text-muted-foreground truncate text-xs"> {{ user?.email }} </span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem @click="modalStore.onOpen('settings')">
          <Icon name="settings" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Icon name="billing" />
          Billing
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuItem @click="auth.signOut()">
        <Icon name="logout" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

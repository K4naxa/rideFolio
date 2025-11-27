<script setup lang="ts">
import Icon, { type IconProps } from "@/components/icons/Icon.vue";
import Avatar from "@/components/ui/avatar/Avatar.vue";
import AvatarFallback from "@/components/ui/avatar/AvatarFallback.vue";
import AvatarImage from "@/components/ui/avatar/AvatarImage.vue";
import Tabs from "@/components/ui/tabs/Tabs.vue";
import TabsList from "@/components/ui/tabs/TabsList.vue";
import TabsTrigger from "@/components/ui/tabs/TabsTrigger.vue";
import { useUser } from "@/lib/queries/useUserQueries";
import { computed } from "vue";
import { useRoute } from "vue-router";

const profileTabs: { value: string; icon: IconProps["name"]; url: string }[] = [
  { value: "profile", icon: "user", url: "/profile" },
  { value: "security", icon: "shield", url: "/profile/security" },
  { value: "sessions", icon: "key", url: "/profile/sessions" },
  { value: "accounts", icon: "link", url: "/profile/accounts" },
  { value: "danger", icon: "trash", url: "/profile/danger" },
];

const { currentUser: user } = useUser();

const route = useRoute();
const activeTab = computed(() => {
  const tab = profileTabs.find((t) => t.url === route.path);
  return tab?.value || "profile";
});
</script>
<template>
  <div class="gap mx-auto flex w-full flex-col px-4 py-4 lg:max-w-7xl lg:px-8 lg:py-8">
    <header class="flex w-full items-center gap-4">
      <Avatar class="size-16 lg:size-20">
        <AvatarImage v-if="user?.image" :src="user?.image" :alt="user?.name || 'User Avatar'" />
        <AvatarFallback>
          <Icon name="user" class="stroke-muted-foreground size-8" aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
      <div>
        <h1 class="text-3xl font-semibold lg:text-3xl">
          {{ user?.name }}
        </h1>

        <p class="text-muted-foreground">
          {{ user?.email }}
        </p>
      </div>
    </header>

    <Tabs :model-value="activeTab" class="w-full">
      <TabsList class="w-full">
        <TabsTrigger v-for="tab in profileTabs" :key="tab.value" :value="tab.value" class="">
          <RouterLink :to="tab.url" class="flex w-full items-center justify-center gap-2">
            <Icon :name="tab.icon" class="size-4" aria-hidden="true" />
            <span class="items-center text-lg max-lg:hidden">{{ tab.value }}</span>
          </RouterLink>
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <main>
      <RouterView />
    </main>
  </div>
</template>

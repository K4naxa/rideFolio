<script setup lang="ts">
import Tabs from "@/components/ui/tabs/Tabs.vue";
import TabsList from "@/components/ui/tabs/TabsList.vue";
import TabsTrigger from "@/components/ui/tabs/TabsTrigger.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const profileTabs: { value: string; url: string }[] = [{ value: "preferences", url: "/settings/preferences" }];

const route = useRoute();
const activeTab = computed(() => {
  const tab = profileTabs.find((t) => t.url === route.path);
  return tab?.value || "preferences";
});
</script>
<template>
  <div class="gap mx-auto flex w-full flex-col px-4 py-4 lg:max-w-7xl lg:px-8 lg:py-8">
    <header class="flex w-full items-center gap-4">
      <h1>Settings</h1>
    </header>

    <Tabs :model-value="activeTab" class="w-full">
      <TabsList class="w-full">
        <TabsTrigger v-for="tab in profileTabs" :key="tab.value" :value="tab.value" as-child>
          <RouterLink
            :to="tab.url"
            class="text-muted-foreground stroke-muted-foreground flex h-full w-full max-w-32 items-center justify-center gap-2"
            active-class="text-foreground stroke-foreground"
          >
            <p class="flex items-center text-base font-semibold text-current max-lg:text-sm">{{ tab.value }}</p>
          </RouterLink>
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<script lang="ts" setup>
import Tabs from "@/components/ui/tabs/Tabs.vue";
import TabsList from "@/components/ui/tabs/TabsList.vue";
import TabsTrigger from "@/components/ui/tabs/TabsTrigger.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const activeTab = computed(() => {
  if (route.name === "Login") {
    return "login";
  } else if (route.name === "Register") {
    return "register";
  }
  return "login";
});
</script>

<template>
  <Tabs :model-value="activeTab">
    <TabsList>
      <TabsTrigger value="login" class="w-full">
        <RouterLink to="/login" class="w-full text-center font-semibold text-current">Log In</RouterLink>
      </TabsTrigger>
      <TabsTrigger value="register" class="w-full">
        <RouterLink to="/register" class="w-full text-center font-semibold text-current"> Sign Up </RouterLink>
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>

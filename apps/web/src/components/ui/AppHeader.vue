"use client";
<script setup lang="ts">
import { computed } from "vue";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { Button } from "@/components/ui/button";
import { Icons } from "../utility/icons";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useActivePool } from "@/lib/useActivePool";
import { useRoute } from "vue-router";
import AppHeaderProfileButton from "./AppHeaderProfileButton.vue";

const route = useRoute();
const { activeVehicleName } = useActiveVehicle();
const { activePoolName } = useActivePool();

const title = computed(
  () => activeVehicleName.value || activePoolName.value || route.name?.toString(),
);
</script>
<template>
  <header
    class="flex h-14 shrink-0 items-center px-2 lg:px-6 gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) sticky top-0 z-20 w-full bg-background"
  >
    <div class="flex w-full items-center gap-1 lg:gap-2">
      <SidebarTrigger class="-ml-1" />
      <Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
      <h2 class="">{{ title }}</h2>
    </div>
    <div class="hidden lg:flex items-center gap-2 ml-auto pr-4 lg:pr-6 text-sm">
      <Button
        variant="outline"
        class="border-refill hover:bg-refill/10 text-refill dark:text-foreground hover:shadow-sm hover:shadow-refill/50"
      >
        <Icons.refill class="text-refill" size="sm" />
        <span class="hidden 2xl:block">Refill</span>
      </Button>
      <Button
        variant="outline"
        class="border-maintenance hover:bg-maintenance/10 text-maintenance dark:text-foreground"
      >
        <Icons.maintenance class="text-maintenance" size="sm" />
        <span class="hidden 2xl:block">Maintenance</span>
      </Button>
      <Button
        variant="outline"
        class="border-notes hover:bg-notes/20 text-notes dark:text-foreground"
      >
        <Icons.notes class="text-notes" size="sm" />
        <span class="hidden 2xl:block">Note</span>
      </Button>
      <Button variant="outline" class="border-toDo hover:bg-toDo/20 text-toDo dark:text-foreground">
        <Icons.todo size="sm" class="text-toDo" />
        <span class="hidden 2xl:block">Todo</span>
      </Button>
    </div>
    <div class="ml-auto flex gap-x-2.5 items-center">
      <Button variant="ghost" class="p-2">
        <Icons.bell size="sm" />
        <span class="sr-only">Notification</span>
      </Button>

      <AppHeaderProfileButton />
    </div>
  </header>
</template>

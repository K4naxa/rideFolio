<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Icon from "@/components/icons/Icon.vue";
import ShoppingTable from "./components/shoppingTable.vue";
import { useModalStore } from "@/stores/modal";

const modalStore = useModalStore();
</script>

<template>
  <main class="flex-1 space-y-6">
    <div class="flex items-center justify-between">
      <Button @click="modalStore.onOpen('createShoppingItem')">
        <Icon name="plus" />
        Add Item
      </Button>
    </div>

    <div class="flex min-h-0 flex-1">
      <ShoppingTable />
    </div>
  </main>
</template>

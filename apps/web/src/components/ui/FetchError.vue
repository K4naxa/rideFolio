<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyContent from "@/components/ui/empty/EmptyContent.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    message?: string;
    refetch: () => void;
    isFetching?: boolean;
  }>(),
  {
    title: "Unable to load data",
  },
);
</script>

<template>
  <Empty>
    <EmptyHeader class="gap-0">
      <Icon name="alert" class="text-destructive stroke-destructive size-12" />
      <EmptyTitle class="text-destructive mt-2"> {{ title }} </EmptyTitle>
      <EmptyContent class="flex flex-col gap-2 text-center">
        <p class="text-muted-foreground">{{ message }}</p>
        <Button variant="outline" size="sm" :disabled="isFetching" @click="refetch">Retry</Button>
      </EmptyContent>
    </EmptyHeader>
  </Empty>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";

const router = useRouter();
</script>

<template>
  <Empty>
    <EmptyContent>
      <EmptyMedia variant="icon">
        <Icon name="alert" class="text-destructive" />
      </EmptyMedia>
      <EmptyTitle>Failed to Load Pool</EmptyTitle>
      <EmptyDescription>
        We couldn't load the pool details. This might be because the pool doesn't exist or you don't have access to it.
      </EmptyDescription>
      <Button @click="router.push('/')" variant="default">
        <Icon name="home" class="mr-2" />
        Go Home
      </Button>
    </EmptyContent>
  </Empty>
</template>

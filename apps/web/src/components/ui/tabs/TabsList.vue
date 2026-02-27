<script setup lang="ts">
import type { TabsListProps } from "reka-ui";
import { TabsList } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { twMerge } from "tailwind-merge";

const props = defineProps<TabsListProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");
</script>

<template>
  <TabsList
    data-slot="tabs-list"
    v-bind="delegatedProps"
    :class="
      twMerge(
        'bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-1',
        props.class,
      )
    "
  >
    <slot />
  </TabsList>
</template>

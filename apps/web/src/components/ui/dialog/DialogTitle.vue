<script setup lang="ts">
import type { DialogTitleProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { DialogTitle, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icons/Icon.vue";

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <DialogTitle
    data-slot="dialog-title"
    v-bind="forwardedProps"
    :class="
      cn('flex items-center gap-2 text-lg leading-none font-semibold [&_svg]:size-4 lg:[&_svg]:size-5', props.class)
    "
  >
    <!-- <DialogClose as-child class="lg:hidden">
      <Button variant="ghost" size="icon">
        <Icon name="arrowLeft" />
      </Button>
    </DialogClose> -->

    <slot />

    <DialogClose as-child class="ml-auto">
      <Button variant="ghost" size="icon-sm">
        <Icon name="close" />
      </Button>
    </DialogClose>
  </DialogTitle>
</template>

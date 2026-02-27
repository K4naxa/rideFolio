<script setup lang="ts">
import type { DialogTitleProps } from "reka-ui";
import { DialogTitle, useForwardProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { cn } from "@/lib/utils";
import { DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Icon from "@/components/icons/Icon.vue";
import { useIsMobile } from "@/lib/composables/useMediaQuery";

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);

const isMobile = useIsMobile();
</script>

<template>
  <DialogTitle
    data-slot="dialog-title"
    v-bind="forwardedProps"
    :class="
      cn(
        'flex min-h-8 items-center gap-2 text-lg leading-none font-medium [&_svg]:size-4 lg:[&_svg]:size-5',
        isMobile ? 'justify-center px-12' : 'justify-start pr-12',
        props.class,
      )
    "
  >
    <DialogClose v-if="isMobile" as-child class="absolute right-0 left-0">
      <Button variant="ghost" size="icon-sm">
        <Icon name="arrowLeft" />
      </Button>
    </DialogClose>

    <slot />

    <DialogClose v-if="!isMobile" as-child class="absolute top-0 right-0">
      <Button variant="ghost" size="icon-sm">
        <Icon name="close" />
      </Button>
    </DialogClose>
  </DialogTitle>
</template>

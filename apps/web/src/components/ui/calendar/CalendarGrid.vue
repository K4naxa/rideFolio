<script lang="ts" setup>
import type { CalendarGridProps } from "reka-ui";
import { CalendarGrid, injectCalendarRootContext, useForwardProps } from "reka-ui";
import { type HTMLAttributes, useTemplateRef } from "vue";
import { reactiveOmit, useSwipe } from "@vueuse/core";
import { cn } from "@/lib/utils";

const props = defineProps<CalendarGridProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
const rootContext = injectCalendarRootContext();

const swipeArea = useTemplateRef("SwipeArea");
useSwipe(swipeArea, {
  onSwipeEnd: (e, direction) => {
    if (direction === "left") {
      rootContext.nextPage();
    } else if (direction === "right") {
      rootContext.prevPage();
    }
  },
  threshold: 50,
});
</script>

<template>
  <div ref="SwipeArea">
    <CalendarGrid
      data-slot="calendar-grid"
      :class="cn('w-full border-collapse space-x-1', props.class)"
      v-bind="forwardedProps"
    >
      <slot />
    </CalendarGrid>
  </div>
</template>

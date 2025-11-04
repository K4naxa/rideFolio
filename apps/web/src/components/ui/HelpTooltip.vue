<script setup lang="ts">
import { CircleQuestionMarkIcon } from "lucide-vue-next";
import TooltipTrigger from "./tooltip/TooltipTrigger.vue";
import TooltipContent from "./tooltip/TooltipContent.vue";
import Tooltip from "./tooltip/Tooltip.vue";
import TooltipProvider from "./tooltip/TooltipProvider.vue";

const props = defineProps({
  message: {
    type: String,
    require: false,
  },
});
</script>
<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger @click.prevent>
        <CircleQuestionMarkIcon class="h-4 w-4 stroke-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent class=" ">
        <span>{{ props.message }}</span>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

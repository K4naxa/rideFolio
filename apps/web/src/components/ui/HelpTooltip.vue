<script setup lang="ts">
import { CircleQuestionMarkIcon } from "lucide-vue-next";
import TooltipTrigger from "./tooltip/TooltipTrigger.vue";
import TooltipContent from "./tooltip/TooltipContent.vue";
import Tooltip from "./tooltip/Tooltip.vue";
import TooltipProvider from "./tooltip/TooltipProvider.vue";
import { ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import Popover from "@/components/ui/popover/Popover.vue";
import PopoverTrigger from "@/components/ui/popover/PopoverTrigger.vue";
import PopoverContent from "@/components/ui/popover/PopoverContent.vue";
import PopoverAnchor from "@/components/ui/popover/PopoverAnchor.vue";
import Icon from "@/components/icons/Icon.vue";

const props = defineProps({
  message: {
    type: String,
    require: false,
  },
});

const tooltipOpen = ref(false);
</script>
<template>
  <Popover v-model:open="tooltipOpen">
    <PopoverAnchor>
      <PopoverTrigger @click.prevent="tooltipOpen = !tooltipOpen" class="flex items-center">
        <Icon name="help" class="text-muted-foreground hover:text-foreground h-4 w-4" />
      </PopoverTrigger>
    </PopoverAnchor>
    <PopoverContent class="bg-accent/70 p-2" side="top" align="center" :sideOffset="4">
      <span class="text-sm">{{ props.message }}</span>
    </PopoverContent>
  </Popover>
</template>

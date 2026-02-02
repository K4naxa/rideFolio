<script lang="ts" setup>
import Icon from "@/components/icons/Icon.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import Label from "@/components/ui/label/Label.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { twMerge } from "tailwind-merge";

interface VehicleSlotElementProps {
  used: number;
  limit: number;
  isLoading?: boolean;
  isError?: boolean;
}
const props = withDefaults(defineProps<VehicleSlotElementProps>(), {
  isLoading: false,
  isError: false,
});
</script>
<template>
  <div class="flex flex-1 flex-col gap-2">
    <div>
      <div class="flex w-full justify-between gap-8">
        <div>
          <h3 class="flex gap-2">Vehicle Slots</h3>
          <CardDescription class="text-muted-foreground mt-auto">
            {{ props.limit - props.used }} slots left in your plan
          </CardDescription>
        </div>
      </div>
      <Separator class="my-2" />
    </div>

    <div v-if="props.isLoading"><Spinner /></div>
    <div v-else-if="props.isError" class="text-destructive">Error loading vehicle usage data.</div>

    <!-- Vehicle slot grid - constrained -->
    <div v-else :class="twMerge('flex flex-wrap', props.limit > 20 ? 'gap-1' : 'gap-3')">
      <div
        v-for="(_, index) in props.limit"
        :key="index"
        :class="
          twMerge(
            'flex aspect-square min-h-0 items-center justify-center rounded',
            'border-2 p-3 lg:p-4',
            index < props.used
              ? 'border-primary bg-primary/5 border-solid'
              : 'border-muted-foreground/50 border-dashed',
          )
        "
      >
        <Icon
          name="car"
          :class="twMerge('size-6 lg:size-8', index < props.used ? 'stroke-primary' : 'stroke-muted-foreground/50')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DrawerRootEmits, DrawerRootProps } from "vaul-vue";
import { DrawerRoot } from "vaul-vue";
import { useForwardPropsEmits } from "reka-ui";
import { ref, watch } from "vue";

const props = withDefaults(defineProps<DrawerRootProps>(), {
  shouldScaleBackground: true,
});

const emits = defineEmits<DrawerRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);

const internalOpen = ref(props.open ?? props.defaultOpen ?? false);

watch(
  () => props.open,
  (v) => {
    if (v !== undefined) {
      internalOpen.value = v;
    }
  },
);

function onOpenChange(open: boolean) {
  internalOpen.value = open;
}
</script>

<template>
  <DrawerRoot v-slot="slotProps" data-slot="drawer" v-bind="forwarded" :open="internalOpen" @update:open="onOpenChange">
    <slot v-bind="slotProps" :onOpenChange="onOpenChange" />
  </DrawerRoot>
</template>

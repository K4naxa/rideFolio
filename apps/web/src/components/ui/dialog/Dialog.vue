<script setup lang="ts">
import type { DialogRootEmits, DialogRootProps } from "reka-ui";
import { DialogRoot, useForwardPropsEmits } from "reka-ui";
import { toRef } from "vue";
import { useHistory } from "@/lib/useHistory";

const props = defineProps<DialogRootProps>();
const emits = defineEmits<DialogRootEmits>();

const open = toRef(props, "open");
useHistory(open, (isOpen: boolean) => emits("update:open", isOpen));

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <DialogRoot v-bind="forwarded">
    <slot />
  </DialogRoot>
</template>

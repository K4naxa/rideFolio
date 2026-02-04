<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from "vue";
import Button from "./button/Button.vue";
import Icon from "../icons/Icon.vue";

interface Props {
  value?: File | string | null;
  title: string;
  disabled?: boolean;
  className?: string;
  dataCy?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: true,
  className: "",
});
const emit = defineEmits<{ (e: "change", file: File | null): void }>();

const previewUrl = ref<string | null>(null);
const isDragging = ref<boolean>(false);
const inputRef = ref<HTMLInputElement | null>(null);

let objectUrl: string | null = null;

watch(
  () => props.value,
  (val) => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }

    if (val instanceof File) {
      objectUrl = URL.createObjectURL(val);
      previewUrl.value = objectUrl;
    } else if (typeof val === "string") {
      previewUrl.value = val;
    } else {
      previewUrl.value = null;
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});

// Handlers
const handleFileChange = (file: File | null) => emit("change", file);

const handleRemoveImage = (e: MouseEvent) => {
  e.stopPropagation();
  emit("change", null);
  if (inputRef.value) inputRef.value = null;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0] || null;
  handleFileChange(file);
};
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => (isDragging.value = false);

const handleClick = () => {
  if (!props.disabled) inputRef.value?.click();
};
</script>
<template>
  <div :class="['space-y-2', props.className]">
    <div
      :class="[
        'relative rounded-xl border-2 border-dashed p-4 text-center transition-all duration-200 select-none',
        isDragging ? 'border-primary bg-primary/10' : 'border-border',
        !props.disabled && 'hover:border-muted-foreground cursor-pointer',
        props.disabled && 'opacity-50 hover:cursor-not-allowed',
      ]"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="handleClick"
    >
      <!-- Hidden input -->
      <input
        ref="inputRef"
        type="file"
        accept="image/*"
        class="hidden"
        :disabled="props.disabled"
        @change="handleFileChange(($event.target as HTMLInputElement).files?.[0] || null)"
        :data-cy="props.dataCy"
      />

      <!-- Preview -->
      <template v-if="previewUrl">
        <div class="group relative">
          <img
            :src="previewUrl"
            alt="Image preview"
            width="256"
            height="256"
            class="mx-auto max-h-64 w-auto rounded-lg shadow-md"
          />
          <Button
            v-if="!props.disabled"
            variant="destructive"
            size="icon"
            type="button"
            @click="handleRemoveImage"
            class="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Icon name="close" />
          </Button>
        </div>
      </template>

      <!-- Placeholder -->
      <template v-else>
        <div class="text-muted-foreground h-full space-y-2">
          <div class="flex justify-center">
            <Icon name="camera" class="h-10" />
          </div>
          <div>
            <p class="text-foreground font-medium">{{ props.title }}</p>
            <p class="mt-1 text-sm">Drag and drop, or click to select</p>
          </div>
          <p class="text-muted-foreground mt-auto text-center text-xs">Supported types: JPG, PNG, GIF (max 5 MB)</p>
        </div>
      </template>
    </div>
  </div>
</template>

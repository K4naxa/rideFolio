<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from "vue";
import { Icons } from "../utility/icons";
import Button from "./button/Button.vue";

interface Props {
  value?: File | string | null;
  title: string;
  disabled?: boolean;
  className?: string;
}

const props = defineProps<Props>();
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
        'relative border-2 border-dashed rounded-xl p-4 text-center transition-all duration-200 select-none',
        isDragging ? 'border-primary bg-primary/10' : 'border-border',
        !props.disabled && 'cursor-pointer hover:border-muted-foreground',
        props.disabled && 'hover:cursor-not-allowed opacity-50',
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
      />

      <!-- Preview -->
      <template v-if="previewUrl">
        <div class="relative group">
          <img
            :src="previewUrl"
            alt="Image preview"
            width="256"
            height="256"
            class="max-h-64 w-auto mx-auto rounded-lg shadow-md"
          />
          <Button
            v-if="!props.disabled"
            variant="destructive"
            size="icon"
            type="button"
            @click="handleRemoveImage"
            class="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Icons.close class="w-4 h-4" />
          </Button>
        </div>
      </template>

      <!-- Placeholder -->
      <template v-else>
        <div class="space-y-2 text-muted-foreground h-full">
          <div class="flex justify-center">
            <Icons.camera class="w-10 h-10" />
          </div>
          <div>
            <p class="font-medium text-foreground">{{ props.title }}</p>
            <p class="text-sm mt-1">Drag and drop, or click to select</p>
          </div>
          <p class="text-xs text-muted-foreground text-center mt-auto">
            Supported types: JPG, PNG, GIF (max 5 MB)
          </p>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { type HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import EditorMenuBar from "./EditorMenuBar.vue";

const emit = defineEmits<{
  (e: "update:value", value: string): void;
}>();

const props = withDefaults(
  defineProps<{
    editable?: boolean;
    placeholder?: string;
    value?: string | null;
    error?: string;
    class?: HTMLAttributes["class"];
  }>(),
  {
    value: "",
  },
);

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      bulletList: {
        HTMLAttributes: {
          class: "list-disc ml-6 mb-4",
        },
      },
      orderedList: {
        HTMLAttributes: {
          class: "!list-decimal ml-6 mb-4",
        },
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Highlight.configure({
      multicolor: true,
    }),
    Placeholder.configure({
      placeholder: props.placeholder || "Start typing...",
      showOnlyWhenEditable: true,
      emptyEditorClass:
        "flex-1 cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-0 before:left-0 before:text-mauve-11 before:opacity-50",
    }),
  ],
  content: props.value || "",
  editable: props.editable || true,
  onUpdate: ({ editor }) => {
    emit("update:value", editor.getHTML());
  },
  editorProps: {
    attributes: {
      class: "flex-1",
    },
  },
});
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0 min-w-0">
    <EditorMenuBar v-if="editor" :editor="editor" />
    <div :class="twMerge('flex flex-col min-h-0 flex-1 overflow-y-auto scrollbar', props.class)">
      <slot />

      <editor-content :editor="editor" class="flex-1 flex" />
      <span v-if="error" class="text-sm text-destructive mt-2">{{ error }}</span>
    </div>
  </div>
</template>

<style scoped></style>

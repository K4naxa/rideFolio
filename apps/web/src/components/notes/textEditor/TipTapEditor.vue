<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { computed, watch, type HTMLAttributes } from "vue";
import { twMerge } from "tailwind-merge";
import { CharacterCount } from "@tiptap/extension-character-count";
import EditorMenuBar from "./EditorMenuBar.vue";
import Icon from "@/components/icons/Icon.vue";

const CHARACTER_LIMIT = 25000;

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
        "flex-1 min-w-0 cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-0 before:left-0 before:text-mauve-11 before:opacity-50",
    }),
    CharacterCount.configure({
      limit: CHARACTER_LIMIT,
    }),
  ],
  content: props.value || "",
  editable: props.editable || true,

  onUpdate: ({ editor }) => {
    emit("update:value", editor.getHTML());
  },
  editorProps: {
    attributes: {
      class: "flex-1 outline-none break-words whitespace-pre-wrap",
    },
  },
});

const characterCount = computed(() => {
  return editor.value?.storage.characterCount.characters() ?? 0;
});
const characterCountIsAtLimit = computed(() => {
  return characterCount.value >= CHARACTER_LIMIT;
});

// Watch for external value changes and update editor content
// This helps in not needing to use :key on the editor component (causes full re-mount / loss of focus)
watch(
  () => props.value,
  (newValue) => {
    if (!editor) return;
    const currentContent = editor.value?.getHTML();
    if (newValue !== currentContent) {
      editor.value?.commands.setContent(newValue || "");
    }
  },
);
</script>

<template>
  <div class="flex min-h-0 min-w-0 flex-1 flex-col">
    <EditorMenuBar v-if="editor" :editor="editor" />

    <!-- Character limit error message -->
    <div
      class="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
      v-if="characterCountIsAtLimit"
    >
      <Icon name="alert" class="stroke-destructive" />
      <span>
        <strong>Character limit reached!</strong> You've used all {{ CHARACTER_LIMIT.toLocaleString() }} characters.
      </span>
    </div>

    <div
      :class="
        twMerge(
          'scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto px-1',
          characterCountIsAtLimit ? 'border-destructive rounded border' : '',
          props.class,
        )
      "
    >
      <!-- Free slot inside the editor container ( used for title ) -->
      <slot />

      <editor-content :editor="editor" class="flex flex-1" />
      <span v-if="error" class="text-destructive mt-2 text-sm">{{ error }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Target the Tiptap editor instance */
:deep(.ProseMirror) {
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>

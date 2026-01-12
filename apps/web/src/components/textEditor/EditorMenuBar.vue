<script setup lang="ts">
import { computed, h, type Component } from "vue";
import { twMerge } from "tailwind-merge";
import { type Editor } from "@tiptap/vue-3";
import Toggle from "@/components/ui/toggle/Toggle.vue";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-vue-next";

interface MenuOptions {
  icon: Component;
  level: number;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const props = defineProps<{ editor: Editor | undefined; class?: string }>();

const editorState = computed(() => {
  if (!props.editor) {
    return {
      isBold: false,
      isItalic: false,
      isStrike: false,
      isHighlight: false,
      isBulletList: false,
      isOrderedList: false,
      textAlign: "left",
      headingLevel: undefined,
      paragraph: false,
    };
  }

  return {
    isBold: props.editor.isActive("bold"),
    isItalic: props.editor.isActive("italic"),
    isStrike: props.editor.isActive("strike"),
    isHighlight: props.editor.isActive("highlight"),
    isBulletList: props.editor.isActive("bulletList"),
    isOrderedList: props.editor.isActive("orderedList"),
    textAlign:
      (["left", "center", "right", "justify"] as const).find((align) => props.editor?.isActive({ textAlign: align })) ||
      "left",
    headingLevel: ([1, 2, 3] as const).find((level) => props.editor?.isActive("heading", { level })),
    paragraph: props.editor.isActive("paragraph"),
  };
});

const ParagraphIcon = {
  setup() {
    return () => h("p", { class: "text-sm " }, "P");
  },
};

const menuOptions = computed<MenuOptions[]>(() => {
  if (!props.editor) return [];

  return [
    {
      icon: Heading1,
      level: 1,
      label: "H1",
      onClick: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editorState.value.headingLevel === 1,
    },
    {
      icon: Heading2,
      level: 2,
      label: "H2",
      onClick: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editorState.value.headingLevel === 2,
    },
    {
      icon: Heading3,
      level: 3,
      label: "H3",
      onClick: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editorState.value.headingLevel === 3,
    },
    {
      icon: ParagraphIcon,
      level: 0,
      label: "Paragraph",
      onClick: () => props.editor?.chain().focus().setParagraph().run(),
      isActive: editorState.value.paragraph,
    },
    {
      icon: Bold,
      level: 0,
      label: "Bold",
      onClick: () => props.editor?.chain().focus().toggleBold().run(),
      isActive: editorState.value.isBold,
    },
    {
      icon: Italic,
      level: 0,
      label: "Italic",
      onClick: () => props.editor?.chain().focus().toggleItalic().run(),
      isActive: editorState.value.isItalic,
    },
    {
      icon: Strikethrough,
      level: 0,
      label: "Strike",
      onClick: () => props.editor?.chain().focus().toggleStrike().run(),
      isActive: editorState.value.isStrike,
    },
    {
      icon: Highlighter,
      level: 0,
      label: "Highlight",
      onClick: () => props.editor?.chain().focus().toggleHighlight({ color: "var(--color-primary)" }).run(),
      isActive: editorState.value.isHighlight,
    },
    {
      icon: List,
      level: 0,
      label: "Bullet List",
      onClick: () => props.editor?.chain().focus().toggleBulletList().run(),
      isActive: editorState.value.isBulletList,
    },
    {
      icon: ListOrdered,
      level: 0,
      label: "Ordered List",
      onClick: () => props.editor?.chain().focus().toggleOrderedList().run(),
      isActive: editorState.value.isOrderedList,
    },
    {
      icon: AlignLeft,
      level: 0,
      label: "Left",
      onClick: () => props.editor?.chain().focus().setTextAlign("left").run(),
      isActive: editorState.value.textAlign === "left",
    },
    {
      icon: AlignCenter,
      level: 0,
      label: "Center",
      onClick: () => props.editor?.chain().focus().setTextAlign("center").run(),
      isActive: editorState.value.textAlign === "center",
    },
    {
      icon: AlignRight,
      level: 0,
      label: "Right",
      onClick: () => props.editor?.chain().focus().setTextAlign("right").run(),
      isActive: editorState.value.textAlign === "right",
    },
    {
      icon: AlignJustify,
      level: 0,
      label: "Justify",
      onClick: () => props.editor?.chain().focus().setTextAlign("justify").run(),
      isActive: editorState.value.textAlign === "justify",
    },
  ];
});
</script>
<template>
  <div
    v-if="props.editor"
    :class="
      twMerge('bg-background scrollbar mb-1 flex items-center gap-2 overflow-x-auto rounded border p-1', props.class)
    "
  >
    <Toggle
      v-for="(option, index) in menuOptions"
      v-model="option.isActive"
      @mousedown.prevent="option.onClick"
      :aria-label="option.label"
      size="sm"
      type="button"
    >
      <component :is="option.icon" />
    </Toggle>
  </div>
</template>

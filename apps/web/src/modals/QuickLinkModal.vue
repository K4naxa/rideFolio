<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useQuicklinkCreate } from "@/lib/queries/quicklinks/quicklink-mutation";
import { useModalStore } from "@/stores/modal";
import { QuicklinkSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "quicklink");
const handleClose = () => {
  modalStore.onClose();
};

const { mutateAsync: createQuicklink, isPending, isError } = useQuicklinkCreate();

const { handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(QuicklinkSchema),
  initialValues: {
    name: "",
    url: "",
    description: "",
  },
});

const onSubmit = handleSubmit((values) => {
  createQuicklink(values, {
    onSuccess: () => {
      modalStore.onClose();
    },
  });
});

watch(isModalOpen, () => {
  resetForm({
    values: {
      name: "",
      url: "",
      description: "",
    },
  });
});
</script>

<template>
  <Dialog
    :open="isModalOpen"
    @update:open="handleClose"
    title="Add Quick Link"
    :loading="isSubmitting"
    :close-on-escape="!isSubmitting"
    :close-on-overlay-click="!isSubmitting"
  >
    <DialogScrollContent class="w-full max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          <Icon name="link" />
          <h3>Add Quick Link</h3>
        </DialogTitle>
      </DialogHeader>
      <form @submit="onSubmit">
        <Input name="name" placeholder="Link Name *" class="mb-4" type="text" />
        <Input name="url" placeholder="URL *" class="mb-4" type="text" />
        <Input
          name="description"
          placeholder="Description, shown as tooltip on hover"
          :disabled="isSubmitting"
          type="text"
        />
        <DialogFooter class="mt-8">
          <Button type="submit" :disabled="isSubmitting" data-cy="submit-todo-btn">
            <span v-if="!isSubmitting">
              <p>Add</p>
            </span>
            <span v-else>
              <Spinner />
            </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-todo-btn">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>

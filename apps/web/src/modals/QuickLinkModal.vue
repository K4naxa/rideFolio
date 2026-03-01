<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import { useQuicklinkCreate } from "@/lib/queries/quicklinks/quicklink-mutation";
import { useModalStore } from "@/stores/modal";
import { QuicklinkSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import FormInput from "@/components/forms/FormInput.vue";

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "quicklink");
const handleClose = () => modalStore.onClose();

const { mutateAsync: createQuicklink } = useQuicklinkCreate();

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
  <ResponsiveFormDialog
    :open="isModalOpen"
    @close="handleClose"
    title="Add Quick Link"
    description="Save a URL for quick access from your dashboard."
    icon="link"
    content-class="max-w-lg"
  >
    <FormInput name="name" label="Name" placeholder="My favourite garage" type="text" />
    <FormInput name="url" label="URL" placeholder="example.com" type="text" prefix="https://" />
    <FormInput
      name="description"
      label="Description"
      placeholder="Shown as tooltip on hover (optional)"
      :disabled="isSubmitting"
      type="text"
    />

    <template #footer>
      <Button type="button" @click="onSubmit" :disabled="isSubmitting" data-cy="submit-todo-btn">
        <Spinner v-if="isSubmitting" class="mr-1" />
        {{ isSubmitting ? "Adding…" : "Add link" }}
      </Button>
      <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-todo-btn">Cancel</Button>
    </template>
  </ResponsiveFormDialog>
</template>

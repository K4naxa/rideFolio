<script setup lang="ts">
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import Label from "@/components/ui/label/Label.vue";
import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";
import { useTodoCreate, useTodoUpdate } from "@/lib/queries/todos/todo-mutations";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useModalStore } from "@/stores/modal";
import { TodoSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import { useTodoById } from "@/lib/queries/todos/todo-queries";
import FormDateInput from "@/components/forms/FormDateInput.vue";
import FormInput from "@/components/forms/FormInput.vue";

const { currentVehicle } = useCurrentVehicle();

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createTodo");

const { data: editableTodo } = useTodoById(computed(() => (isModalOpen.value ? modalStore.itemId : undefined)));

const creatingNew = computed(() => !editableTodo.value);
const handleClose = () => modalStore.onClose();

const { mutateAsync: createTodo } = useTodoCreate();
const { mutateAsync: updateTodo } = useTodoUpdate();

const showDueOptions = ref(false);

const { handleSubmit, resetForm, isSubmitting, values } = useForm({
  validationSchema: toTypedSchema(TodoSchema),
  initialValues: {
    title: "",
    vehicleId: currentVehicle.value?.vehicleData.id,
  },
});

const { selectedVehicleOdometerUnit } = useSelectedVehicle(computed(() => values.vehicleId));

watch([isModalOpen, editableTodo], ([open, todo]) => {
  if (!open) return;

  if (todo) {
    resetForm({
      values: {
        vehicleId: todo.vehicleId,
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        dueDate: todo.dueDate?.date,
        dueOdometer: todo.dueOdometer?.value,
      },
    });
    showDueOptions.value = !!(todo.dueDate || todo.dueOdometer);
  } else {
    showDueOptions.value = false;
    resetForm({
      values: {
        vehicleId: currentVehicle.value?.vehicleData.id || "",
        title: "",
        description: "",
        priority: null,
        dueDate: null,
        dueOdometer: null,
      },
    });
  }
});

const onSubmit = handleSubmit(async (values) => {
  if (creatingNew.value) {
    createTodo(values, {
      onSuccess: () => {
        toast.success("Todo created succesfully");
        handleClose();
      },
      onError: (error) => {
        toast.error("Error creating todo");
        console.error("❌ Creating Todo API Error: ", error);
      },
    });
  } else {
    if (!editableTodo.value?.id) return toast.error("Error updating todo: Missing todo ID");
    updateTodo(
      { todoId: editableTodo.value?.id, data: values },
      {
        onSuccess: () => {
          toast.success("Todo updated succesfully");
          handleClose();
        },
        onError: (error) => {
          toast.error("Error updating todo");
          console.error("❌ Updating Todo API Error: ", error);
        },
      },
    );
  }
});
</script>

<template>
  <ResponsiveFormDialog
    :open="isModalOpen"
    @close="handleClose"
    :title="creatingNew ? 'Create To-do' : 'Edit To-do'"
    description="Set a title, priority and optional due information."
    icon="todo"
    content-class="max-w-2xl"
    key="TodoModal"
  >
    <form data-cy="create-todo-form" class="contents">
      <Field v-slot="{ value, handleChange }" name="vehicleId">
        <div v-if="!currentVehicle">
          <VehicleSelect
            :value="value"
            @valueChange="handleChange"
            placeholder="Select a vehicle"
            data-cy="vehicle-select"
          />
          <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" data-cy="vehicle-error" />
        </div>
      </Field>

      <FormInput
        name="title"
        label="Title"
        placeholder="What needs to be done?"
        type="text"
        data-cy="todo-title-input"
        :maxlength="100"
      />
      <Textarea
        name="description"
        label="Description"
        placeholder="Add more details (optional)"
        data-cy="todo-description-input"
        :maxlength="500"
      />

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Label class="flex items-center gap-3 text-base select-none" data-cy="due-checkbox-label">
          <Checkbox
            :model-value="showDueOptions"
            @update:model-value="showDueOptions = !showDueOptions"
            class="size-6"
            data-cy="due-checkbox"
          />
          Set due information
        </Label>
      </div>

      <Transition name="slide">
        <div v-if="showDueOptions" class="slide-panel" data-cy="due-options-panel">
          <div class="slide-content grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormDateInput name="dueDate" label="Due date" placeholder="Select due date" data-cy="due-date-input" />
            <FormInput
              name="dueOdometer"
              type="number"
              label="Due odometer"
              :suffix="selectedVehicleOdometerUnit"
              placeholder="Odometer reading"
              data-cy="due-odometer-input"
            />
          </div>
        </div>
      </Transition>
    </form>

    <template #footer>
      <Button type="button" @click="onSubmit" :disabled="isSubmitting" data-cy="submit-todo-btn">
        <Spinner v-if="isSubmitting" class="mr-1" />
        <span v-if="creatingNew">{{ isSubmitting ? "Creating…" : "Create" }}</span>
        <span v-else>{{ isSubmitting ? "Saving…" : "Save changes" }}</span>
      </Button>
      <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-todo-btn">Cancel</Button>
    </template>
  </ResponsiveFormDialog>
</template>

<style scoped>
.slide-enter-active {
  transition:
    grid-template-rows 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-leave-active {
  transition:
    grid-template-rows 0.1s cubic-bezier(0.4, 0, 0.6, 1),
    opacity 0.1s cubic-bezier(0.4, 0, 0.6, 1);
}
.slide-enter-from {
  opacity: 0;
  display: grid;
  grid-template-rows: 0fr;
}
.slide-enter-to {
  opacity: 1;
  display: grid;
  grid-template-rows: 1fr;
}
.slide-leave-from {
  opacity: 1;
  display: grid;
  grid-template-rows: 1fr;
}
.slide-leave-to {
  opacity: 0;
  display: grid;
  grid-template-rows: 0fr;
}
.slide-panel {
  will-change: grid-template-rows, opacity;
  backface-visibility: hidden;
}
.slide-content {
  overflow: hidden;
}
</style>

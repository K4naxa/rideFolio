<script setup lang="ts">
import DateInput from "@/components/forms/DateInput.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogFooter from "@/components/ui/dialog/DialogFooter.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Input from "@/components/ui/input/Input.vue";
import Select from "@/components/ui/select/Select.vue";
import SelectContent from "@/components/ui/select/SelectContent.vue";
import SelectItem from "@/components/ui/select/SelectItem.vue";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import SelectValue from "@/components/ui/select/SelectValue.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import { useTodoCreate, useTodoUpdate } from "@/lib/queries/todos/todo-mutations";
import { useVehicleQueries } from "@/lib/queries/useVehicleQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useModalStore } from "@/stores/modal";
import { TodoSchema, type Todo } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

const { activeVehicle } = useActiveVehicle();
const { vehicles } = useVehicleQueries();

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createTodo");
const initialData = computed<Todo | undefined>(() => modalStore.data as Todo | undefined);
const creatingNew = computed(() => !initialData.value);
const handleClose = () => {
  modalStore.onClose();
};

const { mutateAsync: createTodo } = useTodoCreate();
const { mutateAsync: updateTodo } = useTodoUpdate();

const showDueOptions = ref(false);

const { handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(TodoSchema),
  initialValues: {
    title: "",
    vehicleId: activeVehicle.value?.vehicleData.id,
  },
});

watch(isModalOpen, (open) => {
  if (open) {
    if (initialData.value) {
      resetForm({
        values: {
          vehicleId: initialData.value.vehicleData.id,
          title: initialData.value.title || "",
          description: initialData.value.description || "",
          priority: initialData.value.priority || undefined,
          dueDate: initialData.value.dueDate ? initialData.value.dueDate : null,
          dueOdometer: initialData.value.dueOdometer,
        },
      });
      if (initialData.value.dueDate || initialData.value.dueOdometer) {
        showDueOptions.value = true;
      } else {
        showDueOptions.value = false;
      }
      return;
    }
  }
  if (open && activeVehicle.value) {
    showDueOptions.value = false;
    resetForm({
      values: {
        vehicleId: activeVehicle.value.vehicleData.id,
      },
    });
  } else {
    resetForm();
    showDueOptions.value = false;
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
    // Updating existing todo
    if (!initialData.value?.id) return;
    updateTodo(
      { todoId: initialData.value?.id, data: values },
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
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="w-full max-w-2xl" key="TodoModal">
      <DialogHeader>
        <DialogTitle>
          <Icon name="todo" />
          <h3 v-if="creatingNew">Create To-do</h3>
          <h3 v-else>Edit To-do</h3>
        </DialogTitle>
      </DialogHeader>
      <form @submit="onSubmit" class="flex flex-col gap-5" data-cy="create-todo-form">
        <Field v-slot="{ value, handleChange }" name="vehicleId">
          <div>
            <VehicleSelect
              :vehicles="vehicles"
              :value="value"
              @valueChange="handleChange"
              placeholder="Select a vehicle"
              data-cy="vehicle-select"
            />
            <ErrorMessage name="vehicleId" class="text-destructive mt-1 ml-2 text-sm" data-cy="vehicle-error" />
          </div>
        </Field>
        <Input name="title" placeholder="To-do" type="text" data-cy="todo-title-input" />
        <Textarea name="description" placeholder="To-do description" data-cy="todo-description-input" />

        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field v-slot="{ value, handleChange }" name="priority">
            <Select
              :model-value="value"
              @update:model-value="handleChange"
              class="w-full"
              data-cy="priority-select"
              :clearable="true"
            >
              <SelectTrigger class="w-full" data-cy="priority-trigger">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  :value="null"
                  data-cy="priority-select-none"
                  class="text-muted-foreground hover:text-muted-foreground!"
                  >None</SelectItem
                >
                <SelectItem value="LOW" data-cy="priority-select-low">Low</SelectItem>
                <SelectItem value="MEDIUM" data-cy="priority-select-medium">Medium</SelectItem>
                <SelectItem value="HIGH" data-cy="priority-select-high">High</SelectItem>
                <SelectItem value="CRITICAL" data-cy="priority-select-critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <label class="flex items-center gap-3 font-semibold select-none" data-cy="due-checkbox-label">
            <Checkbox
              :model-value="showDueOptions"
              @update:model-value="showDueOptions = !showDueOptions"
              class="size-6"
              data-cy="due-checkbox"
            />
            <p>Set due information</p>
          </label>
        </div>

        <Transition name="slide">
          <div v-if="showDueOptions" class="slide-panel" data-cy="due-options-panel">
            <div class="slide-content grid grid-cols-1 gap-6 md:grid-cols-2">
              <DateInput name="dueDate" placeholder="Select due date" data-cy="due-date-input" />
              <Input name="dueOdometer" type="number" placeholder="Due Odometer" data-cy="due-odometer-input" />
            </div>
          </div>
        </Transition>

        <DialogFooter>
          <Button type="submit" :disabled="isSubmitting" data-cy="submit-todo-btn">
            <span v-if="!isSubmitting">
              <p v-if="creatingNew">Create</p>
              <p v-else>Save changes</p>
            </span>
            <span v-else>
              <Spinner />
              <p v-if="creatingNew">Creating...</p>
              <p v-else>Saving...</p>
            </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose" data-cy="cancel-todo-btn">Cancel</Button>
        </DialogFooter>
      </form>
    </DialogScrollContent>
  </Dialog>
</template>

<style scoped>
/* Smooth slide-expand transition for mobile stats panel */
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

/* Ensure smooth performance and proper overflow handling */
.slide-panel {
  will-change: grid-template-rows, opacity;
  backface-visibility: hidden;
}

.slide-content {
  overflow: hidden;
}
</style>

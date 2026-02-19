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
import { useSelectedVehicle } from "@/lib/composables/useSelectedVehicle";
import { useTodoCreate, useTodoUpdate } from "@/lib/queries/todos/todo-mutations";
import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";
import { useModalStore } from "@/stores/modal";
import { TodoSchema, type Todo } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";
import Label from "@/components/ui/label/Label.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import { useEditableTodo } from "@/lib/queries/todos/todo-queries";

const { currentVehicle } = useCurrentVehicle();

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createTodo");

const { data: editableTodo } = useEditableTodo(computed(() => (isModalOpen.value ? modalStore.itemId : undefined)));

const creatingNew = computed(() => !editableTodo.value);
const handleClose = () => {
  modalStore.onClose();
};

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

  console.log("TodoModal opened. Editable todo ID: ", modalStore.itemId);
  if (todo) {
    // wait for editableTodo to be fetched before resetting the form

    if (todo) {
      console.log("Editable todo data: ", todo);
      resetForm({
        values: {
          vehicleId: todo.vehicleData.id,
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          dueDate: todo.dueDate?.date,
          dueOdometer: todo.dueOdometer?.value,
        },
      });

      // Show or hide due options based on whether the editable todo has due information
      showDueOptions.value = !!(todo.dueDate || todo.dueOdometer);
    }
  } else {
    showDueOptions.value = false;
    resetForm({
      values: {
        vehicleId: currentVehicle.value?.vehicleData.id || "",
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
    // Updating existing todo
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
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="w-full max-w-2xl" key="TodoModal">
      <DialogHeader>
        <DialogTitle>
          <Icon name="todo" />
          <h3 v-if="creatingNew">Create To-do</h3>
          <h3 v-else>Edit To-do</h3>
        </DialogTitle>
        <DialogDescription v-show="false">
          Create new to-do for your vehicle or edit existing one. You can set a title, description, priority and due
          information for the to-do.
        </DialogDescription>
      </DialogHeader>
      <form @submit="onSubmit" class="flex flex-col gap-4" data-cy="create-todo-form">
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
        <Input name="title" placeholder="To-do" type="text" data-cy="todo-title-input" :maxlength="100" />
        <Textarea
          name="description"
          placeholder="To-do description"
          data-cy="todo-description-input"
          :maxlength="500"
        />

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              <DateInput name="dueDate" placeholder="Select due date" data-cy="due-date-input" />
              <Input
                name="dueOdometer"
                type="number"
                :suffix="selectedVehicleOdometerUnit"
                placeholder="Due Odometer"
                data-cy="due-odometer-input"
              />
            </div>
          </div>
        </Transition>

        <DialogFooter class="">
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

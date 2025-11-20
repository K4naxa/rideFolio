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
import { useTodoQueries } from "@/lib/queries/useTodoQueries";
import { useVehicleQueries } from "@/lib/queries/useVehicleQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useModalStore } from "@/stores/modal";
import { TodoSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

const { activeVehicle } = useActiveVehicle();
const { vehicles } = useVehicleQueries();

const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "createTodo");
const handleClose = () => {
  modalStore.onClose();
};

const { createTodo } = useTodoQueries();

const showDueOptions = ref(false);

const { handleSubmit, resetForm, isSubmitting } = useForm({
  validationSchema: toTypedSchema(TodoSchema),
  initialValues: {
    title: "",
    vehicleId: activeVehicle.value?.vehicleData.id,
  },
});

watch(isModalOpen, (open) => {
  if (open && activeVehicle.value) {
    showDueOptions.value = false;
    resetForm({
      values: {
        vehicleId: activeVehicle.value.vehicleData.id,
      },
    });
  }
});

const onSubmit = handleSubmit(async (values) => {
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
});
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="w-full max-w-2xl" key="CreateTodoModal">
      <DialogHeader>
        <DialogTitle> <Icon name="todo" /> Create To-do </DialogTitle>
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
            <Select :model-value="value" @update:model-value="handleChange" class="w-full" data-cy="priority-select">
              <SelectTrigger class="w-full" data-cy="priority-trigger">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
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
            <span v-if="!isSubmitting">Create</span>
            <span v-else> <Spinner /> Creating.. </span>
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

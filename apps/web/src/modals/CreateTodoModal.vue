<script setup lang="ts">
import DateInput from "@/components/forms/DateInput.vue";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
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
import { Icons } from "@/components/utility/icons";
import { useAccessibleVehicles } from "@/lib/queries/useAccessibleVehicles";
import { useTodoQueries } from "@/lib/queries/useTodoQueries";
import { useActiveVehicle } from "@/lib/useActiveVehicle";
import { useModalStore } from "@/stores/modal";
import { TodoSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

const { activeVehicle } = useActiveVehicle();
const { data: accessibleVehicles } = useAccessibleVehicles();

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
    <DialogScrollContent class="max-w-2xl w-full" key="CreateTodoModal">
      <DialogHeader>
        <DialogTitle> <Icons.todo /> Create To-do </DialogTitle>
      </DialogHeader>
      <form @submit="onSubmit" class="space-y-5">
        <Field v-slot="{ value, handleChange }" name="vehicleId">
          <div>
            <VehicleSelect
              :vehicles="accessibleVehicles || []"
              :value="value"
              @valueChange="handleChange"
              placeholder="Select a vehicle"
            />
            <ErrorMessage name="vehicleId" class="text-sm text-destructive mt-1 ml-2" />
          </div>
        </Field>
        <Input name="title" placeholder="To-do" type="text" />
        <Textarea name="description" placeholder="To-do description" />

        <div class="grid grid-cols-2 gap-6">
          <Field v-slot="{ value, handleChange }" name="priority">
            <Select :model-value="value" @update:model-value="handleChange" class="w-full">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <label class="flex gap-3 items-center font-semibold select-none">
            <Checkbox
              :model-value="showDueOptions"
              @update:model-value="showDueOptions = !showDueOptions"
              class="size-6"
            />
            <p>Set due information</p>
          </label>
        </div>

        <Transition name="slide">
          <div v-if="showDueOptions" class="slide-panel">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 slide-content">
              <DateInput name="dueDate" placeholder="Select due date" />
              <Input name="dueOdometer" type="number" placeholder="Due Odometer" />
            </div>
          </div>
        </Transition>

        <DialogFooter>
          <Button type="submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">Create</span>
            <span v-else> <Spinner /> Creating.. </span>
          </Button>
          <Button type="button" variant="outline" @click="handleClose">Cancel</Button>
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

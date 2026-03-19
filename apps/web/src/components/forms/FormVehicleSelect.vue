<script setup lang="ts">
import { useField } from "vee-validate";
import VehicleSelect from "@/components/forms/VehicleSelect.vue";
import Label from "@/components/ui/label/Label.vue";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  /** Field name — must match your vee-validate schema key */
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  class?: HTMLAttributes["class"];
}>();

const { value, errorMessage, setErrors } = useField<string | undefined>(() => props.name, undefined, {
  validateOnValueUpdate: false,
});

function handleChange(val: string) {
  value.value = val;
  setErrors("");
}
</script>

<template>
  <div :aria-invalid="!!errorMessage" :class="['group', props.class]">
    <Label for="form-vehicle-select" v-if="label" class="group-aria-invalid:text-destructive mb-1 ml-1 font-medium">
      {{ label }}
    </Label>
    <VehicleSelect
      :value="value"
      id="form-vehicle-select"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      @value-change="handleChange"
    />
    <p v-if="errorMessage" role="alert" class="text-destructive mt-1 ml-2 text-sm">
      {{ errorMessage }}
    </p>
  </div>
</template>

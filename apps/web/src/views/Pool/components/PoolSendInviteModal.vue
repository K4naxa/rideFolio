<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import ResponsiveSelect from "@/components/forms/ResponsiveSelect.vue";
import Button from "@/components/ui/button/Button.vue";

import Input from "@/components/ui/input/Input.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { usePoolInviteUser } from "@/lib/queries/pools/pool-mutations";
import { POOL_MEMBER_ROLES, type PoolDetails, PoolInviteSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { isAxiosError } from "axios";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { toast } from "vue-sonner";

const POOL_MEMBER_ROLE_OPTIONS = Object.values(POOL_MEMBER_ROLES)
  .map((role) => ({
    label: role.label,
    value: role.code,
  }))
  .filter((option) => option.value !== "OWNER");

const props = defineProps<{
  open: boolean;
  pool: PoolDetails;
}>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const { mutateAsync: sendPoolInvite } = usePoolInviteUser();

const validationSchema = PoolInviteSchema.refine(
  (data) => !props.pool.members.some((member) => member.user.email === data.email),
  {
    message: "This user is already a member of this group.",
    path: ["email"],
  },
).refine((data) => !(props.pool.invites ?? []).some((invite) => invite.email === data.email), {
  message: "An invite has already been sent to this email.",
  path: ["email"],
});

const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: toTypedSchema(validationSchema),
});

const submit = handleSubmit(async (values) => {
  await sendPoolInvite(values, {
    onSuccess: () => {
      toast.success("Pool invite sent successfully.");
      emit("update:open", false);
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 404) {
          setFieldError("email", "No user found with this email.");
          return;
        }
      }
    },
  });
});
</script>

<template>
  <ResponsiveFormDialog
    :open="props.open"
    @update:open="(val) => emit('update:open', val)"
    title="Invite Member"
    description="Invite a new member to your group"
  >
    <template #default>
      <Input type="text" name="poolId" :initial-value="props.pool.id" hidden />
      <Input type="text" name="email" placeholder="user@example.com" label="Email" />
      <Field name="roleToGrant" v-slot="{ value, handleChange }">
        <div>
          <ResponsiveSelect
            :model-value="value"
            label="Role"
            placeholder="Select a role"
            inputStyle
            @update:model-value="handleChange"
            :options="POOL_MEMBER_ROLE_OPTIONS"
          />
          <ErrorMessage name="roleToGrant" class="text-destructive mt-1 ml-2 text-sm" />
        </div>
      </Field>
    </template>
    <template #footer>
      <Button variant="outline" type="button" @click="emit('update:open', false)"> Cancel </Button>
      <Button type="button" @click="submit()" :disabled="isSubmitting">
        <span v-if="isSubmitting" class="flex items-center gap-2"> <Spinner /> Inviting... </span>
        <span v-else>Send Invite</span>
      </Button>
    </template>
  </ResponsiveFormDialog>
</template>

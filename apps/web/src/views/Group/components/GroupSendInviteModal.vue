<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import ResponsiveSelect from "@/components/forms/ResponsiveSelect.vue";
import Button from "@/components/ui/button/Button.vue";

import FormInput from "@/components/forms/FormInput.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useGroupInviteUser } from "@/lib/queries/groups/group-mutations";
import { GROUP_MEMBER_ROLES, type GroupDetails, GroupInviteSchema } from "@repo/validation";
import { toTypedSchema } from "@vee-validate/zod";
import { isAxiosError } from "axios";
import { ErrorMessage, Field, useForm } from "vee-validate";
import { toast } from "vue-sonner";

const GROUP_MEMBER_ROLE_OPTIONS = Object.values(GROUP_MEMBER_ROLES)
  .map((role) => ({
    label: role.label,
    value: role.code,
  }))
  .filter((option) => option.value !== "OWNER");

const props = defineProps<{
  open: boolean;
  group: GroupDetails;
}>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const { mutateAsync: sendGroupInvite } = useGroupInviteUser();

const validationSchema = GroupInviteSchema.refine(
  (data) => !props.group.members.some((member) => member.user.email === data.email),
  {
    message: "This user is already a member of this group.",
    path: ["email"],
  },
).refine((data) => !(props.group.invites ?? []).some((invite) => invite.email === data.email), {
  message: "An invite has already been sent to this email.",
  path: ["email"],
});

const { handleSubmit, isSubmitting, setFieldError } = useForm({
  validationSchema: toTypedSchema(validationSchema),
});

const submit = handleSubmit(async (values) => {
  await sendGroupInvite(values, {
    onSuccess: () => {
      toast.success("Group invite sent successfully.");
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
      <FormInput type="text" name="groupId" :initial-value="props.group.id" hidden />
      <FormInput type="text" name="email" placeholder="user@example.com" label="Email" />
      <Field name="roleToGrant" v-slot="{ value, handleChange }">
        <div>
          <ResponsiveSelect
            :model-value="value"
            label="Role"
            placeholder="Select a role"
            inputStyle
            @update:model-value="handleChange"
            :options="GROUP_MEMBER_ROLE_OPTIONS"
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

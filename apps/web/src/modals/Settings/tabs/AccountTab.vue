<script setup lang="ts">
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";

import AccountSection from "@/modals/Settings/components/AccountSection.vue";
import DangerSection from "@/modals/Settings/components/DangerSection.vue";
import SecuritySection from "@/modals/Settings/components/SecuritySection.vue";
</script>

<template>
  <div class="flex flex-col">
    <DialogHeader class="hidden">
      <DialogTitle>Account settings</DialogTitle>
      <DialogDescription>
        Manage your account settings and set e.g. your username, email and password.
      </DialogDescription>
    </DialogHeader>

    <div class="flex flex-col gap-12">
      <AccountSection />
      <SecuritySection />
      <!-- TODO: Accounts section that lists linked accounts (google, facebook, etc..) -->
      <DangerSection />
    </div>
  </div>
</template>

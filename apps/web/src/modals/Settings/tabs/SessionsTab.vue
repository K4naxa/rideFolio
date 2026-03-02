<script setup lang="ts">
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Label from "@/components/ui/label/Label.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { authClient } from "@/lib/authClient";

import SessionItem from "@/modals/Settings/components/SessionItem.vue";

import { onMounted, ref } from "vue";
import { toast } from "vue-sonner";

type SessionsResponse = Awaited<ReturnType<typeof authClient.listSessions>>;
const otherSessions = ref<SessionsResponse>([]);
const currentSession = ref<SessionsResponse[0]>(null);

const isRefreshing = ref(false);

onMounted(async () => {
  try {
    await refreshSessions();
  } catch (e) {
    console.error("Failed to load sessions:", e);
  }
});

async function refreshSessions() {
  try {
    console.log("Refreshing sessions...");
    isRefreshing.value = true;
    const result = await authClient.listSessions();
    const curSession = authClient.useSession();
    otherSessions.value = result.data?.filter((session) => session.token !== curSession.value?.data?.session.token);
    currentSession.value = curSession.value?.data?.session || null;
  } catch {
    toast.error("Failed to refresh sessions. Please try again.");
  } finally {
    console.log("Finished refreshing sessions.");
    isRefreshing.value = false;
  }
}

function handleSessionRevoke(sessionToken: string) {
  authClient.revokeSession(
    { token: sessionToken },
    {
      onSuccess: async () => {
        toast.success("Session logged out successfully");

        // Update the sessions list
        refreshSessions();
      },
      onError: () => {
        toast.error("Failed to log out session. Please try again.");
      },
    },
  );
}
</script>

<template>
  <DialogHeader class="hidden">
    <DialogTitle>Sessions</DialogTitle>
    <DialogDescription>Devices and browsers logged in to your account.</DialogDescription>
  </DialogHeader>
  <section class="space-y-8">
    <div class="mb-4">
      <h3 class="flex justify-between gap-4">Sessions</h3>

      <div class="flex justify-between gap-4">
        <span class="text-muted-foreground text-sm"> Devices and browsers logged in to your account. </span>
      </div>
      <Separator class="mt-2" />
    </div>

    <div>
      <Label class="text-muted-foreground mb-1">Current session</Label>
      <SessionItem v-if="currentSession" :session="currentSession" :isCurrent="true" />
    </div>
    <TransitionGroup
      enter-active-class="transition-all duration-200 ease-in-out"
      enter-from-class="opacity-0 "
      enter-to-class="opacity-100 "
      leave-active-class="transition-all duration-200 ease-in-out"
      leave-from-class="opacity-100 "
      leave-to-class="opacity-0 "
    >
      <Label class="text-muted-foreground mb-2">Other sessions</Label>
      <ul class="divide-y">
        <li v-for="session in otherSessions" :key="session.id" class="">
          <SessionItem :session="session" @revoke-session="handleSessionRevoke" />
        </li>
      </ul>
    </TransitionGroup>
  </section>
</template>

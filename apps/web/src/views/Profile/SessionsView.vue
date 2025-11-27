<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "@/components/ui/card/Card.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import { authClient } from "@/lib/authClient";
import SessionCard from "./components/sessionCard.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import Label from "@/components/ui/label/Label.vue";
import { toast } from "vue-sonner";
import Button from "@/components/ui/button/Button.vue";
import { RefreshCwIcon } from "lucide-vue-next";

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
  <Card>
    <CardHeader>
      <CardTitle class="flex justify-between"
        >Active Sessions
        <Button @click="refreshSessions" :disabled="isRefreshing" size="icon-sm" variant="ghost">
          <RefreshCwIcon :class="[isRefreshing ? 'animate-spin' : '']" /> </Button
      ></CardTitle>
      <CardDescription> Manage and log out your active sessions on other browsers and devices. </CardDescription>
    </CardHeader>

    <CardContent>
      <Label class="mt-6 mb-2 font-semibold">Current Session</Label>
      <SessionCard v-if="currentSession" :session="currentSession" :isCurrent="true" />

      <Label class="mt-6 mb-2 font-semibold">Other Sessions</Label>
      <ul v-auto-animate>
        <p v-if="otherSessions.length === 0" class="text-muted-foreground">No other active sessions found.</p>

        <li v-for="session in otherSessions" :key="session.id" class="mb-4">
          <SessionCard :session="session" @revoke-session="handleSessionRevoke" />
        </li>
      </ul>
    </CardContent>
  </Card>
</template>

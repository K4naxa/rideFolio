<script setup lang="ts">
import { ref, onMounted } from "vue";
import Card from "@/components/ui/card/Card.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import { authClient } from "@/lib/authClient";
import CardContent from "@/components/ui/card/CardContent.vue";
import Label from "@/components/ui/label/Label.vue";
import { toast } from "vue-sonner";
import Button from "@/components/ui/button/Button.vue";
import { RefreshCwIcon } from "lucide-vue-next";
import SessionItem from "@/modals/Settings/components/SessionItem.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import HelpTooltip from "@/components/ui/HelpTooltip.vue";

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

function handleRevokeOtherSessions() {
  authClient.revokeOtherSessions(
    {},
    {
      onSuccess: async () => {
        toast.success("All other sessions logged out successfully");

        // Update the sessions list
        refreshSessions();
      },
      onError: () => {
        toast.error("Failed to log out other sessions. Please try again.");
      },
    },
  );
}
</script>

<template>
  <section class="">
    <header>
      <div class="flex items-center gap-2.5">
        <h3>Devices</h3>
        <HelpTooltip message="All devices currently logged into your account" />

        <Button
          size="sm"
          variant="outline"
          class="text-muted-foreground ml-auto text-sm font-medium"
          :disabled="isRefreshing || otherSessions.length === 0"
          @click="handleRevokeOtherSessions"
        >
          Log out other sessions
        </Button>
      </div>
      <Separator class="my-2" />
    </header>

    <div>
      <ul class="divide-border divide-y">
        <SessionItem v-if="currentSession" :session="currentSession" :isCurrent="true" />

        <TransitionGroup
          enter-active-class="transition-all duration-200 ease-in-out"
          enter-from-class="opacity-0 "
          enter-to-class="opacity-100 "
          leave-active-class="transition-all duration-200 ease-in-out"
          leave-from-class="opacity-100 "
          leave-to-class="opacity-0 "
        >
          <li v-for="session in otherSessions" :key="session.id" class="">
            <SessionItem :session="session" @revoke-session="handleSessionRevoke" />
          </li>
        </TransitionGroup>
      </ul>
    </div>
  </section>
</template>

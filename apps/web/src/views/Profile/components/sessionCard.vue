<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";

import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-vue-next";
import { UAParser } from "ua-parser-js";
import { computed } from "vue";

interface SessionCardProps {
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  isCurrent?: boolean;
}

const props = defineProps<SessionCardProps>();
const emits = defineEmits<{
  RevokeSession: [sessionToken: string];
}>();

// Parse user agent once using computed
const userAgentInfo = computed(() => {
  if (!props.session.userAgent) return null;
  const parser = new UAParser(props.session.userAgent);
  return parser.getResult();
});

// Get browser information
const browserInformation = computed(() => {
  if (!userAgentInfo.value) return "Unknown Device";

  const { browser, os } = userAgentInfo.value;
  const browserName = browser.name || null;
  const osName = os.name || null;

  if (!browserName && !osName) return "Unknown Device";
  if (!browserName) return osName;
  if (!osName) return browserName;

  return `${browserName} on ${osName}`;
});

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
</script>

<template>
  <div class="hover:bg-accent/50 space-y-2 rounded-md p-3">
    <div class="flex justify-between">
      <h3 class="text-base">{{ browserInformation }}</h3>
      <Badge v-if="props.isCurrent" variant="secondary">Current Session</Badge>
    </div>
    <div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <SmartphoneIcon v-if="userAgentInfo?.device.type === 'mobile'" />
          <TabletIcon v-else-if="userAgentInfo?.device.type === 'tablet'" />
          <MonitorIcon v-else />
          <div>
            <p class="text-muted-foreground text-sm">Created: {{ formatDate(props.session.createdAt) }}</p>
            <p class="text-muted-foreground text-sm">Expires: {{ formatDate(props.session.expiresAt) }}</p>
          </div>
        </div>
        <Button
          v-if="!props.isCurrent"
          variant="destructive"
          size="icon"
          type="button"
          aria-label="Revoke session"
          @click="emits('RevokeSession', props.session.token)"
        >
          <Icon name="trash" />
        </Button>
      </div>
    </div>
  </div>
</template>

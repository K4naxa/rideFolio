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
  <div class="hover:bg-accent/30 p-3">
    <div class="flex justify-between gap-3">
      <span class="text-sm font-medium">{{ browserInformation }}</span>
      <Badge v-if="props.isCurrent" variant="default">Current Session</Badge>
    </div>
    <div>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <SmartphoneIcon v-if="userAgentInfo?.device.type === 'mobile'" />
          <TabletIcon v-else-if="userAgentInfo?.device.type === 'tablet'" />
          <MonitorIcon v-else />
          <div class="flex items-center gap-2">
            <p class="text-muted-foreground text-sm">Last Active:</p>
            <Badge class="bg-muted text-muted-foreground text-sm">
              {{ formatDate(props.session.updatedAt) }}
            </Badge>
          </div>
        </div>
        <Button
          v-if="!props.isCurrent"
          variant="outline"
          type="button"
          aria-label="Log out session"
          @click="emits('RevokeSession', props.session.token)"
        >
          <span class="text-sm">Log out</span>
        </Button>
      </div>
    </div>
  </div>
</template>

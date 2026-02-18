<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import ResponsiveActivityPreview from "@/components/previews/ResponsiveActivityPreview.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Label from "@/components/ui/label/Label.vue";

import Progressbar from "@/components/ui/Progressbar.vue";
import VehicleScrollArea from "@/components/VehicleScrollArea.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useUpcomingActivityQuery } from "@/lib/queries/upcomingEvents-query";
import { formatBytesToMB } from "@/lib/utils";

import QuickLinkSection from "@/views/Dashboard/components/QuickLinkSection.vue";
import { useTimeAgoIntl } from "@vueuse/core";
import { twMerge } from "tailwind-merge";

const { preferredCurrencySymbol, currentUser, isLoading } = useCurrentUser();

const { data: upcomingActivity } = useUpcomingActivityQuery();
</script>

<template>
  <MainContentWrapper class="flex min-w-0 flex-1 flex-col space-y-8 p-4 lg:p-8">
    <VehicleScrollArea size="lg" />

    <!-- second row -->
    <div class="gaps-lg grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
      <!-- left side -->
      <section class="gaps-lg flex flex-col">
        <div class="flex flex-col overflow-hidden md:max-h-96">
          <h3 class="mb-2">Up Next</h3>
          <Card v-if="!upcomingActivity || upcomingActivity.length === 0" class="rounded border">
            <CardContent class="flex flex-col items-center gap-4 py-4 text-center lg:p-12">
              <Icon name="calendar" class="text-muted-foreground size-6" />
              <div class="space-y-1">
                <p class="text-sm font-medium">No upcoming events</p>
                <CardDescription>
                  Your up coming reminders and tasks will appear here. <br />
                  Create a new to-do or reminder to get started.
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <div
            v-else
            class="gaps-sm scrollbar-macos grid flex-1 grid-flow-col grid-rows-2 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-2 md:grid-rows-none"
          >
            <ResponsiveActivityPreview
              v-for="event in upcomingActivity"
              :item="event"
              :key="event.data.id"
              :activity="event"
            >
              <template #trigger v-if="event.type === 'todo'">
                <button
                  :class="
                    twMerge(
                      'listHover bg-card flex h-fit w-80 cursor-pointer flex-col rounded rounded-l-none border border-l-4 px-4 py-3 shadow-sm md:w-full',
                      (event.data.dueDate?.overdue || event.data.dueOdometer?.overdue) && 'border-l-destructive!',
                    )
                  "
                >
                  <div class="flex justify-between gap-4">
                    <Label class="truncate text-base">{{ event.data.title }}</Label>
                    <Badge variant="muted" class="text-xs">{{ event.vehicle.name }}</Badge>
                  </div>
                  <div
                    class="text-muted-foreground mt-auto flex items-center gap-1 text-sm"
                    v-if="event.data.dueDate?.date || event.data.dueOdometer?.remaining"
                  >
                    Due
                    <p v-if="event.data.dueDate?.date" class=" ">
                      <span :class="twMerge(event.data.dueDate?.overdue && 'text-destructive')">{{
                        useTimeAgoIntl(new Date(event.data.dueDate.date))
                      }}</span>
                    </p>
                    <p v-if="event.data.dueOdometer?.remaining">
                      / {{ event.data.dueOdometer?.remaining }} {{ event.data.dueOdometer?.unit }}
                    </p>
                  </div>
                </button>
              </template>
            </ResponsiveActivityPreview>
          </div>
        </div>

        <QuickLinkSection />
      </section>

      <!-- right side -->
      <section class="flex flex-col">
        <header class="mb-2">
          <h3>Overview</h3>
        </header>

        <Card class="">
          <CardHeader class="flex items-center justify-between gap-2">
            <div>
              <CardTitle class="text-base font-medium!"> Cloud Storage </CardTitle>
              <CardDescription> For vehicle docs & images </CardDescription>
            </div>
            <div class="bg-muted rounded border p-1.5">
              <Icon name="database" class="size-4" />
            </div>
          </CardHeader>

          <CardContent class="flex flex-col">
            <div class="flex justify-between gap-2 text-sm font-medium">
              <span> {{ formatBytesToMB(currentUser?.usedStorageBytes) }} MB </span>
              <span class="text-muted-foreground text-sm">
                {{ formatBytesToMB(currentUser?.subscriptionPlan.maxStorageBytes) }} MB
              </span>
            </div>
            <Progressbar
              :percent="
                currentUser && currentUser.usedStorageBytes && currentUser.subscriptionPlan?.maxStorageBytes
                  ? (currentUser.usedStorageBytes / currentUser.subscriptionPlan.maxStorageBytes) * 100
                  : 0
              "
            />
          </CardContent>
          <CardFooter>
            <Button variant="secondary" class="w-full"> Manage Plan </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  </MainContentWrapper>
</template>

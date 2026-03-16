<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import TodoInteractive from "@/components/todos/TodoInteractive.vue";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";

import Progressbar from "@/components/ui/Progressbar.vue";
import VehicleScrollArea from "@/components/VehicleScrollArea.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useUpcomingActivityQuery } from "@/lib/queries/upcomingEvents-query";
import { formatBytesToMB } from "@/lib/utils";

import QuickLinkSection from "@/views/Dashboard/components/QuickLinkSection.vue";
import MobilePageHeader from "@/Layouts/AuthLayout/components/MobilePageHeader.vue";

const { currentUser } = useCurrentUser();

const { data: upcomingActivity } = useUpcomingActivityQuery();
</script>

<template>
  <MainContentWrapper class="flex min-w-0 flex-1 flex-col space-y-8 p-4 lg:pt-20">
    <template #mobile-header>
      <MobilePageHeader class=""> <h1>Dashboard</h1> </MobilePageHeader>
    </template>
    <VehicleScrollArea size="lg" />

    <!-- second row -->
    <div class="gaps-lg grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
      <!-- left side -->
      <section class="gaps-lg flex flex-col">
        <div class="flex flex-col overflow-hidden md:max-h-96">
          <h2 class="mb-2">Up Next</h2>
          <Card v-if="!upcomingActivity || upcomingActivity.length === 0" class="rounded border">
            <CardContent class="flex flex-col items-center gap-4 py-4 text-center lg:p-12">
              <Icon name="calendar" class="text-muted-foreground size-6" />
              <div class="space-y-1">
                <p class="text-sm font-medium">No upcoming events</p>
                <CardDescription>
                  Your upcoming reminders and tasks will appear here.
                  Create a new to-do to get started.
                </CardDescription>
              </div>
            </CardContent>
          </Card>

          <ul
            v-else
            class="gaps-sm scrollbar-macos grid flex-1 grid-flow-col grid-rows-2 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-2 md:grid-rows-none"
          >
            <template v-for="event in upcomingActivity" :key="event.data.id">
              <TodoInteractive
                v-if="event.type === 'todo'"
                :todo="event.data"
                show-vehicle
              />
            </template>
          </ul>
        </div>

        <QuickLinkSection />
      </section>

      <!-- right side -->
      <section class="flex flex-col">
        <header class="mb-2">
          <h2>Overview</h2>
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

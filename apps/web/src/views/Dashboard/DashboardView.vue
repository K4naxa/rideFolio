<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import Card from "@/components/ui/card/Card.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import CardFooter from "@/components/ui/card/CardFooter.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import Empty from "@/components/ui/empty/Empty.vue";
import EmptyDescription from "@/components/ui/empty/EmptyDescription.vue";
import EmptyHeader from "@/components/ui/empty/EmptyHeader.vue";
import EmptyTitle from "@/components/ui/empty/EmptyTitle.vue";
import Label from "@/components/ui/label/Label.vue";
import Progressbar from "@/components/ui/Progressbar.vue";
import VehicleScrollArea from "@/components/VehicleScrollArea.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { formatBytesToMB } from "@/lib/utils";
import QuickLinkSection from "@/views/Dashboard/components/QuickLinkSection.vue";

const { preferredCurrencySymbol, currentUser, isLoading } = useCurrentUser();
</script>

<template>
  <MainContentWrapper class="flex min-w-0 flex-1 flex-col space-y-8 p-4 lg:p-8">
    <section class="space-y-4">
      <h2>Your Vehicles</h2>
      <VehicleScrollArea size="lg" />
    </section>

    <!-- second row -->
    <div class="gaps-big grid grid-cols-1 lg:grid-cols-[2fr_1fr]">
      <!-- left side -->
      <section class="gaps-big flex flex-col">
        <div>
          <h2 class="mb-2">Up Next</h2>
          <Empty class="cardBackground rounded border">
            <EmptyHeader> <EmptyTitle> No upcoming events </EmptyTitle></EmptyHeader>
            <EmptyDescription>Create reminders or tasks to see them here.</EmptyDescription>
          </Empty>
        </div>

        <QuickLinkSection />
      </section>

      <!-- right side -->
      <section class="gaps-medium flex flex-col">
        <div>
          <header class="mb-2">
            <h3>Overview</h3>
          </header>

          <div class="gaps-medium grid grid-cols-2">
            <div class="card gaps-small col-span-1 flex-1 rounded border p-3">
              <p class="text-muted-foreground text-sm">
                <span> Monthly Spend </span>
              </p>
              <Label class="text-lg"> 450.00 {{ preferredCurrencySymbol }} </Label>
            </div>
            <div class="card gaps-small col-span-1 flex-1 rounded border p-3">
              <p class="text-muted-foreground text-sm">
                <span> Total distance tracked </span>
              </p>
              <span class="text-lg font-medium"> 1240 </span>
              <span class="text-muted-foreground text-sm">km</span>
            </div>
            <Card class="gaps-small col-span-2">
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
                <Button variant="outline" class="text-muted-foreground w-full"> Manage Plan </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </div>
  </MainContentWrapper>
</template>

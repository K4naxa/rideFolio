<script setup lang="ts">
import Icon from "@/components/icons/Icon.vue";
import Button from "@/components/ui/button/Button.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { useStorageBreakdown } from "@/lib/queries/user/user-queries";
import StorageBreakdownElement from "@/modals/Settings/components/StorageBreakdownElement.vue";
import StorageUsageSection from "@/modals/Settings/components/StorageUsageSection.vue";
import VehicleSlotElement from "@/modals/Settings/components/VehicleSlotElement.vue";
</script>

<template>
  <DialogHeader class="hidden">
    <DialogTitle>Storage usage</DialogTitle>
    <DialogDescription>
      See how much storage space your files are using and manage your storage plan.
    </DialogDescription>
  </DialogHeader>
  <section class="space-y-10">
    <div class="mb-4">
      <h3>Usage Summary</h3>
      <span class="text-muted-foreground text-sm">Your current plan limits</span>
      <Separator class="mt-2" />
    </div>

    <div class="gaps-lg grid grid-cols-1 lg:grid-cols-2">
      <StorageUsageSection />

      <StorageBreakdownElement />
    </div>
    <VehicleSlotElement />

    <div class="cardPrimaryBackground border-primary space-y-6 rounded border p-4 py-6">
      <div class="flex items-center gap-4">
        <div class="bg-primary/15 grid aspect-square h-10 w-10 shrink-0 place-content-center rounded">
          <Icon name="subscription" class="stroke-primary" />
        </div>
        <div>
          <h3>Unlock More</h3>
          <p class="text-muted-foreground text-sm">Upgrade your plan to unlock more storage and vehicle slots.</p>
        </div>
      </div>
      <Button class="w-full">Upgrade plan </Button>
    </div>
  </section>
</template>

<script lang="ts" setup>
import Icon from "@/components/icons/Icon.vue";
import CardDescription from "@/components/ui/card/CardDescription.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Spinner from "@/components/ui/spinner/Spinner.vue";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import { useModalStore } from "@/stores/modal";
import { twMerge } from "tailwind-merge";

const { currentUser, isLoading } = useCurrentUser();
const modalStore = useModalStore();
</script>
<template>
  <section v-if="isLoading || !currentUser" class="grid flex-1 place-items-center">
    <Spinner class="size-20" />
  </section>
  <section v-else-if="currentUser" class="flex flex-1 flex-col gap-2">
    <div>
      <div class="flex w-full justify-between gap-8">
        <div>
          <h3 class="flex gap-2">Vehicle Slots</h3>
          <CardDescription v-if="currentUser.subscriptionPlan.maxVehicles > 0" class="text-muted-foreground mt-auto">
            {{ currentUser.subscriptionPlan.maxVehicles - currentUser.usedVehicles }} slots left in your plan
          </CardDescription>
          <CardDescription v-else class="text-muted-foreground mt-auto">
            You have unlimited vehicle slots in your plan
          </CardDescription>
        </div>
      </div>
      <Separator class="my-2" />
    </div>

    <!-- Unlimited Vehicles -->
    <section v-if="currentUser.subscriptionPlan.maxVehicles === -1" class="flex flex-wrap gap-3">
      <div
        v-for="index in currentUser?.usedVehicles"
        :key="`inactive-${index}`"
        :class="
          twMerge(
            'flex aspect-square min-h-0 items-center justify-center rounded',
            'border-2 p-3 lg:p-4',
            'border-primary border-dashed',
          )
        "
        @click="modalStore.onOpen('createVehicle')"
      >
        <Icon name="car" class="stroke-primary size-6 transition-all duration-200 lg:size-8" />
      </div>

      <button
        :class="
          twMerge(
            'flex aspect-square min-h-0 items-center justify-center rounded',
            'border-2 p-3 lg:p-4',
            'border-muted-foreground/50 border-dashed',
            'hover:border-primary hover:bg-primary/5 group cursor-pointer transition-all duration-200',
          )
        "
        @click="modalStore.onOpen('createVehicle')"
      >
        <Icon
          name="car"
          class="stroke-muted-foreground/50 size-6 transition-all duration-200 group-hover:hidden lg:size-8"
        />
        <Icon
          name="plus"
          class="stroke-primary hidden size-6 transition-all duration-200 group-hover:block lg:size-8"
        />
      </button>
    </section>

    <!-- Normal Max vehicles-->
    <section v-else :class="twMerge('flex flex-wrap gap-3')">
      <!-- Active vehicle slots -->
      <div
        v-for="index in currentUser.subscriptionPlan.maxVehicles"
        :key="`active-${index}`"
        :class="
          twMerge(
            'flex aspect-square min-h-0 items-center justify-center rounded',
            'border-2 p-3 lg:p-4',
            'border-primary bg-primary/5 border-solid',
          )
        "
      >
        <Icon name="car" class="stroke-primary size-6 lg:size-8" />
      </div>

      <!-- Inactive vehicle slots -->
      <div
        v-for="index in (currentUser?.subscriptionPlan?.maxVehicles ?? 0) - (currentUser?.usedVehicles ?? 0)"
        :key="`inactive-${index}`"
        :class="
          twMerge(
            'flex aspect-square min-h-0 items-center justify-center rounded',
            'border-2 p-3 lg:p-4',
            'border-muted-foreground/50 border-dashed',
            'hover:border-primary hover:bg-primary/5 group cursor-pointer transition-all duration-200',
          )
        "
        @click="modalStore.onOpen('createVehicle')"
      >
        <Icon
          name="car"
          class="stroke-muted-foreground/50 size-6 transition-all duration-200 group-hover:hidden lg:size-8"
        />
        <Icon
          name="plus"
          class="stroke-primary hidden size-6 transition-all duration-200 group-hover:block lg:size-8"
        />
      </div>
    </section>
  </section>
</template>

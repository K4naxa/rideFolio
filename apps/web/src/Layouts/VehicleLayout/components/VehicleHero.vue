<script setup lang="ts">
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";

import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";

import { EllipsisVerticalIcon } from "lucide-vue-next";
import { ref } from "vue";

import { useModalStore } from "@/stores/modal";
import type { AlertModalData } from "@/modals/alertModal.vue";
import { useRouter } from "vue-router";
import { useVehicleHeroStatCards } from "@/lib/queries/vehicles/vehicle-queries";
import { useVehicleDelete } from "@/lib/queries/vehicles/vehicle-mutations";
import { useCurrentUser } from "@/lib/composables/useCurrentUser";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";

const router = useRouter();
const modalStore = useModalStore();
const { mutateAsync: deleteVehicle } = useVehicleDelete();
const { currentVehicle, currentVehicleId } = useCurrentVehicle();
const { data: statCardData, isLoading } = useVehicleHeroStatCards(currentVehicleId);
const { preferredCurrencySymbol } = useCurrentUser();

function handleDeleteClick() {
  modalStore.onOpen("alert", {
    title: "Delete Vehicle",
    description: currentVehicle.value?.vehicleData.name
      ? `Are you sure you want to delete <b>${currentVehicle.value.vehicleData.name}</b>? <br/> This action cannot be undone.`
      : "Are you sure you want to delete this vehicle? This action cannot be undone.",
    actionButton: {
      label: "Delete",
      class: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    },
    cancelButton: {
      label: "Cancel",
    },
    onAction: async () => {
      console.log("Deleting vehicle...");
      if (!currentVehicleId.value) return;
      await deleteVehicle(currentVehicleId.value);
      router.push("/dashboard");
    },
  } as AlertModalData);
}

const statsOpen = ref(false);
</script>

<template>
  <div class="mb-2 w-full md:mb-3 lg:mb-6" data-cy="vehicle-hero">
    <div class="relative h-52 overflow-hidden">
      <VehicleAvatar
        :src="currentVehicle?.vehicleData.image"
        :type="currentVehicle?.vehicleData.type.code"
        class="absolute inset-0 h-52 w-full rounded-none"
      />
      <div class="absolute inset-0 bg-black/40" />
    </div>

    <div class="relative z-10 -mt-14">
      <MainContentWrapper class="flex w-full justify-between">
        <div class="flex w-full gap-8">
          <VehicleAvatar
            :src="currentVehicle?.vehicleData.image"
            :type="currentVehicle?.vehicleData.type.code"
            class="hidden aspect-video h-28 w-fit shrink-0 shadow-md shadow-black/30 lg:block"
          />

          <div class="grid h-24 w-full grid-cols-1 grid-rows-[3.5rem_1fr]">
            <!-- Name -->
            <div class="flex w-full place-items-end justify-between gap-4 text-white">
              <h1 class="truncate text-3xl leading-tight text-inherit">
                {{ currentVehicle?.vehicleData.name || "Unnamed Vehicle" }}
              </h1>

              <Button variant="ghost" size="icon-sm" class=""> <EllipsisVerticalIcon /> </Button>
            </div>

            <!-- Details -->
            <div class="mt-2 flex gap-4 lg:gap-8">
              <!-- Make -->
              <span
                v-if="currentVehicle?.vehicleData.make"
                class="text-muted-foreground flex items-center gap-2 text-base"
              >
                Make:
                <Badge class="bg-muted text-foreground h-fit rounded-md text-base font-normal">
                  {{ currentVehicle?.vehicleData.make }}
                </Badge>
              </span>

              <span
                v-if="currentVehicle?.vehicleData.model"
                class="text-muted-foreground flex items-center gap-2 text-base"
              >
                Model:
                <Badge class="bg-muted text-foreground h-fit rounded-md text-base font-normal">
                  {{ currentVehicle?.vehicleData.model }}
                </Badge>
              </span>

              <span
                v-if="currentVehicle?.vehicleData.year"
                class="text-muted-foreground flex items-center gap-2 text-base"
              >
                Year:
                <Badge class="bg-muted text-foreground h-fit rounded-md text-base font-normal">
                  {{ currentVehicle?.vehicleData.year }}
                </Badge>
              </span>

              <span
                v-if="currentVehicle?.vehicleData.licensePlate"
                class="text-muted-foreground hidden items-center gap-2 text-base lg:flex"
              >
                License:
                <Badge class="bg-muted text-foreground h-fit rounded-md text-base font-normal">
                  {{ currentVehicle?.vehicleData.licensePlate }}
                </Badge>
              </span>

              <span
                v-if="currentVehicle?.vehicleData.vin"
                class="text-muted-foreground hidden items-center gap-2 text-base lg:flex"
              >
                VIN:
                <Badge class="bg-muted text-foreground h-fit rounded-md text-base font-normal">
                  {{ currentVehicle?.vehicleData.vin }}
                </Badge>
              </span>
            </div>
          </div>
        </div>
      </MainContentWrapper>
    </div>
  </div>
</template>

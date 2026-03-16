<script setup lang="ts">
import Badge from "@/components/ui/badge/Badge.vue";

import { useCurrentVehicle } from "@/lib/composables/useCurrentVehicle";

import { useTemplateRef } from "vue";

import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import MainContentWrapper from "@/Layouts/MainContentWrapper.vue";
import VehicleControls from "@/Layouts/VehicleLayout/components/VehicleControls.vue";

const { currentVehicle, isVehicleOwner } = useCurrentVehicle();

const vehicleHeroNameEl = useTemplateRef("vehicleHeroNameEl");
defineExpose({
  vehicleHeroNameEl,
});
</script>

<template>
  <div class="mb-2 w-full md:mb-3 lg:mb-6" data-cy="vehicle-hero">
    <div class="relative h-60 overflow-hidden">
      <VehicleAvatar
        :src="currentVehicle?.vehicleData.image"
        :type="currentVehicle?.vehicleData.type.code"
        class="absolute inset-0 h-60 w-full rounded-none"
      />
      <div class="absolute inset-0 bg-black/20 md:bg-black/40" />
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
              <h1 id="vehicle-hero-name" ref="vehicleHeroNameEl" class="truncate text-3xl leading-tight text-inherit">
                {{ currentVehicle?.vehicleData.name || "Unnamed Vehicle" }}
              </h1>

              <div class="hidden md:block">
                <VehicleControls v-if="isVehicleOwner" />
              </div>
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

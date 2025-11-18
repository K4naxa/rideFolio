<script setup lang="ts">
import { useAccessibleVehicles } from "@/lib/queries/useAccessibleVehicles";
import { ScrollArea } from "./ui/scroll-area";
import ScrollBar from "./ui/scroll-area/ScrollBar.vue";
import VehicleTypeIcon from "./icons/VehicleTypeIcon.vue";

const { data: vehicles } = useAccessibleVehicles();
</script>

<template>
  <ScrollArea class="w-full pb-2" orientation="horizontal">
    <ul class="flex gap-4 pb-2">
      <RouterLink
        :to="'/vehicles/' + vehicle.vehicleData.id"
        v-for="vehicle in vehicles"
        :key="vehicle.vehicleData.id"
        class="group bg-card hover:border-primary/50 focus-visible:ring-ring/50 flex aspect-4/3 h-24 cursor-pointer flex-col overflow-hidden rounded border transition-shadow duration-200 outline-none hover:shadow-md focus-visible:ring-[3px] sm:h-28 md:h-36 lg:h-40 dark:bg-transparent"
      >
        <!-- Vehicle image / type icon -->
        <div class="relative h-2/3 overflow-hidden rounded-t">
          <img
            v-if="vehicle.vehicleData.image"
            :src="vehicle.vehicleData.image"
            loading="lazy"
            decoding="async"
            alt="Vehicle Image"
            class="grid scale-105 object-cover object-center transition-transform duration-250 ease-in-out group-hover:scale-100"
          />
          <div v-else class="grid h-full place-items-center rounded-t">
            <span class="text-muted-foreground"
              ><VehicleTypeIcon
                :type="vehicle.vehicleData.type"
                class="text-muted-foreground stroke-muted-foreground size-14"
              />
            </span>
          </div>
          <div class="iconBackground absolute inset-x-0 bottom-0 h-1/4" />
        </div>

        <div
          class="flex flex-1 flex-col items-center justify-center gap-0.5 truncate overflow-hidden p-2 pt-0 text-center"
        >
          <span class="text-foreground block w-full truncate text-sm md:font-semibold">
            {{ vehicle.vehicleData.name }}
          </span>
          <span
            v-if="vehicle.vehicleData.make && vehicle.vehicleData.model"
            class="text-muted-foreground hidden w-full truncate text-xs md:block"
          >
            {{ vehicle.vehicleData.make }} {{ vehicle.vehicleData.model }}
          </span>
        </div>
      </RouterLink>
    </ul>

    <ScrollBar orientation="horizontal" />
  </ScrollArea>
</template>

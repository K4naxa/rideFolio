<script setup lang="ts">
import { useActiveVehicle } from "@/lib/useActiveVehicle";

const { activeVehicle } = useActiveVehicle();
</script>
<template>
  Vehicle overview page:

  <h1>
    {{ activeVehicle?.vehicleData.name }}
  </h1>
  <span>odometer: {{ activeVehicle?.vehicleData.odometerData.value }}</span>
</template>

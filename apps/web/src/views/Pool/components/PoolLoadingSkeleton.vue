<script setup lang="ts">
import Card from "@/components/ui/card/Card.vue";
import CardHeader from "@/components/ui/card/CardHeader.vue";
import CardTitle from "@/components/ui/card/CardTitle.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import Skeleton from "@/components/ui/skeleton/Skeleton.vue";
</script>

<template>
  <Card class="h-fit w-full max-w-7xl">
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <Skeleton class="h-8 w-48" />
        <Skeleton class="h-9 w-9 rounded-md" />
      </CardTitle>
    </CardHeader>
    <Separator />

    <CardContent class="space-y-8">
      <!-- Members Section Skeleton -->
      <div class="space-y-4">
        <Skeleton class="h-6 w-32" />
        <div class="space-y-2">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </div>
        <div class="space-y-2">
          <Skeleton class="mb-4 h-5 w-40" />
          <div class="space-y-2 rounded border p-4">
            <div v-for="i in 3" :key="i" class="flex items-center gap-4">
              <Skeleton class="h-8 w-8 rounded-lg" />
              <div class="flex-1 space-y-1">
                <Skeleton class="h-4 w-32" />
                <Skeleton class="h-3 w-48" />
              </div>
              <Skeleton class="h-9 w-24" />
              <Skeleton class="h-5 w-5 rounded" />
            </div>
          </div>
        </div>
      </div>

      <!-- Vehicles Section Skeleton -->
      <div class="space-y-4">
        <div class="flex items-center">
          <Skeleton class="h-6 w-48" />
          <Skeleton class="ml-auto h-9 w-32" />
        </div>
        <div class="space-y-3">
          <div v-for="i in 2" :key="i" class="flex items-center gap-6 rounded px-3 py-2">
            <Skeleton class="h-16 w-28 rounded" />
            <div class="flex-1 space-y-1">
              <Skeleton class="h-4 w-32" />
              <Skeleton class="h-3 w-40" />
            </div>
            <Skeleton class="h-12 w-24" />
            <Skeleton class="h-12 w-24" />
            <Skeleton class="h-12 w-24" />
            <Skeleton class="h-8 w-8 rounded-full" />
            <Skeleton class="h-5 w-5 rounded" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

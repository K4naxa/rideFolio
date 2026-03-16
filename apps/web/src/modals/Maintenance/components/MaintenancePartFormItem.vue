<script setup lang="ts">
import type { MaintenanceCategoryWithParts, MaintenancePartInput, PartLocation } from "@repo/validation";
import { twMerge } from "tailwind-merge";
import PopoverTrigger from "../../../components/ui/popover/PopoverTrigger.vue";
import PopoverContent from "../../../components/ui/popover/PopoverContent.vue";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/icons/Icon.vue";
import Button from "../../../components/ui/button/Button.vue";
import { Popover } from "@/components/ui/popover";

const props = defineProps<{
  part: MaintenancePartInput;
  partCategories: MaintenanceCategoryWithParts[] | undefined;
}>();

const emit = defineEmits<{
  (e: "remove", part: MaintenancePartInput): void;
  (e: "locationToggle", location: PartLocation, part: MaintenancePartInput): void;
  (e: "labelChange", event: Event, part: MaintenancePartInput): void;
}>();

function getPossibleLocations(part: MaintenancePartInput): PartLocation[] {
  return (
    props.partCategories?.flatMap((category) => category.parts).find((p) => p.id === part.partId)?.validLocations || []
  );
}

function isLocationSelected(location: PartLocation, part: MaintenancePartInput): boolean {
  return part.locations.some((loc) => loc.id === location.id);
}
</script>

<template>
  <div class="bg-card mr-1 rounded border p-2.5">
    <div class="flex w-full items-center gap-3">
      <h3 class="truncate">{{ part.partCode }}</h3>
      <Badge variant="outline" class="bg-muted text-muted-foreground border-none text-sm">
        {{ part.categoryCode }}
      </Badge>
      <Popover v-if="getPossibleLocations(part).length > 0">
        <PopoverTrigger>
          <Badge v-if="part.locations.length === 0" variant="outline" class="h-full cursor-pointer">
            select locations
          </Badge>
          <Badge v-else variant="outline" class="h-full cursor-pointer">
            <span v-for="loc in part.locations" :key="loc.id" class="text-primary text-sm">
              {{
                loc.code
                  .split("_")
                  .map((word) => word[0]?.toUpperCase() || "")
                  .join("")
              }}
            </span>
          </Badge>
        </PopoverTrigger>
        <PopoverContent class="p-2" side="bottom" align="start">
          <div class="grid grid-cols-2 gap-2">
            <Button
              v-for="loc in getPossibleLocations(part)"
              type="button"
              variant="outline"
              :class="
                twMerge(
                  'flex-1 justify-center',
                  isLocationSelected(loc, part) ? 'bg-primary! text-primary-foreground!' : '',
                )
              "
              @click="emit('locationToggle', loc, part)"
              :key="loc.id"
            >
              <span>
                {{
                  loc.code
                    .split("_")
                    .map((word) => word[0]?.toUpperCase() || "")
                    .join("")
                }}
              </span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        type="button"
        size="icon-sm"
        @click="emit('remove', part)"
        aria-label="Remove part"
        class="group ml-auto"
      >
        <Icon name="trash" class="text-muted-foreground group-hover:text-destructive size-4 duration-200" />
      </Button>
    </div>
    <div class="flex items-center gap-3">
      <input
        type="text"
        placeholder="Add custom name / details"
        name="customName"
        id="customName"
        class="text-foreground/80 mt-1 w-full rounded-none bg-transparent text-base outline-0 focus:ring-0"
        :value="part.label"
        @input="emit('labelChange', $event, part)"
      />
    </div>
    <div class="mt-4 flex flex-col" v-if="getPossibleLocations(part).length > 0">
      <span class="text-muted-foreground text-sm"> Select locations:</span>
      <div class="mt-2 flex justify-between gap-2">
        <Button
          v-for="loc in getPossibleLocations(part)"
          type="button"
          variant="outline"
          :class="
            twMerge(
              'flex-1 justify-center',
              isLocationSelected(loc, part) ? 'bg-primary! text-primary-foreground!' : '',
            )
          "
          @click="emit('locationToggle', loc, part)"
          :key="loc.id"
        >
          <span>
            {{
              loc.code
                .split("_")
                .map((word) => word[0]?.toUpperCase() || "")
                .join("")
            }}
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>

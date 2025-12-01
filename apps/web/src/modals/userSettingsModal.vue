<script setup lang="ts">
import Button from "@/components/ui/button/Button.vue";
import CardContent from "@/components/ui/card/CardContent.vue";
import Dialog from "@/components/ui/dialog/Dialog.vue";
import DialogDescription from "@/components/ui/dialog/DialogDescription.vue";
import DialogHeader from "@/components/ui/dialog/DialogHeader.vue";
import DialogScrollContent from "@/components/ui/dialog/DialogScrollContent.vue";
import DialogTitle from "@/components/ui/dialog/DialogTitle.vue";
import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import { api } from "@/lib/api";
import { useUser } from "@/lib/queries/useUserQueries";
import { useModalStore } from "@/stores/modal";
import {
  CURRENCIES,
  getCurrencyName,
  getCurrencySymbol,
  getOdometerNamekey,
  getVolumeUnitNamekey,
  ODOMETER_TYPES,
  VOLUME_UNITS,
} from "@repo/validation";
import { useMutation } from "@tanstack/vue-query";
import { computed } from "vue";
import { useQueryClient } from "@tanstack/vue-query";

const queryClient = useQueryClient();
const modalStore = useModalStore();
const isModalOpen = computed(() => modalStore.isOpen && modalStore.type === "userSettings");
const handleClose = () => {
  modalStore.onClose();
};

const { currentUser } = useUser();
console.log("Current User Preferences:", currentUser.value?.preferences);

const updatePreference = useMutation({
  mutationFn: async (preference: { key: string; value: string }) => {
    const res = await api.patch("/users/preferences", {
      key: preference.key,
      value: preference.value,
    });
    return res.data;
  },
  mutationKey: ["updateUserPreference"],
  onSuccess: (data) => {
    console.log("Preference updated successfully:", data);
    queryClient.setQueryData(["currentUser"], data);
  },
});

function handleOdometerTypeChange(type: string) {
  updatePreference.mutate({ key: "odometerType", value: type });
}
function handleVolumeUnitChange(unit: string) {
  updatePreference.mutate(
    { key: "volumeUnit", value: unit },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      },
    },
  );
}
function handleCurrencyChange(currency: string) {
  updatePreference.mutate({ key: "currency", value: currency });
}
</script>

<template>
  <Dialog :open="isModalOpen" @update:open="handleClose">
    <DialogScrollContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>User Settings</DialogTitle>
        <DialogDescription>Manage your user preferences and settings here.</DialogDescription>
      </DialogHeader>
      <Separator />

      <CardContent class="space-y-10 px-0!">
        <!-- Default values -->
        <div>
          <h3 class="text-muted-foreground">Default values</h3>
          <div class="settingGrid">
            <p class="">Odometer type:</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild class="w-36">
                <Button variant="outline" size="sm">
                  {{ getOdometerNamekey(currentUser?.preferences.odometerType ?? "") }}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem
                  v-for="type in ODOMETER_TYPES"
                  :key="type.code"
                  @click="handleOdometerTypeChange(type.code)"
                >
                  {{ type.label }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <!-- Preferred units -->
        <div class="space-y-2">
          <h3 class="text-muted-foreground">Preferred Units</h3>
          <div class="settingGrid">
            <p class="">Fuel volume unit:</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild class="w-36">
                <Button variant="outline" size="sm" class="flex items-center gap-4">
                  {{ getVolumeUnitNamekey(currentUser?.preferences.volumeUnit) }}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem
                  v-for="volume in VOLUME_UNITS"
                  :key="volume.code"
                  @click="handleVolumeUnitChange(volume.code)"
                  >{{ volume.label }}</DropdownMenuItem
                >
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div class="settingGrid">
            <p class="">Currency:</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild class="w-36">
                <Button variant="outline" size="sm" class="flex items-center gap-4">
                  <p v-if="currentUser?.preferences.currency">
                    {{ getCurrencyName(currentUser.preferences.currency) }}
                    <span class="text-muted-foreground ml-2">{{
                      getCurrencySymbol(currentUser.preferences.currency)
                    }}</span>
                  </p>
                  <p v-else>Select Currency</p>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem
                  v-for="option in CURRENCIES"
                  :key="option.code"
                  @click="handleCurrencyChange(option.code)"
                >
                  <p class="text-muted-foreground mr-2">{{ option.symbol }}</p>

                  {{ option.name }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <!-- Preferred consumption units -->
        <div class="space-y-2">
          <h3 class="text-muted-foreground">Consumption units</h3>
          <div class="settingGrid">
            <p class="">Distance odometer:</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild class="w-36">
                <Button variant="outline" size="sm" class="flex items-center gap-4">
                  {{
                    currentUser?.preferences.volumeUnit === "LITER"
                      ? "Liters"
                      : currentUser?.preferences.volumeUnit === "GALLON"
                        ? "Gallons"
                        : "Select Volume Unit"
                  }}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem @click="handleVolumeUnitChange('LITER')">Liters</DropdownMenuItem>
                <DropdownMenuItem @click="handleVolumeUnitChange('GALLON')">Gallons</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div class="settingGrid">
            <p class="">Hourly odometer:</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild class="w-36">
                <Button variant="outline" size="sm" class="flex items-center gap-4">
                  <p v-if="currentUser?.preferences.currency">
                    <span class="text-muted-foreground mr-2">{{
                      getCurrencySymbol(currentUser.preferences.currency)
                    }}</span>
                    {{ getCurrencyName(currentUser.preferences.currency) }}
                  </p>
                  <p v-else>Select Currency</p>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent>
                <DropdownMenuItem
                  v-for="option in CURRENCIES"
                  :key="option.code"
                  @click="handleCurrencyChange(option.code)"
                >
                  <p class="text-muted-foreground mr-2">{{ option.symbol }}</p>

                  {{ option.name }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </DialogScrollContent>
  </Dialog>
</template>

<style scoped>
.settingGrid {
  @apply grid grid-cols-[10rem_auto] items-center;
}
</style>

<script setup lang="ts">
import ResponsiveFormDialog from "@/components/forms/ResponsiveFormDialog.vue";
import Icon from "@/components/icons/Icon.vue";
import Badge from "@/components/ui/badge/Badge.vue";
import Button from "@/components/ui/button/Button.vue";
import Separator from "@/components/ui/separator/Separator.vue";
import VehicleAvatar from "@/components/vehicles/VehicleAvatar.vue";
import AlertModal from "@/modals/alertModal.vue";
import { useModalStore } from "@/stores/modal.ts";
import { useVehiclesAll } from "@/lib/queries/vehicles/vehicle-queries.ts";
import { useCurrentUser } from "@/lib/composables/useCurrentUser.ts";
import { useMaintenanceByIdQuery } from "@/lib/queries/maintenances/maintenance-queries.ts";
import { useMaintenanceDelete } from "@/lib/queries/maintenances/maintenance-mutations.ts";
import { computed, ref } from "vue";
import DetailRow from "@/components/ui/DetailRow.vue";

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isOpen && modalStore.type === "maintenanceDetails");
const maintenanceId = computed(() => (isOpen.value ? modalStore.itemId : undefined));

function handleOpenChange(value: boolean) {
  if (!value && modalStore.type === "maintenanceDetails") modalStore.onClose();
}

const { data: maintenance, isLoading } = useMaintenanceByIdQuery(maintenanceId);

// Vehicle data from cache
const { data: vehicles } = useVehiclesAll();
const vehicle = computed(
  () => vehicles.value?.find((v) => v.vehicleData.id === maintenance.value?.vehicleId)?.vehicleData,
);

const { preferredCurrencySymbol } = useCurrentUser();

const formattedDate = computed(() => {
  if (!maintenance.value?.date) return "";
  return new Date(maintenance.value.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Edit — maintenance modal doesn't support edit yet, but the pattern is ready
function handleEdit() {
  if (!maintenance.value) return;
  modalStore.onOpen("createMaintenance", maintenance.value.id);
}

// Delete
const showDeleteConfirm = ref(false);
const { mutateAsync: deleteMaintenance, isPending: isDeleting } = useMaintenanceDelete();

async function handleDelete() {
  if (!maintenance.value) return;
  await deleteMaintenance({ maintenanceId: maintenance.value.id, vehicleId: maintenance.value.vehicleId });
  modalStore.onClose();
}
</script>

<template>
  <ResponsiveFormDialog
    :open="isOpen"
    @update:open="handleOpenChange"
    title="Maintenance Details"
    icon="maintenance"
    content-class="max-w-xl"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-12">
      <div class="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      <span class="text-muted-foreground text-sm">Loading details...</span>
    </div>

    <template v-else-if="maintenance">
      <!-- Vehicle identity -->
      <div class="flex items-start gap-4">
        <VehicleAvatar :src="vehicle?.image" :type="vehicle?.type.code" class="h-16 w-22 shrink-0 rounded-lg" />
        <div class="flex min-w-0 flex-col gap-1">
          <h3 class="truncate text-lg leading-tight font-medium">{{ vehicle?.name }}</h3>
          <div class="flex flex-wrap items-center gap-1.5">
            <Badge v-if="vehicle?.make" class="bg-muted text-foreground rounded-md text-xs font-normal">
              {{ vehicle.make }}
            </Badge>
            <Badge v-if="vehicle?.model" class="bg-muted text-foreground rounded-md text-xs font-normal">
              {{ vehicle.model }}
            </Badge>
          </div>
          <span class="text-muted-foreground text-xs">{{ formattedDate }}</span>
        </div>
      </div>

      <Separator />

      <!-- Title & type badge -->
      <div class="flex flex-col gap-2">
        <Badge class="bg-maintenance/10 text-maintenance w-fit gap-1 font-medium">
          <Icon name="maintenance" size="sm" />
          Maintenance
        </Badge>
        <h3 class="text-foreground text-base font-medium">{{ maintenance.title }}</h3>
      </div>

      <!-- Notes / description -->
      <template v-if="maintenance.notes">
        <section class="flex flex-col gap-2">
          <h4 class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Description</h4>
          <p class="text-foreground text-sm leading-relaxed whitespace-pre-line">{{ maintenance.notes }}</p>
        </section>
      </template>

      <Separator />

      <!-- Key details grid -->
      <section class="flex flex-col gap-3">
        <h4 class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Details</h4>
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <DetailRow
            label="Odometer"
            :value="`${maintenance.odometerData.value.toLocaleString()} ${maintenance.odometerData.unit}`"
          />
          <DetailRow
            v-if="maintenance.costTotal"
            label="Total cost"
            :value="`${preferredCurrencySymbol}${maintenance.costTotal.toFixed(2)}`"
          />
          <DetailRow v-if="maintenance.serviceProvider" label="Service provider" :value="maintenance.serviceProvider" />
        </div>
      </section>

      <!-- Parts -->
      <template v-if="maintenance.parts.length > 0">
        <Separator />
        <section class="flex flex-col gap-3">
          <h4 class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Parts</h4>
          <div class="flex flex-col gap-2">
            <div
              v-for="part in maintenance.parts"
              :key="part.groupId"
              class="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2.5"
            >
              <div class="flex flex-col gap-0.5">
                <span class="text-foreground text-sm font-medium">
                  {{ part.customName ?? part.partCode }}
                </span>
                <span v-if="part.label" class="text-muted-foreground text-xs">{{ part.label }}</span>
              </div>
              <div v-if="part.locations.length" class="flex flex-wrap gap-1">
                <Badge v-for="loc in part.locations" :key="loc.id" variant="muted" class="text-xs font-normal">
                  {{ loc.nameKey.split(".").pop() }}
                </Badge>
              </div>
            </div>
          </div>
        </section>
      </template>

      <!-- Maintenance image -->
      <template v-if="maintenance.image">
        <Separator />
        <section class="flex flex-col gap-3">
          <h4 class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Photo</h4>
          <img
            :src="maintenance.image"
            alt="Maintenance photo"
            class="w-full rounded-lg object-cover"
            style="max-height: 280px"
          />
        </section>
      </template>

      <!-- Attachments (future) -->
      <template v-if="false">
        <Separator />
        <section class="flex flex-col gap-3">
          <h4 class="text-muted-foreground text-xs font-medium tracking-wide uppercase">Attachments</h4>
          <div class="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-6">
            <div class="bg-muted rounded-full p-2">
              <Icon name="files" class="text-muted-foreground" />
            </div>
            <p class="text-muted-foreground text-sm">Photos, receipts, and documents</p>
          </div>
        </section>
      </template>
    </template>

    <!-- Footer actions -->
    <template v-if="maintenance" #footer>
      <div class="flex w-full items-center gap-2">
        <AlertModal
          title="Delete maintenance"
          description="This will permanently delete this maintenance record and update your vehicle statistics. This action cannot be undone."
          action-label="Delete"
          action-variant="destructive"
          v-model:open="showDeleteConfirm"
          @action="handleDelete"
        >
          <Button variant="ghost" size="sm" class="text-destructive hover:text-destructive" :disabled="isDeleting">
            <Icon name="trash" size="sm" />
            Delete
          </Button>
        </AlertModal>
        <div class="flex-1" />
        <Button variant="outline" size="sm" @click="handleEdit">
          <Icon name="edit" size="sm" />
          Edit
        </Button>
      </div>
    </template>
  </ResponsiveFormDialog>
</template>

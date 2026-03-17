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
import { useRefillByIdQuery } from "@/lib/queries/refills/refill-queries.ts";
import { useRefillDelete } from "@/lib/queries/refills/refill-mutations.ts";
import { computed, ref } from "vue";

const modalStore = useModalStore();

const isOpen = computed(() => modalStore.isOpen && modalStore.type === "refillDetails");
const refillId = computed(() => (isOpen.value ? modalStore.itemId : undefined));

function handleOpenChange(value: boolean) {
  if (!value) modalStore.onClose();
}

const { data: refill, isLoading } = useRefillByIdQuery(refillId);

// Vehicle data from cache
const { data: vehicles } = useVehiclesAll();
const vehicle = computed(() =>
  vehicles.value?.find((v) => v.vehicleData.id === refill.value?.vehicleId)?.vehicleData,
);

const { preferredCurrencySymbol } = useCurrentUser();

const formattedDate = computed(() => {
  if (!refill.value?.date) return "";
  return new Date(refill.value.date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

const pricePerUnitFormatted = computed(() => {
  if (!refill.value?.pricePerUnit) return null;
  return refill.value.pricePerUnit.toFixed(3);
});

// Edit — refill modal doesn't support edit yet, but the pattern is ready
function handleEdit() {
  if (!refill.value) return;
  modalStore.onOpen("createRefill", refill.value.id);
}

// Delete
const showDeleteConfirm = ref(false);
const { mutateAsync: deleteRefill, isPending: isDeleting } = useRefillDelete();

async function handleDelete() {
  if (!refill.value) return;
  await deleteRefill({ refillId: refill.value.id, vehicleId: refill.value.vehicleId });
  modalStore.onClose();
}
</script>

<template>
  <ResponsiveFormDialog
    :open="isOpen"
    @update:open="handleOpenChange"
    title="Refill Details"
    icon="refill"
    content-class="max-w-xl"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center gap-3 py-12">
      <div class="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
      <span class="text-muted-foreground text-sm">Loading details...</span>
    </div>

    <template v-else-if="refill">
      <!-- Vehicle identity -->
      <div class="flex items-start gap-4">
        <VehicleAvatar
          :src="vehicle?.image"
          :type="vehicle?.type.code"
          class="h-16 w-22 shrink-0 rounded-lg"
        />
        <div class="flex min-w-0 flex-col gap-1">
          <h3 class="truncate text-lg font-medium leading-tight">{{ vehicle?.name }}</h3>
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

      <!-- Refill status badges -->
      <div class="flex flex-wrap items-center gap-2">
        <Badge class="bg-refill/10 text-refill gap-1 font-medium">
          <Icon name="refill" size="sm" />
          Fuel Refill
        </Badge>
        <Badge v-if="refill.fullRefill" class="bg-success/10 text-success gap-1 font-medium">
          <Icon name="fullRefill" size="sm" />
          Full tank
        </Badge>
        <Badge v-if="!refill.fullRefill" class="bg-muted text-muted-foreground gap-1 font-medium">
          Partial fill
        </Badge>
        <Badge v-if="refill.skippedRefill" class="bg-warning/15 text-warning gap-1 font-medium">
          <Icon name="skipped" size="sm" />
          Missed fill-up
        </Badge>
      </div>

      <Separator />

      <!-- Main data grid -->
      <section class="flex flex-col gap-3">
        <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Details</h4>
        <div class="grid grid-cols-2 gap-x-6 gap-y-3">
          <DetailRow label="Fuel amount" :value="`${refill.fuelVolume.value} ${refill.fuelVolume.unit}`" />
          <DetailRow label="Odometer" :value="`${refill.odometer.value.toLocaleString()} ${refill.odometer.unit}`" />
          <DetailRow
            v-if="refill.costTotal"
            label="Total cost"
            :value="`${preferredCurrencySymbol}${refill.costTotal.toFixed(2)}`"
          />
          <DetailRow
            v-if="pricePerUnitFormatted"
            label="Price per unit"
            :value="`${preferredCurrencySymbol}${pricePerUnitFormatted} / ${refill.fuelVolume.unit}`"
          />
          <DetailRow
            v-if="refill.consumption"
            label="Consumption"
            :value="`${refill.consumption.value} ${refill.consumption.unit}`"
          />
        </div>
      </section>

      <!-- Notes -->
      <template v-if="refill.notes">
        <Separator />
        <section class="flex flex-col gap-2">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Notes</h4>
          <p class="text-foreground text-sm leading-relaxed whitespace-pre-line">{{ refill.notes }}</p>
        </section>
      </template>

      <!-- Creator -->
      <template v-if="refill.creator">
        <Separator />
        <section class="flex flex-col gap-2">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Logged by</h4>
          <div class="flex items-center gap-2">
            <div class="bg-muted flex size-7 items-center justify-center rounded-full">
              <Icon name="user" size="sm" class="text-muted-foreground" />
            </div>
            <span class="text-foreground text-sm font-medium">{{ refill.creator.name }}</span>
          </div>
        </section>
      </template>

      <!-- Attachments (future) -->
      <template v-if="false">
        <Separator />
        <section class="flex flex-col gap-3">
          <h4 class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Attachments</h4>
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
    <template v-if="refill" #footer>
      <div class="flex w-full items-center gap-2">
        <AlertModal
          title="Delete refill"
          description="This will permanently delete this refill and recalculate your vehicle statistics. This action cannot be undone."
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

<!-- DetailRow sub-component -->
<script lang="ts">
import { defineComponent, h } from "vue";

const DetailRow = defineComponent({
  name: "DetailRow",
  props: {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  setup(props) {
    return () =>
      h("div", { class: "flex flex-col gap-0.5" }, [
        h("span", { class: "text-muted-foreground text-xs" }, props.label),
        h("span", { class: "text-foreground text-sm font-medium" }, props.value || "\u2014"),
      ]);
  },
});
</script>

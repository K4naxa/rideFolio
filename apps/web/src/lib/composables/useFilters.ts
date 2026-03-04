import { computed, ref, shallowRef } from "vue";

type FilterMode = "checkbox" | "radio";

interface FilterOptions<TType extends string> {
  types?: TType[];
  mode?: FilterMode;
}

export function useFilters<TType extends string>(options: FilterOptions<TType>) {
  const { types: initialTypes = [], mode = "checkbox" } = options;

  const searchQuery = ref("");
  const vehicleIdFilter = ref("");
  const activeTypes = shallowRef<TType[]>([...initialTypes]);

  //   Type Toggle
  function toggleType(type: TType) {
    if (mode === "radio") {
      activeTypes.value = activeTypes.value[0] === type ? [] : [type];
    } else {
      const currentTypes = activeTypes.value;

      activeTypes.value = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
    }
  }

  function clearTypes() {
    activeTypes.value = [];
  }

  const allTypesActive = computed(() => activeTypes.value.length === 0);
  const isTypeActive = (type: TType) => activeTypes.value.includes(type);

  const hasActiveFilters = computed(() =>
    Boolean(searchQuery.value || vehicleIdFilter.value || activeTypes.value.length > 0),
  );

  function clearAllFilters() {
    searchQuery.value = "";
    vehicleIdFilter.value = "";
    activeTypes.value = [];
  }

  return {
    searchQuery,
    vehicleIdFilter,
    activeTypes,
    toggleType,
    clearTypes,
    allTypesActive,
    isTypeActive,
    hasActiveFilters,
    clearAllFilters,
  };
}

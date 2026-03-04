export const queryKeys = {
  // ============ VEHICLES DOMAIN ============
  vehicles: {
    all: ["vehicles"] as const,
    byId: (vehicleId: string) => ["vehicles", "id", vehicleId] as const,
    lists: () => ["vehicles", "list"] as const,
    details: () => ["vehicles", "details"] as const,
    detailsForVehicle: (vehicleId: string) => ["vehicles", "details", vehicleId] as const,

    // Vehicle sub-resources (nested under vehicle entity)
    refills: (vehicleId: string) => ["vehicles", "details", vehicleId, "refills"] as const,
    maintenances: (vehicleId: string) => ["vehicles", "details", vehicleId, "maintenances"] as const,

    consumptionCharts: (vehicleId: string) => ["vehicles", "details", vehicleId, "consumption-chart"] as const,
    consumptionChart: (vehicleId: string, timeRange: number) =>
      ["vehicles", "details", vehicleId, "consumption-chart", { timeRange }] as const,

    heroStatCards: (vehicleId: string) => ["vehicles", "details", vehicleId, "hero-stat-cards"] as const,
  },

  // ============ GROUPS DOMAIN ============
  groups: {
    all: ["groups"] as const,
    lists: () => ["groups", "list"] as const,
    detail: (groupId: string) => ["groups", "detail", groupId] as const,
  },

  // ============ TIMELINES DOMAIN (Cross-cutting) ============
  timelines: {
    all: ["timelines"] as const,
    byVehicle: (vehicleId: string) => ["timelines", "vehicle", vehicleId] as const,
    byGroup: (groupId: string) => ["timelines", "group", groupId] as const,
    byUser: (userId: string) => ["timelines", "user", userId] as const,
    filtered: (query: object) => ["timelines", "filtered", query] as const,
  },

  // ============ TODOS DOMAIN ============
  todos: {
    all: ["todos"] as const,
    byId: (todoId: string) => ["todos", "id", todoId] as const,
    byVehicle: (vehicleId: string) => ["todos", "vehicle", vehicleId] as const,
  },

  // ============ NOTES DOMAIN ============
  notes: {
    all: ["notes"] as const,
    byId: (noteId: string) => ["notes", "id", noteId] as const,
    byVehicle: (vehicleId: string) => ["notes", "vehicle", vehicleId] as const,
    editable: (noteId: string) => ["notes", "editable", noteId] as const,
  },

  // ============ MAINTENANCE DOMAIN ============
  maintenances: {
    partCategories: (vehicleType?: string) => ["maintenances", "part-categories", { vehicleType }] as const,
    types: () => ["maintenances", "types"] as const,
  },

  // ============ SHOPPING LIST DOMAIN ============
  shoppingList: {
    all: ["shopping-list"] as const,
    byVehicle: (vehicleId: string) => ["shopping-list", "vehicle", vehicleId] as const,
  },

  notification: {
    all: ["notifications"] as const,
  },

  user: {
    basicProfile: ["user", "basic-profile"] as const,
    limits: ["user", "limits"] as const,
    storageSummary: ["user", "storage-summary"] as const,
    upcomingActivity: ["user", "upcoming-activity"] as const,
  },
};

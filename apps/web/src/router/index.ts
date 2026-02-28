import { authClient } from "@/lib/authClient";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/views/Login-Register/LoginView.vue"),
      meta: { guestOnly: true },
    },
    {
      path: "/register",
      name: "Register",
      component: () => import("@/views/Login-Register/RegisterView.vue"),
      meta: { guestOnly: true },
    },

    {
      path: "/verify-email",
      name: "Verify Email",
      component: () => import("@/views/Login-Register/verifyEmailView.vue"),
      meta: { guestOnly: true },
    },
    {
      path: "/",
      component: () => import("@/Layouts/AuthLayout/AuthLayout.vue"),
      redirect: "/dashboard",
      meta: { requiresAuth: true },
      children: [
        {
          path: "/dashboard",
          name: "Dashboard",
          component: () => import("@/views/Dashboard/DashboardView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/notes",
          name: "Notes",
          component: () => import("@/views/Notes/NotesView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/todos",
          name: "To-Dos",
          component: () => import("@/views/Todos/TodosView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/timeline",
          name: "Timeline",
          component: () => import("@/views/timeline/TimelineView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/vehicles/:vehicleId",
          name: "Vehicle Layout",
          meta: { requiresAuth: true },
          component: () => import("@/Layouts/VehicleLayout/VehicleLayout.vue"),
          children: [
            {
              path: "",
              name: "Overview",
              meta: { requiresAuth: true },
              component: () => import("@/views/VehiclePage/vehicleOverview/VehicleOverview.vue"),
            },
            {
              path: "todos",
              name: "to-dos",
              meta: { requiresAuth: true },
              component: () => import("@/views/VehiclePage/VehicleTodos/VehicleTodosView.vue"),
            },
            {
              path: "shopping-list",
              name: "Shopping list",
              meta: { requiresAuth: true },
              component: () => import("@/views/VehiclePage/vehicleShopping/VehicleShoppingView.vue"),
            },
            {
              path: "notes",
              name: "Vehicle Notes",
              meta: { requiresAuth: true },
              component: () => import("@/views/VehiclePage/VehicleNotes/VehicleNotesView.vue"),
            },
          ],
        },
        {
          path: "/pools",
          name: "Pools",
          meta: { requiresAuth: true },
          children: [
            {
              path: ":poolId",
              name: "Pool View",
              meta: { requiresAuth: true },
              component: () => import("@/views/Pool/PoolView.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "Not Found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  try {
    const sessionResult = await authClient.getSession();
    const isAuthenticated = sessionResult.data?.user !== undefined;
    if (to.meta.guestOnly) {
      if (!isAuthenticated) return next();
      else return next({ name: "Dashboard" });
    }

    if (to.meta.requiresAuth) {
      if (isAuthenticated) return next();
      else return next({ name: "Login" });
    }

    // If no meta properties match, allow navigation
    return next();
  } catch (e) {
    return next({ name: "Login" });
  }
});

export default router;

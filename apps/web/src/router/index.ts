import AuthLayout from "@/Layouts/AuthLayout/AuthLayout.vue";
import VehicleLayout from "@/Layouts/VehicleLayout/VehicleLayout.vue";
import { authClient } from "@/lib/authClient";
import DashboardView from "@/views/Dashboard/DashboardView.vue";
import LoginView from "@/views/Login-Register/LoginView.vue";
import RegisterView from "@/views/Login-Register/RegisterView.vue";
import VehicleNotesView from "@/views/VehiclePage/VehicleNotes/VehicleNotesView.vue";
import VehicleOverview from "@/views/VehiclePage/vehicleOverview/VehicleOverview.vue";
import VehicleShoppingView from "@/views/VehiclePage/vehicleShopping/VehicleShoppingView.vue";
import VehicleTodosView from "@/views/VehiclePage/VehicleTodos/VehicleTodosView.vue";
import NotesView from "@/views/Notes/NotesView.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: "/register",
      name: "Register",
      component: RegisterView,
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
      component: AuthLayout,
      redirect: "/dashboard",
      meta: { requiresAuth: true },
      children: [
        {
          path: "/dashboard",
          name: "Dashboard",
          component: DashboardView,
          meta: { requiresAuth: true },
        },
        {
          path: "/notes",
          name: "Notes",
          component: NotesView,
          meta: { requiresAuth: true },
        },
        {
          path: "/todos",
          name: "To-Dos",
          component: () => import("@/views/Todos/TodosView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/vehicles/:vehicleId",
          name: "Vehicle Layout",
          meta: { requiresAuth: true },
          component: VehicleLayout,
          children: [
            {
              path: "",
              name: "Overview",
              meta: { requiresAuth: true },
              component: VehicleOverview,
            },
            {
              path: "todos",
              name: "to-dos",
              meta: { requiresAuth: true },
              component: VehicleTodosView,
            },
            {
              path: "timelapse",
              name: "Timelapse",
              meta: { requiresAuth: true },
              component: () => import("@/views/VehiclePage/Timelapse/TimelapseView.vue"),
            },
            {
              path: "shopping-list",
              name: "Shopping list",
              meta: { requiresAuth: true },
              component: VehicleShoppingView,
            },
            {
              path: "notes",
              name: "Vehicle Notes",
              meta: { requiresAuth: true },
              component: VehicleNotesView,
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

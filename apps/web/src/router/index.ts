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
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { guestOnly: true },
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
      meta: { guestOnly: true },
    },

    {
      path: "/verify-email",
      name: "verify-email",
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
          name: "dashboard",
          component: DashboardView,
          meta: { requiresAuth: true },
        },
        {
          path: "/notes",
          name: "notes",
          component: () => import("@/views/Notes/NotesView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/todos",
          name: "todos",
          component: () => import("@/views/Todos/TodosView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/settings",
          name: "settings layout",
          component: () => import("@/Layouts/SettingsLayout.vue"),
          meta: { requiresAuth: true },
          children: [
            {
              path: "",
              name: "settings redirect",
              redirect: "/settings/preferences",
            },
            {
              path: "preferences",
              name: "Preference Settings",
              meta: { requiresAuth: true },
              component: () => import("@/views/Settings/SettingsPreferenceView.vue"),
            },
          ],
        },
        {
          path: "/profile",
          name: "profile layout",
          component: () => import("@/Layouts/ProfileLayout.vue"),
          meta: { requiresAuth: true },
          children: [
            {
              path: "",
              name: "profile",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/ProfileView.vue"),
            },
            {
              path: "security",
              name: "profile-security",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/SecurityView.vue"),
            },
            {
              path: "sessions",
              name: "profile-sessions",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/SessionsView.vue"),
            },
            {
              path: "danger",
              name: "profile-danger",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/DangerView.vue"),
            },
          ],
        },
        {
          path: "/vehicles/:vehicleId",
          name: "VehicleLayout",
          meta: { requiresAuth: true },
          component: VehicleLayout,
          children: [
            {
              path: "",
              name: "VehicleOverview",
              meta: { requiresAuth: true },
              component: VehicleOverview,
            },
            {
              path: "todos",
              name: "Vehicle Todos",
              meta: { requiresAuth: true },
              component: VehicleTodosView,
            },
            {
              path: "shopping-list",
              name: "Vehicle Shopping list",
              meta: { requiresAuth: true },
              component: VehicleShoppingView,
            },
            {
              path: "notes",
              name: "Vehicle notes",
              meta: { requiresAuth: true },
              component: VehicleNotesView,
            },
          ],
        },
        {
          path: "/pools",
          name: "pools",
          meta: { requiresAuth: true },
          children: [
            {
              path: ":poolId",
              name: "pool-view",
              meta: { requiresAuth: true },
              component: () => import("@/views/Pool/PoolView.vue"),
            },
          ],
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
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
      else return next({ name: "dashboard" });
    }

    if (to.meta.requiresAuth) {
      if (isAuthenticated) return next();
      else return next({ name: "login" });
    }

    // If no meta properties match, allow navigation
    return next();
  } catch (e) {
    return next({ name: "login" });
  }
});

export default router;

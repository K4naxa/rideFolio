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
          component: () => import("@/views/Notes/NotesView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/todos",
          name: "Todos",
          component: () => import("@/views/Todos/TodosView.vue"),
          meta: { requiresAuth: true },
        },
        {
          path: "/settings",
          name: "Settings Layout",
          component: () => import("@/Layouts/SettingsLayout.vue"),
          meta: { requiresAuth: true },
          children: [
            {
              path: "",
              name: "Settings Redirect",
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
          name: "Profile Layout",
          component: () => import("@/Layouts/ProfileLayout.vue"),
          meta: { requiresAuth: true },
          children: [
            {
              path: "",
              name: "Profile",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/ProfileView.vue"),
            },
            {
              path: "security",
              name: "Profile Security",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/SecurityView.vue"),
            },
            {
              path: "sessions",
              name: "Profile Sessions",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/SessionsView.vue"),
            },
            {
              path: "danger",
              name: "Profile Danger",
              meta: { requiresAuth: true },
              component: () => import("@/views/Profile/DangerView.vue"),
            },
          ],
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
              name: "Todos",
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
              name: "Notes",
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

import AuthLayout from "@/Layouts/AuthLayout/AuthLayout.vue";
import ProfileLayout from "@/Layouts/ProfileLayout.vue";
import VehicleLayout from "@/Layouts/VehicleLayout/VehicleLayout.vue";
import { authClient } from "@/lib/authClient";
import DashboardView from "@/views/Dashboard/DashboardView.vue";
import LoginView from "@/views/LoginView.vue";
import ProfileView from "@/views/Profile/ProfileView.vue";
import SecurityView from "@/views/Profile/SecurityView.vue";
import RegisterView from "@/views/RegisterView.vue";
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
    },
    {
      path: "/register",
      name: "register",
      component: RegisterView,
    },
    {
      path: "/",
      component: AuthLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "/dashboard",
          name: "dashboard",
          component: DashboardView,
          meta: { requiresAuth: true },
        },
        {
          path: "/profile",
          name: "profile layout",
          component: ProfileLayout,
          meta: { requiresAuth: true },
          children: [
            {
              path: "",
              name: "profile",
              meta: { requiresAuth: true },
              component: ProfileView,
            },
            {
              path: "security",
              name: "security",
              meta: { requiresAuth: true },
              component: SecurityView,
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
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) return next();

  try {
    const sessionResult = await authClient.getSession();
    const user = sessionResult.data?.user;
    if (user) return next();
    else return next({ name: "login" });
  } catch (e) {
    return next({ name: "login" });
  }
});

export default router;

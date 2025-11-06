import AuthLayout from "@/Layouts/AuthLayout.vue";
import VehicleLayout from "@/Layouts/VehicleLayout/VehicleLayout.vue";
import { authClient } from "@/lib/authClient";
import DashboardView from "@/views/Dashboard/DashboardView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import VehicleOverview from "@/views/VehiclePage/VehicleOverview.vue";
import VehicleTodos from "@/views/VehiclePage/VehicleTodos/VehicleTodos.vue";
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
              component: VehicleTodos,
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
    console.log("⏳ Session validated");
    const sessionResult = await authClient.getSession();
    const user = sessionResult.data?.user;
    if (user) return next();
    else return next({ name: "login" });
  } catch (e) {
    return next({ name: "login" });
  }
});

export default router;

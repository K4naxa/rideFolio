import AuthLayout from "@/Layouts/AuthLayout.vue";
import { authClient } from "@/lib/authClient";
import DashboardView from "@/views/Dashboard/DashboardView.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import VehicleOverview from "@/views/VehiclePage/VehicleOverview.vue";
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
          name: "VehiclePage",
          meta: { requiresAuth: true },
          component: VehicleOverview,
        },
      ],
    },
  ],
});

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) next();

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

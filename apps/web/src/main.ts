import "./assets/main.css";
import "vue-sonner/style.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { VueQueryPlugin } from "@tanstack/vue-query";
import { useThemeStore } from "@/stores/theme";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(VueQueryPlugin);

const themeStore = useThemeStore();
themeStore.initialize();

app.mount("#app");

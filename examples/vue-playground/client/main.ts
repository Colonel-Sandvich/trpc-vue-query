import { VueQueryPlugin } from "@tanstack/vue-query";
import { createApp } from "vue";
import App from "./src/App.vue";

createApp(App).use(VueQueryPlugin).mount("#app");

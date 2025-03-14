// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  srcDir: "src/",
  watch: ["../../../dist"],
  compatibilityDate: "2024-04-03",
});

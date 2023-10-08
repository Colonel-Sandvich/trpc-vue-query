---
"@colonel-sandvich/trpc-vue-query": minor
---

Rename `createTRPCVueClient` -> `createTrpcVueClient`
Add `createNuxtApiHandler`, `createH3ApiHandler` (alias) to correctly capture tRPC client calls in nuxt/h3
Add `customFetchWrapper` so Nuxt users can have correctly working SSR when using tRPC
Fix various types surrounding `useMutation`

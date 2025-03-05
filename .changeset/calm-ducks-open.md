---
"@colonel-sandvich/trpc-vue-query": minor
---

# Breaking changes

You must now use install "@trpc/client": "11.0.0-rc.824" and "@trpc/server": "11.0.0-rc.824". There is possible breaking changes between every trpc release, and this version of the package is built against this version.

Requires typescript@^5.8.2.

# Features

Added ability to use `skipToken` directly. Refer to [examples/vue-playground/client/src/skipToken.vue](examples/vue-playground/client/src/skipToken.vue)

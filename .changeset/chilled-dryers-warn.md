---
"@colonel-sandvich/trpc-vue-query": minor
---

# Breaking

- Users must now make the trpc proxy instance themselves and pass it to us when creating the augmented client. This is just simpler for the library to handle and most will already have this trpc instance lying around.

# Improvements

- Improved query invalidation and key generation

# Other

- Changed how we handle query keys internally

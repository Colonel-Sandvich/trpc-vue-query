<script setup lang="ts">
import { createTRPCVueClient } from "@colonel-sandvich/trpc-vue-query";
import { useIsFetching, useQueryClient } from "@tanstack/vue-query";
import { httpBatchLink } from "@trpc/client";
import { ref } from "vue";
import { AppRouter } from "../server";

const trpc = createTRPCVueClient<AppRouter>(
  {
    links: [
      httpBatchLink({
        url: "http://localhost:3000",
      }),
    ],
  },
  useQueryClient(),
);

const {
  data: helloName,
  isFetching,
  isError,
  error,
} = trpc.helloName.useQuery();

const newName = ref<string>("Jeff");

const { mutate } = trpc.changeName.useMutation({
  onSuccess: () => trpc.helloName.invalidate(),
});

const isFetchingViaKey = useIsFetching({
  queryKey: trpc.helloName.queryKey(),
});
</script>

<template>
  <p>Hello World!</p>
  <p v-if="isError">Error!! {{ error }}</p>
  <p v-if="isFetching">Loading...</p>
  <p v-if="!isFetching && helloName">{{ helloName }}</p>
  <p>Not your name?</p>
  <input v-model="newName" />
  <button @click="() => mutate(newName)">Change my name!</button>
  <p>{{ isFetchingViaKey ? true : false }}</p>
</template>

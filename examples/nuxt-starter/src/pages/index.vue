<script setup lang="ts">
import { useIsFetching } from "@tanstack/vue-query";

const trpc = useClient();

const {
  data: helloName,
  suspense,
  isPending,
  isError,
  error,
} = trpc.helloName.useQuery();

const newName = ref("Jeff");

const { mutate } = trpc.changeName.useMutation({
  onSettled: () => trpc.helloName.invalidate(),
});

const isFetchingViaKey = useIsFetching({
  queryKey: trpc.helloName.queryKey(),
});

onServerPrefetch(suspense);
</script>

<template>
  <h1>Typical usage of `useQuery` and `useMutation`</h1>
  <p v-if="isError">Error!! {{ error }}</p>
  <p v-if="isPending">Loading...</p>
  <p v-if="!isPending && helloName">{{ helloName }}</p>
  <p>Not your name?</p>
  <input v-model="newName" />
  <button @click="() => mutate(newName)">Change my name!</button>
  <p>
    Result of `useIsFetching` with query key:
    {{ isFetchingViaKey ? true : false }}
  </p>
</template>

<script setup lang="ts">
import { useIsFetching } from "@tanstack/vue-query";
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";

const trpc = useClient();

const {
  data: helloName,
  isPending,
  isError,
  error,
} = trpc.helloName.useSuspenseQuery();

const newName = ref("Jeff");

const { mutate } = trpc.changeName.useMutation({
  onSettled: () => trpc.helloName.invalidate(),
});

const isFetchingViaKey = useIsFetching({
  queryKey: trpc.helloName.queryKey(),
});

const oneTimeFetch = async () => alert(await trpc.client.helloName.query());
const oneTimeMutate = async () => {
  await trpc.client.changeName.mutate("One time");
  await trpc.helloName.invalidate(undefined, {});
};

const counter = ref(0);
const plusOneQuery = trpc.plusOne.useQuery(counter);
</script>

<template>
  <VueQueryDevtools />
  <h1>Typical usage of `useQuery` and `useMutation`</h1>
  <p v-if="isError">Error!! {{ error }}</p>
  <p v-if="isPending">Loading...</p>
  <p v-if="!isPending && helloName">{{ helloName }}</p>
  <p>Not your name?</p>
  <input v-model="newName" />
  <button @click="mutate(newName)">Change my name!</button>
  <p>
    Result of `useIsFetching` with query key:
    {{ isFetchingViaKey ? true : false }}
  </p>
  <button @click="oneTimeFetch">One time fetch!</button>
  <button @click="oneTimeMutate">One time mutate!</button>
  <p>{{ plusOneQuery.data }}</p>
  <button @click="counter++">Click me!</button>
</template>

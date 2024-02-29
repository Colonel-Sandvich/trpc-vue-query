<script setup lang="ts">
import { useIsFetching } from "@tanstack/vue-query";
import { ref } from "vue";
import { useTrpc } from "./trpc";

const trpc = useTrpc();

const {
  data: helloName,
  isFetching,
  isError,
  error,
} = trpc.helloName.useQuery();

const newName = ref("Jeff");

const { mutate, variables } = trpc.changeName.useMutation({
  onSuccess: () => trpc.helloName.invalidate(),
});

const isFetchingViaKey = useIsFetching({
  queryKey: trpc.helloName.queryKey(),
});
</script>

<template>
  <h1>Typical usage of `useQuery` and `useMutation`</h1>
  <p v-if="isError">Error!! {{ error }}</p>
  <p v-if="isFetching">Loading...</p>
  <p v-if="!isFetching && helloName">{{ helloName }}</p>
  <p>Not your name?</p>
  <input v-model="newName" />
  <button @click="() => mutate({ input: newName })">Change my name!</button>
  <p>
    Result of `useIsFetching` with query key:
    {{ isFetchingViaKey ? true : false }}
  </p>
  <p v-if="variables">Optimistically updated: {{ variables.input }}</p>
</template>

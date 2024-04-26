<script setup lang="ts">
import { useIsFetching, useQueryClient } from "@tanstack/vue-query";
import { ref } from "vue";
import { useClient } from "./composables/useClient";

const client = useClient();

const {
  data: helloName,
  isFetching,
  isError,
  error,
} = client.helloName.useQuery();

const newName = ref("Jeff");

const { mutate, variables, isPending } = client.changeName.useMutation({
  onSuccess: () => client.helloName.invalidate(),
});

const y = client.helloName.getQueryData();
// Tagged query keys if you need them
const x = useQueryClient().getQueryData(client.helloName.queryKey());
//    ^?

const queryKey = client.reactiveToInput.queryKey();
const queryKeyWithInput = client.reactiveToInput.queryKey(1);

const isFetchingViaKey = useIsFetching({
  queryKey: client.helloName.queryKey(),
});
</script>

<template>
  <h1>Typical usage of `useQuery` and `useMutation`</h1>
  <h3>All procedures are deliberately delayed by 1 second</h3>
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
  <p>
    Is mutating:
    {{ isPending }}
  </p>
  <p v-if="variables">Optimistically updated: {{ variables.input }}</p>
</template>

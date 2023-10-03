<script setup lang="ts">
import { ref } from "vue";
import { useTrpc } from "./trpc";

const trpc = useTrpc();

const counter = ref(0);

const enabled = ref(true);

const { data, isFetching } = trpc.reactiveToInput.useQuery(counter, {
  enabled,
});
</script>

<template>
  <h1>Demonstrates the reactivity of the options parameter</h1>
  <p>Query Enabled: {{ enabled }}</p>
  <p v-if="isFetching">Loading...</p>
  <p v-if="data">{{ data }}</p>
  <button @click="() => counter++">Change</button>
  <p>Reactive Query Key: {{ trpc.reactiveToInput.queryKey(counter) }}</p>
  <button @click="() => (enabled = !enabled)">Toggle Query Enabled</button>
</template>

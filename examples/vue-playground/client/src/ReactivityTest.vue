<script setup lang="ts">
import { ref } from "vue";
import { useClient } from "./composables/useClient";

const counter = ref(0);

const enabled = ref(true);

const client = useClient();
const { data, isFetching } = client.reactiveToInput.useQuery(counter, {
  enabled,
});
</script>

<template>
  <h1>Demonstrates the reactivity of the options parameter</h1>
  <p>Query Enabled: {{ enabled }}</p>
  <p v-if="isFetching">Loading...</p>
  <p v-if="data">{{ data }}</p>
  <button @click="() => counter++">Change</button>
  <p>Reactive Query Key: {{ client.reactiveToInput.queryKey(counter) }}</p>
  <button @click="() => (enabled = !enabled)">Toggle Query Enabled</button>
</template>

<script setup lang="ts">
import { skipToken } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { useClient } from "./composables/useClient";

const client = useClient();

const counter = ref<number>();

// Uncomment to see typescript error because `counter.value` is possibly undefined
// client.reactiveToInput.useQuery(counter);

// SkipToken saves the day
const input = computed(() =>
  counter.value !== undefined ? counter.value : skipToken,
);

const { data, isFetching, status } = client.reactiveToInput.useQuery(input);
</script>

<template>
  <h1>Demonstrates the use of SkipToken</h1>
  <p>Counter: {{ counter ?? "undefined" }}</p>
  <p>Query Status: {{ status }}</p>
  <p v-if="isFetching">Loading...</p>
  <p v-if="data">{{ data }}</p>
  <button @click="() => (counter = (counter ?? 0) + 1)">Change</button>
</template>

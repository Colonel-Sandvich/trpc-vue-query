<script setup lang="ts">
import { useClient } from "./composables/useClient";

const client = useClient();

const deeperAll = client.deep.deeper.all.useQuery();

const deeperById = client.deep.deeper.byId.useQuery({ id: 1 });

const deepAll = client.deep.all.useQuery();
</script>

<template>
  <h1>Demonstrates router level invalidation of queries</h1>
  <h3>All procedures are deliberately delayed by 1 second</h3>
  <p v-if="deeperAll.isFetching.value">Loading deep.deeper.all...</p>
  <p v-else>{{ deeperAll.data }}</p>
  <p v-if="deeperById.isFetching.value">Loading deep.deeper.byId...</p>
  <p v-else>{{ deeperById.data }}</p>
  <p v-if="deepAll.isFetching.value">Loading deep.all...</p>
  <p v-else>{{ deepAll.data }}</p>
  <button @click="() => client.deep.deeper.byId.invalidate({ id: 1 })">
    Invalidate deep.deeper.byId only
  </button>
  <button @click="() => client.deep.deeper.invalidate()">
    Invalidate deep.deeper router
  </button>
  <button @click="() => client.deep.invalidate()">
    Invalidate deep router
  </button>
</template>

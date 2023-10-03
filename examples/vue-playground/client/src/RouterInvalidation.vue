<script setup lang="ts">
import { useTrpc } from "./trpc";

const trpc = useTrpc();

const deeperAll = trpc.deep.deeper.all.useQuery();

const deeperById = trpc.deep.deeper.byId.useQuery({ id: 1 });

const deepAll = trpc.deep.all.useQuery();
</script>

<template>
  <h1>Demonstrates router level invalidation of queries</h1>
  <p v-if="deeperAll.isFetching.value">Loading deep.deeper.all...</p>
  <p v-else>{{ deeperAll.data }}</p>
  <p v-if="deeperById.isFetching.value">Loading deep.deeper.byId...</p>
  <p v-else>{{ deeperById.data }}</p>
  <p v-if="deepAll.isFetching.value">Loading deep.all...</p>
  <p v-else>{{ deepAll.data }}</p>
  <button @click="() => trpc.deep.deeper.byId.invalidate({ id: 1 })">
    Invalidate deep.deeper.byId only
  </button>
  <button @click="() => trpc.deep.deeper.invalidate()">
    Invalidate deep.deeper router
  </button>
  <button @click="() => trpc.deep.invalidate()">Invalidate deep router</button>
</template>

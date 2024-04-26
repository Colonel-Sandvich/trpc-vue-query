<script setup lang="ts">
import { useClient } from "./composables/useClient";

const client = useClient();

const deeperAll = client.deep.deeper.all.useQuery();

const deeperById1 = client.deep.deeper.byId.useQuery({ id: 1 });
const deeperById2 = client.deep.deeper.byId.useQuery({ id: 2 });

const deepAll = client.deep.all.useQuery();

const other = client.other.useQuery();

const queries = [deeperById1, deeperById2, deeperAll, deepAll, other];
</script>

<template>
  <h1>Demonstrates router level invalidation of queries</h1>
  <div v-for="query in queries">
    <p v-if="query.isFetching.value">Loading...</p>
    <p v-else>{{ query.data }}</p>
  </div>
  <div class="box">
    <button @click="() => client.deep.deeper.byId.invalidate({ id: 1 })">
      Invalidate deep.deeper.byId(1) only
    </button>
    <button @click="() => client.deep.deeper.byId.invalidate({ id: 3 })">
      Invalidate deep.deeper.byId(3) only (Does nothing because this matches no
      queries)
    </button>
    <button @click="() => client.deep.deeper.byId.invalidate()">
      Invalidate deep.deeper.byId
    </button>
    <button @click="() => client.deep.deeper.invalidate()">
      Invalidate deep.deeper router
    </button>
    <button @click="() => client.deep.invalidate()">
      Invalidate deep router
    </button>
    <button @click="() => client.invalidate()">Invalidate all</button>
  </div>
</template>

<style scoped>
.box {
  display: flex;
  flex-direction: column;
  width: fit-content;
}
</style>

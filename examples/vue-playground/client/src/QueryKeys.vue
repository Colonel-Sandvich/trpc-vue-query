<script setup lang="ts">
import { useInfiniteQuery, useQueryClient } from "@tanstack/vue-query";
import { useClient } from "./composables/useClient";

const client = useClient();

const infQuery = useInfiniteQuery({
  queryKey: client.deep.deeper.byId.queryKey({ id: 5 }, "infinite"),
  queryFn: () => client.$client.deep.deeper.byId.query({ id: 5 }),
  getNextPageParam: () => 1,
  initialPageParam: undefined,
});

// TODO add inf query support
// client.deep.deeper.byId.useInfiniteQuery({ id: 5}, { pageStuff })

const normalKey = client.deep.deeper.byId.queryKey({ id: 5 });
const infiniteKey = client.deep.deeper.byId.queryKey({ id: 5 }, "infinite");
</script>

<template>
  <h1>Infinite queries (still WIP)</h1>
  <p>Normal key: {{ normalKey }}</p>
  <p>
    Data for normal key:
    {{ useQueryClient().getQueryData(normalKey) ?? "undefined" }}
  </p>
  <p>Infinite key: {{ infiniteKey }}</p>
  <p>
    Data for infinite key:
    {{ useQueryClient().getQueryData(infiniteKey) ?? "undefined" }}
  </p>
  <!-- TODO Fix getQueryData type for inf query key -->
</template>

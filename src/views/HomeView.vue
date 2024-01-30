<template>
  <main>
    ayo
     </main>
</template>

<script setup lang="ts">
import Table from "@/components/Table.vue" 

const columns = ref([
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "status", label: "Status" },
  { key: "image", label: "Image" },
  { key: "ports", label: "Ports" },
  { key: "created_at", label: "Created At" },
]);
const data = [
  {
    id: 123,
    name: "alo",
    status: "eae",
    image: "koe",
    ports: "321",
    created_at: "2024-01-15",
  },
]
const total = data.length;
</script>

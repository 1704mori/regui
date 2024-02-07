<script setup lang="ts">
import { defineComponent, h, ref, watch, watchEffect, type VNode } from "vue";
import { useQuery } from "@tanstack/vue-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  // @ts-ignore
} from "@/components/Tooltip";

import Table from "@/components/Table.vue";
import { Container, Tag, Trash } from "lucide-vue-next";

type Repositories = {
  repositories: string[];
};

type Tags = {
  name: string;
  tags: string[]
}

const PAGE_SIZE = 15;
const repositoriesData = ref<null | { name: string | VNode; tags: string | VNode, actions?: any }[]>(null); // Initialize as null

const repositoriesFetcher = async (
  page: number,
): Promise<Repositories> =>
  await fetch(
    `/v2/_catalog?n=${PAGE_SIZE}&last=${page * PAGE_SIZE}`,
    {
      credentials: "include",
      headers: new Headers({
        'Authorization': 'Basic ' + btoa(`hs:1231aba1`),
        'Content-Type': 'application/json', // Adjust the content type as needed
      }),
    }
  ).then((response) => response.json());

const tagsFetcher = async (repository: string): Promise<Tags> =>
  await fetch(`/v2/${repository}/tags/list`, {
    credentials: "include",
    headers: new Headers({
      Authorization: "Basic " + btoa(`hs:1231aba1`),
      "Content-Type": "application/json",
    }),
  }).then((response) => response.json());


const currentPage = ref(0);

const { isLoading, isError, isFetching, data, error, refetch, suspense } =
  useQuery({
    queryKey: ["repositories", currentPage.value],
    queryFn: (key) => repositoriesFetcher(currentPage.value),
    select: async (data) => {
      const repositories: { name: string; tags: string }[] = [];
      for (const name of data.repositories) {
        const tags = await tagsFetcher(name);
        repositories.push({ name, tags: String(tags.tags.length) });
      }
      repositoriesData.value = repositories;
      return repositories;
    },
  });

const handlePageClick = (page: number) => {
  currentPage.value = page;
  refetch();
};

const handleRowClick = (row: any) => {
  console.log(row);
};

suspense();

const columns = ref([{ key: "name", label: "Name" }, { key: "tags", label: "Tags" }]);

watchEffect(() => {
  if (!repositoriesData.value) {
    return;
  }

  repositoriesData.value = repositoriesData.value.map((repository) => {
    return {
      ...repository,
      name: h("div", { class: "flex items-center gap-2" }, [
        h(Container, { size: 20 }),
        h("p", { 'data-valuehere': repository.name }, repository.name),
      ]),
      tags: h("div", { class: "flex items-center gap-1 justify-end" }, [
        h("p", { class: "font-medium", 'data-valuehere': repository.tags }, repository.tags),
        h(Tag, { size: 16 })
      ]),
      // actions: () => {
      //   return h("div", { class: "flex justify-center items-center gap-2 " }, [
      //     h(TooltipProvider, [
      //       h(Tooltip, [
      //         h(TooltipTrigger, { asChild: true }, [
      //           h(
      //             "button",
      //             {
      //               onClick: () => console.log(repository.name),
      //             },
      //             [h(Trash, { size: 20 })]
      //           ),
      //         ]),
      //         h(TooltipContent, ["Restart"]),
      //       ]),
      //     ]),
      //   ]);
      // },
    };
  });
});
</script>

<template>
  <h2>Repositories list</h2>
  <!-- <div v-if="isError">An error has occurred: {{ error }}</div>
  <div v-else-if="data">
    <Table :columns="columns" :data="data" :rows-per-page="PAGE_SIZE" :total="data.length"
      @page-click="handlePageClick" />
  </div>
  <div v-else>Nothing to see here...</div> -->
  <Suspense>
    <template #default>
      <div v-if="isError">An error has occurred: {{ error }}</div>
      <div v-else-if="repositoriesData">
        <Table :columns="columns" :data="repositoriesData" :rows-per-page="PAGE_SIZE" :total="repositoriesData.length"
          :page-click="handlePageClick" :row-click="handleRowClick" />
      </div>
      <div v-else>Nothing to see here...</div>
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { defineComponent, h, ref, watch, watchEffect, type VNode, inject } from "vue";
import { useQuery } from "@tanstack/vue-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  // @ts-ignore
} from "@/components/Tooltip";

import Table from "@/components/Table.vue";
import ViewImageTag from "@/components/Modals/ViewImageTag.vue";
import { ArrowUpRightFromSquare, Container, Eye, Tag, Trash } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { tagsFetcher } from "@/lib/api";
import { useEventBus } from "@vueuse/core";

type Repositories = {
  repositories: string[];
};

const router = useRouter();
const clickedRow = ref<{ name: string; tags: string[] }>({} as any);

const PAGE_SIZE = 15;
const repositoriesData = ref<
  null | { name: string | VNode; tags: string[] | VNode; actions?: any }[]
>(null); // Initialize as null

const repositoriesFetcher = async (page: number): Promise<Repositories> =>
  await fetch(`/v2/_catalog?n=${PAGE_SIZE}&last=${page * PAGE_SIZE}`, {
    credentials: "include",
    headers: new Headers({
      Authorization: "Basic " + btoa(`overlord:itadakimasu`),
      "Content-Type": "application/json", // Adjust the content type as needed
    }),
  }).then((response) => response.json());

const currentPage = ref(0);

const { isLoading, isError, isFetching, data, error, refetch, suspense } =
  useQuery({
    queryKey: ["repositories", currentPage.value],
    queryFn: (key) => repositoriesFetcher(currentPage.value),
    select: async (data) => {
      const repositories: { name: string; tags: string[] }[] = [];
      for (const name of data.repositories) {
        const tags = await tagsFetcher(name);
        repositories.push({ name, tags: tags.tags });
      }
      repositoriesData.value = repositories;
      return repositories;
    },
  });

const handlePageClick = (page: number) => {
  currentPage.value = page;
  refetch();
};

const event = useEventBus("modal");

const handleRowClick = (row: any) => {
  if (row.tags.length <= 1) {
    clickedRow.value = row;
    event.emit({
      type: "openModal",
      payload: row,
    });
    return
  }

  router.push({ path: encodeURIComponent(`/${row.name}`) });
};

suspense();

const columns = ref([
  { key: "name", label: "Name" },
  { key: "tags", label: "Tags" },
]);

watchEffect(() => {
  if (!repositoriesData.value) {
    return;
  }

  repositoriesData.value = repositoriesData.value.map((repository) => {
    return {
      ...repository,
      name: h("div", { class: "flex items-center gap-2" }, [
        h(Container, { size: 20 }),
        h("p", { "data-valuehere": repository.name }, repository.name),
        h((repository.tags as string[]).length > 1 ? ArrowUpRightFromSquare : Eye, { size: 20 }),
      ]),
      tags: h("div", { class: "flex items-center gap-1 justify-end" }, [
        h(
          "p",
          {
            class: "font-medium",
            "data-valuehere": [...(repository.tags as string[])],
          },
          String((repository.tags as string[]).length),
        ),
        h(Tag, { size: 16 }),
      ]),
    };
  });
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-lg font-medium">
      Images list
    </h2>
    <ViewImageTag />
    <Suspense>
      <template #default>
        <div v-if="isError">An error has occurred: {{ error }}</div>
        <div v-else-if="repositoriesData">
          <Table
            :columns="columns"
            :data="repositoriesData"
            :rows-per-page="PAGE_SIZE"
            :total="repositoriesData.length"
            :page-click="handlePageClick"
            :row-click="handleRowClick"
          />
        </div>
        <div v-else>Nothing to see here...</div>
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </div>
</template>

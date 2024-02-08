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
import Dialog from "@/components/Dialog.vue";
import { ArrowUpRightFromSquare, Container, Eye, Tag, Trash } from "lucide-vue-next";
import { useRouter } from "vue-router";

type Repositories = {
  repositories: string[];
};

type Tags = {
  name: string;
  tags: string[];
};

const router = useRouter();

const modal = ref<InstanceType<typeof Dialog>>();
const showModal = () => modal.value?.show();
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

const tagsFetcher = async (repository: string): Promise<Tags> =>
  await fetch(`/v2/${repository}/tags/list`, {
    credentials: "include",
    headers: new Headers({
      Authorization: "Basic " + btoa(`overlord:itadakimasu`),
      "Content-Type": "application/json",
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

const handleRowClick = (row: any) => {
  if (row.tags.length <= 1) {
    clickedRow.value = row;
    showModal();
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
  <Dialog
    classes="w-[36rem]"
    ref="modal"
    hide-confirm
    show-cancel
    :onConfirm="console.log"
  >
    <template #default>
      <div class="flex flex-col gap-4">
        <h2 class="font-bold text-xl">Details for {{ clickedRow.name }}</h2>
        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium text uppercase">Tag</span>
            <span class="g-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-md p-1 text-center w-full">
              alo
            </span>
          </div>
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium text uppercase">Digest</span>
            <span class="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-md p-1 text-center w-full">
              as18249wyeu98fsdndf12894usrejkghsdfk1
            </span>
          </div>
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium text uppercase">Size</span>
            <span class="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-md p-1 text-center w-full">
              alo
            </span>
          </div>
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium text uppercase"
              >Pushed At</span
            >
            <span class="bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-md p-1 text-center w-full">
              dslfkj12
            </span>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
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

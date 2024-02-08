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
import { ArrowUpRightFromSquare, Calendar, Computer, Container, Eye, Key, Tag, Trash, Weight } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";
import { convertBytes } from "@/lib/utils";

type ImageTag = {
  digest: string;
  schemaVersion: number
  name: string
  tag: string
  architecture: string
  fsLayers: Array<{
    blobSum: string
  }>
  history: Array<{
    v1Compatibility: string
  }>
  signatures: Array<{
    header: {
      jwk: {
        crv: string
        kid: string
        kty: string
        x: string
        y: string
      }
      alg: string
    }
    signature: string
    protected: string
  }>
}


type Tags = {
  name: string;
  tags: string[];
};

const router = useRouter();
const route = useRoute()

const images = ref<{
  size: string | VNode;
  digest: string | VNode;
  tag: string | VNode;
  arch: string | VNode;
  pushed_at: string | VNode
}[]>([])

const modal = ref<InstanceType<typeof Dialog>>();
const showModal = () => modal.value?.show();
const clickedRow = ref<{ name: string; tags: string[] }>({} as any);

const tagsFetcher = async (repository: string): Promise<Tags> =>
  await fetch(`/v2/${encodeURIComponent(repository)}/tags/list`, {
    credentials: "include",
    headers: new Headers({
      Authorization: "Basic " + btoa(`overlord:itadakimasu`),
      "Content-Type": "application/json",
    }),
  }).then((response) => response.json());

const fetchTagSize = async(digest: string): Promise<number> =>
  await fetch(`/v2/${encodeURIComponent(route.params.image as string)}/blobs/${digest}`, {
    credentials: "include",
    headers: new Headers({
      Authorization: "Basic " + btoa(`overlord:itadakimasu`),
      "Content-Type": "application/json",
    }),
  }).then((response) => parseInt(response.headers.get("Content-Length") as string));

const fetchImage = async (repository: string, tag: string): Promise<ImageTag> =>
  await fetch(`/v2/${encodeURIComponent(repository)}/manifests/${encodeURIComponent(tag)}`, {
    credentials: "include",
    headers: new Headers({
      Authorization: "Basic " + btoa(`overlord:itadakimasu`),
      "Content-Type": "application/json",
    }),
  }).then(async (response) => ({
    ...await response.json(),
    digest: response.headers.get("Docker-Content-Digest")
  }));

const { isLoading, isError, isFetching, error, data, refetch, suspense } =
  useQuery({
    queryKey: ["repositories", route.params.image as string],
    queryFn: (key) => tagsFetcher(route.params.image as string),
    select: async (data) => {
      console.log(route.params)
      for (const tag of data.tags) {
        const image = await fetchImage(route.params.image as string, tag)
        let sumSize = 0

        for (const {blobSum} of image.fsLayers) {
          sumSize += await fetchTagSize(blobSum);
        }

        images.value.push({
          size: convertBytes(sumSize),
          digest: image.digest,
          tag,
          arch: image.architecture,
          pushed_at: JSON.parse(image.history[0].v1Compatibility).created,
        })
      }
    }
  });

const handleRowClick = (row: any) => {
  console.log(row)
};

suspense();

const columns = ref([
  { key: "size", label: "Comp. Size" },
  { key: "digest", label: "Digest" },
  { key: "tag", label: "Tag" },
  { key: "arch", label: "Arch" },
  { key: "pushed_at", label: "Pushed At" },
]);

watchEffect(() => {
  if (!images.value) {
    return;
  }

  images.value = images.value.map((image) => {
    return {
      size: h("p", { "data-valuehere": image.size }, image.size),
      digest: h("p", { "data-valuehere": image.digest }, image.digest),
      tag: h("p", { "data-valuehere": image.tag }, image.tag),
      arch: h("p", { "data-valuehere": image.arch }, image.arch),
      pushed_at: h("p", { "data-valuehere": image.pushed_at }, image.pushed_at),
    };
  });
});
</script>

<template>
  <div class="flex flex-col gap-2">
    <h2 class="text-lg font-medium">
      List of tags for <i>{{ route.params.image }}</i>
    </h2>
    <Suspense>
      <template #default>
        <div v-if="isError">An error has occurred: {{ error }}</div>
        <div v-else-if="images">
          <Table :columns="columns" :data="images" :rows-per-page="999" :total="images.length"
            :row-click="handleRowClick" />
        </div>
        <div v-else>Nothing to see here...</div>
      </template>
      <template #fallback>
        <div>Loading...</div>
      </template>
    </Suspense>
  </div>
</template>

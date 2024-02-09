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
import ViewImageTag from "@/components/Modals/ViewImageTag.vue";
import { Loader2 } from "lucide-vue-next";
import { useRoute, useRouter } from "vue-router";
import { convertBytes } from "@/lib/utils";
import { fetchImage, fetchTagSize, tagsFetcher } from "@/lib/api";
import { useEventBus } from "@vueuse/core";

const router = useRouter();
const route = useRoute()

const images = ref<{
  size: string | VNode;
  digest: string | VNode;
  tag: string | VNode;
  arch: string | VNode;
  pushed_at: string | VNode
}[]>([])

const event = useEventBus("modal");

const clickedRow = ref<{
  size: string | VNode;
  digest: string | VNode;
  tag: string | VNode;
  arch: string | VNode;
  pushed_at: string | VNode
}>();

const loading = ref(true);

const { isLoading, isError, isFetching, error, data, refetch, suspense } =
  useQuery({
    queryKey: ["image", route.params.image as string],
    queryFn: (key) => tagsFetcher(route.params.image as string),
    select: async (data) => {
      for (const tag of data.tags) {
        const image = await fetchImage(route.params.image as string, tag)
        let sumSize = 0

        for (const { blobSum } of image.fsLayers) {
          sumSize += await fetchTagSize(route.params.image as string, blobSum);
        }

        images.value.push({
          size: convertBytes(sumSize),
          digest: image.digest,
          tag,
          arch: image.architecture,
          pushed_at: JSON.parse(image.history[0].v1Compatibility).created,
        })
      }
      loading.value = false
    },
  });

const handleRowClick = (row: any) => {
  clickedRow.value = row;
  event.emit('openModal');
};

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
  <ViewImageTag v-if="clickedRow" :tag="clickedRow" />
  <div class="flex flex-col gap-2">
    <h2 class="text-lg font-medium">
      List of tags for <i>{{ route.params.image }}</i>
    </h2>
    <div
      class="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-900 p-1 rounded-md"
      v-if="loading">
      <Loader2 class="animate-spin" />
      <span class="font-medim text-xs">
        Fetching images
      </span>
    </div>
    <div v-else-if="images && !loading && !isError">
      <Table :columns="columns" :data="images" :rows-per-page="999" :total="images.length" :row-click="handleRowClick" />
    </div>
    <div v-else>An error has occurred: {{ error }}</div>
  </div>
</template>

<template>
  <Dialog classes="w-[36rem]" ref="modal" hide-confirm show-cancel cancel-text="Close">
    <!-- Loading Indicator -->
    <template v-if="loading">
      <div class="flex justify-center items-center">
        <Loader2 class="animate-spin" />
      </div>
    </template>
    
    <!-- Content -->
    <template v-else>
      <div class="flex flex-col gap-4">
        <h2 class="font-bold text-xl">Details for {{ tag?.name }}</h2>
        <div class="flex flex-col gap-2">
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium uppercase">Tag</span>
            <span
              class="bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md p-1 text-center w-full">
              {{ tag?.tag }}
            </span>
          </div>
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium uppercase">Digest</span>
            <span
              class="bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md p-1 text-center w-full truncate">
              {{ tag?.digest }}
            </span>
          </div>
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium uppercase">Size</span>
            <span
              class="bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md p-1 text-center w-full">
              {{ tag?.size }}
            </span>
          </div>
          <div class="grid grid-cols-[12rem_1fr] gap-2">
            <span class="font-medium uppercase">Pushed At</span>
            <span
              class="bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md p-1 text-center w-full">
              {{ tag?.pushed_at }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { defineProps, provide, ref, type VNode } from "vue";
import Dialog from "../Dialog.vue";
import { useQuery } from "@tanstack/vue-query";
import { tagsFetcher, fetchImage, fetchTagSize } from "@/lib/api";
import { convertBytes } from "@/lib/utils";
import { useEventBus } from "@vueuse/core";
import { Loader2 } from "lucide-vue-next";

const event = useEventBus("modal");
const modal = ref<InstanceType<typeof Dialog>>();

const tag = ref<{
  name?: string;
  tags?: string[];
  size: string | VNode;
  digest: string | VNode;
  tag: string | VNode;
  arch: string | VNode;
  pushed_at: string | VNode
}>({} as any);
const loading = ref(false);

event.on((event: any) => {
  console.log(event)
  if (event.type == "openModal") {
    modal.value?.show();
    
    if (event.payload.tags) {
      loading.value = !!event.payload.name;
      tag.value.name = event.payload.name;
      tag.value.tags = event.payload.tags;
      refetch();
      return
    }

    tag.value = event.payload;
  }
});

const { isLoading, isError, isFetching, error, data, refetch, suspense } =
  useQuery({
    enabled: false,
    queryKey: ["image", tag.value?.name],
    queryFn: (key) => fetchImage(tag.value?.name as string, tag.value?.tags![0] as string),
    select: async (data) => {
      loading.value = true
      let sumSize = 0

      for (const { blobSum } of data.fsLayers) {
        sumSize += await fetchTagSize(tag.value?.name as string, blobSum);
      }

      tag.value = {
        name: tag.value.name,
        size: convertBytes(sumSize),
        digest: data.digest,
        tag: data.tag,
        arch: data.architecture,
        pushed_at: JSON.parse(data.history[0].v1Compatibility).created,
      }
      loading.value = false
    },
  });
</script>
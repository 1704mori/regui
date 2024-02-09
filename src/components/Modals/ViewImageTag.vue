<template>
  <Dialog classes="w-[36rem]" ref="modal" hide-confirm show-cancel>
    <template #default>
      <div class="flex flex-col gap-4">
        <h2 class="font-bold text-xl">Details for {{ props.tag?.name }}</h2>
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

const props = defineProps({
  tag: Object,
});

const event = useEventBus("modal");
const modal = ref<InstanceType<typeof Dialog>>();

event.on((data: any) => {
  if (data == "openModal") {
    console.log(modal)
    modal.value?.show();
  }
});

const tag = ref<{
  size: string | VNode;
  digest: string | VNode;
  tag: string | VNode;
  arch: string | VNode;
  pushed_at: string | VNode
}>()
const loading = ref(true);

const { isLoading, isError, isFetching, error, data, refetch, suspense } =
  useQuery({
    enabled: !props.tag?.tag,
    queryKey: ["image", props.tag?.name],
    queryFn: (key) => fetchImage(props.tag?.name as string, props.tag?.tags[0]),
    select: async (data) => {
      let sumSize = 0

      for (const { blobSum } of data.fsLayers) {
        sumSize += await fetchTagSize(props.tag?.name as string, blobSum);
      }

      tag.value = {
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
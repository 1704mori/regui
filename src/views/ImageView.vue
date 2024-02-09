<script setup lang="ts">
import { defineComponent, h, ref, watchEffect, onMounted, reactive, type VNode } from "vue";
import { useQuery } from "@tanstack/vue-query";
import Table from "@/components/Table.vue";
import ViewImageTag from "@/components/Modals/ViewImageTag.vue";
import { Loader2, Trash } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { convertBytes } from "@/lib/utils";
import { deleteImageTag, fetchImage, fetchTagSize, tagsFetcher } from "@/lib/api";
import { useEventBus } from "@vueuse/core";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  // @ts-ignore
} from "@/components/Tooltip";
import { toast } from "vue-sonner";


const route = useRoute();
const event = useEventBus("modal");

type Image = {
  size: string | VNode;
  digest: string | VNode;
  tag: string | VNode;
  arch: string | VNode;
  pushed_at: string | VNode;
};

const state = reactive<
  {
    images: Image[];
    clickedRow: Image | null;
    loading: boolean;
    error: any;
  }
>({
  images: [],
  clickedRow: null,
  loading: true,
  error: null,
});

const { isLoading, isError, error, data, refetch } = useQuery({
  queryKey: ["image", route.params.image],
  queryFn: () => tagsFetcher(route.params.image as string),
  select: async (data) => {
    const imagePromises = data.tags.map(async (tag) => {
      const image = await fetchImage(route.params.image as string, tag);
      const sumSize = await Promise.all(image.fsLayers.map(layer => fetchTagSize(route.params.image as string, layer.blobSum)))
        .then(sizes => sizes.reduce((acc, size) => acc + size, 0));

      return {
        size: convertBytes(sumSize),
        digest: image.digest,
        tag,
        arch: image.architecture,
        pushed_at: JSON.parse(image.history[0].v1Compatibility).created,
      };
    });
    state.images = await Promise.all(imagePromises);
    state.loading = false;
  },
});

if (isError) {
  state.error = error;
}

const handleRowClick = (row: Image) => {
  state.clickedRow = row;
  event.emit({
    type: "openModal",
    payload: {
      name: route.params.image,
      ...row,
    }
  });
};

const columns = [
  { key: "size", label: "Comp. Size" },
  { key: "digest", label: "Digest" },
  { key: "tag", label: "Tag" },
  { key: "arch", label: "Arch" },
  { key: "pushed_at", label: "Pushed At" },
  { key: "actions", label: "Actions" },
];

watchEffect(() => {
  state.images = state.images.map(image => ({
    ...image,
    size: image.size,
    digest: image.digest,
    tag: image.tag,
    arch: image.arch,
    pushed_at: new Date(image.pushed_at as string)
      .toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
    // actions: () => {
    //   return h("div", { class: "flex justify-center items-center gap-2 " }, [
    //     h(TooltipProvider, [
    //       h(Tooltip, [
    //         h(TooltipTrigger, { asChild: true }, [
    //           h(
    //             "button",
    //             {
    //               onClick: async () => {
    //                 try {
    //                   await deleteImageTag(route.params.image as string, image.tag as string);
    //                   await refetch();
    //                   toast.success(`Tag ${image.tag} for image ${route.params.image} has been deleted`);
    //                 } catch (error: any) {
    //                   console.error(error);
    //                   toast.error(error?.response?.data?.errors?.[0].message ?? "An error occurred while deleting the tag");
    //                 }
    //               },
    //             },
    //             [h(Trash, { size: 20 })]
    //           ),
    //         ]),
    //         h(TooltipContent, ["Delete"]),
    //       ]),
    //     ])
    //   ]);
    // },
  }));
});
</script>

<template>
  <ViewImageTag />
  <div class="flex flex-col gap-2">
    <h2 class="text-lg font-medium">
      List of tags for <i>{{ route.params.image }}</i>
    </h2>
    <div v-if="state.loading"
      class="flex items-center gap-2 bg-neutral-200 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-900 p-1 rounded-md">
      <Loader2 class="animate-spin" />
      <span>Fetching images</span>
    </div>
    <Table v-else-if="state.images.length && !state.loading" :columns="columns" :data="state.images"
      :row-click="handleRowClick" show-column-name />
    <div v-else>An error has occurred: {{ state.error }}</div>
  </div>
</template>

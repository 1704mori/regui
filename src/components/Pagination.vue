<template>
  <div class="flex items-center flex-wrap justify-center m-auto py-1">
    <button
      class="flex items-center px-2 m-1 h-8 rounded-lg transition-colors bg-accent hover:bg-accent2 disabled:cursor-not-allowed disabled:bg-accent/30 disabled:dark:bg-accent2"
      @click="handlePageChange(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      <ArrowLeft />
      <span class="text-sm font-medium">Back</span>
    </button>
    <template v-for="i in renderPageButtons" :key="i">
      <button
        class="flex items-center justify-center w-min min-w-[2rem] h-8 p-2 m-1 font-medium cursor-pointer rounded-full transition-colors"
        :class="{ 'bg-primary text-white': i === currentPage }"
        :disabled="currentPage === i"
        @click="handlePageChange(i)"
      >
        {{ i }}
      </button>
    </template>
    <button
      class="flex items-center px-2 m-1 h-8 rounded-lg transition-colors bg-accent hover:bg-accent2 disabled:cursor-not-allowed disabled:bg-accent/30 disabled:dark:bg-accent2"
      @click="handlePageChange(currentPage + 1)"
      :disabled="currentPage === numPages"
    >
      <span class="text-sm font-medium">Next</span>
      <ArrowRight />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps } from 'vue';
import { ArrowLeft, ArrowRight } from "lucide-vue-next";

const props = defineProps<{
  total: number;
  perPage: number;
  onPageClick: (page: number) => void;
  maxButtons: number;
}>();

const numPages = ref(Math.ceil(props.total / props.perPage));
const currentPage = ref(1);

const handleClick = (page: number) => {
  currentPage.value = page;
  props.onPageClick(page);
};

const renderPageButtons = () => {
  const buttons: number[] = [];
  const maxPagesToShow = Math.min(props.maxButtons, numPages.value);
  const halfWay = Math.ceil(maxPagesToShow / 2);
  let startPage = Math.max(1, currentPage.value - halfWay);
  let endPage = startPage + maxPagesToShow - 1;

  if (endPage > numPages.value) {
    endPage = numPages.value;
    startPage = Math.max(1, numPages.value - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    buttons.push(i);
  }
  return buttons;
};

const handlePageChange = (page: number) => {
  if (page >= 1 && page <= numPages.value) {
    handleClick(page);
  }
};
</script>
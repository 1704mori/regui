<template>
  <div class="flex items-center flex-wrap justify-center m-auto py-1">
    <button
      class="flex items-center px-2 m-1 h-8 rounded-lg transition-colors bg-accent hover:bg-accent2 disabled:cursor-not-allowed disabled:bg-accent/30 disabled:dark:bg-accent2"
      @click="currentPage > 1 && handleClick(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      <ArrowLeft />
      <span class="text-sm font-medium">Back</span>
    </button>
    <template v-for="i in renderPageButtons()" :key="i">
      <button
        class="flex items-center justify-center w-min min-w-[2rem] h-8 p-2 m-1 font-medium cursor-pointer rounded-full transition-colors"
        :class="{ 'bg-primary text-white': i === currentPage }"
        :disabled="currentPage === i"
        @click="handleClick(i)"
      >
        {{ i }}
      </button>
    </template>
    <button
      class="flex items-center px-2 m-1 h-8 rounded-lg transition-colors bg-accent hover:bg-accent2 disabled:cursor-not-allowed disabled:bg-accent/30 disabled:dark:bg-accent2"
      @click="currentPage < numPages && handleClick(currentPage + 1)"
      :disabled="currentPage === numPages"
    >
      <span class="text-sm font-medium">Next</span>
      <ArrowRight />
    </button>
  </div>
</template>

<script>
import { ref } from 'vue';
import { ArrowLeft, ArrowRight } from "lucide-vue-next";

export default {
  props: {
    total: Number,
    perPage: {
      type: Number,
      default: 10,
    },
    onPageClick: Function,
    maxButtons: {
      type: Number,
      default: 5,
    },
  },
  setup(props) {
    const numPages = Math.ceil(props.total / props.perPage);
    const currentPage = ref(1);

    const handleClick = (page) => {
      currentPage.value = page;
      props.onPageClick(page);
    };

    const renderPageButtons = () => {
      const buttons = [];
      const maxPagesToShow = Math.min(props.maxButtons, numPages);
      const halfWay = Math.ceil(maxPagesToShow / 2);
      let startPage = Math.max(1, currentPage.value - halfWay);
      let endPage = startPage + maxPagesToShow - 1;

      if (endPage > numPages) {
        endPage = numPages;
        startPage = Math.max(1, numPages - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }
      return buttons;
    };

    return {
      currentPage,
      handleClick,
      renderPageButtons,
      numPages,
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>


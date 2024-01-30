<script setup lang="ts">
import { Toaster } from "vue-sonner";
import { Droplet } from "lucide-vue-next";
import Home from "./views/HomeView.vue";
import { useDark, useToggle } from "@vueuse/core";

const isDark = useDark({
  selector: "html",
});
const toggleDark = useToggle(isDark);
</script>

<template>
  <Toaster position="bottom-left" theme="dark" />
  <div class="fixed bottom-8 left-8">
    <button
      class="bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-900 p-2 rounded-full transition-all active:scale-95"
      @click="toggleDark()"
    >
      <Droplet />
    </button>
  </div>
  <Home />
</template>

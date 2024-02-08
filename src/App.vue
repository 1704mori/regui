<script setup lang="ts">
import { Toaster } from "vue-sonner";
import { Droplet } from "lucide-vue-next";
import { useDark, useToggle } from "@vueuse/core";
import { RouterView } from "vue-router";

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
      <Droplet class="text-black dark:text-white" />
    </button>
  </div>

  <main class="w-full text-neutral-900 dark:text-neutral-100">
    <RouterView />
  </main>
</template>

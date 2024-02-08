<script setup lang="ts">
import { ref } from "vue";
import { Loader2 } from "lucide-vue-next";

const dialog = ref<HTMLDialogElement>();

const props = defineProps({
  confirmText: {
    type: String,
    default: "Confirm",
  },
  cancelText: {
    type: String,
    default: "Cancel",
  },
  hideConfirm: {
    type: Boolean,
    default: false,
  },
  showCancel: {
    type: Boolean,
    default: false,
  },
  classes: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["confirm", "cancel", "open"]);

const cancel = () => {
  dialog.value?.close();
  emit("cancel");
};

const confirm = () => {
  // dialog.value?.close();
  emit("confirm");
};

const visible = ref(false);

const showModal = () => {
  dialog.value?.showModal();
  visible.value = true;
  emit("open");
};

defineExpose({
  show: showModal,
  close: (returnVal?: string): void => dialog.value?.close(returnVal),
  visible,
});
</script>

<template>
  <dialog
    ref="dialog"
    :class="{
      'w-96 bg-transparent [&[open]::backdrop]:bg-black/50 [&[open]::backdrop]:backdrop-blur-sm': true,
      [props.classes]: props.classes,
    }"
    @close="visible = false"
  >
    <form
      v-if="visible"
      method="dialog"
      :class="{
        'modal-box rounded-xl border-2 border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900 text-white': true,
      }"
    >
      <slot />

      <div class="modal-action" v-if="!props.hideConfirm || props.showCancel">
        <slot name="footer" />
        <slot name="actionButtons">
          <div
          :class="{
              'grid grid-cols-2 gap-2': true,
            }"
          >
            <button
              v-if="props.showCancel"
              value="false"
              class="mt-4 bg-red-400/10 hover:bg-red-400/20 text-white font-bold py-2 px-4 rounded"
              :class="{
                'mt-4 bg-red-400/10 hover:bg-red-400/20 text-white font-bold py-2 px-4 rounded': true,
                '[grid-column:2]': props.hideConfirm || !props.showCancel,
              }"
              @click.prevent="cancel"
            >
              {{ props.cancelText }}
            </button>
            <button
              v-if="!props.hideConfirm"
              :disabled="props.loading"
              value="true"
              class="mt-4 bg-green-400/10 hover:bg-green-400/20 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:opacity-50 inline-flex justify-center items-center gap-1"
              @click.prevent="confirm"
            >
              <Loader2 v-if="props.loading" class="animate-spin" :size="16" />
              {{ props.confirmText }}
            </button>
          </div>
        </slot>
      </div>
    </form>
    <!-- <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form> -->
  </dialog>
</template>

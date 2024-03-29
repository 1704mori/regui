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
  dialog.value?.show();
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
  <!-- blurred background -->
  <div class="flex absolute inset-0 bg-black bg-opacity-50 z-50" v-show="visible">
    <dialog ref="dialog" :class="{
      'self-center w-96 bg-transparent [&[open]::backdrop]:bg-black/50 [&[open]::backdrop]:backdrop-blur-sm outline-none text-neutral-900 dark:text-neutral-100': true,
      [props.classes]: props.classes,
    }" @close="visible = false">
      <form v-if="visible" method="dialog" :class="{
        'modal-box rounded-xl border-2 border-slate-400/10 bg-neutral-100 p-4 dark:bg-neutral-900': true,
      }">
        <slot />

        <div class="modal-action" v-if="!props.hideConfirm || props.showCancel">
          <slot name="footer" />
          <slot name="actionButtons">
            <div :class="{
              'grid grid-cols-2 gap-2': true,
            }">
              <button v-if="props.showCancel" value="false" :class="{
                'mt-4 bg-neutral-200 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-800/80 font-medium py-2 px-4 rounded': true,
                '[grid-column:2]': props.hideConfirm || !props.showCancel,
              }" @click.prevent="cancel">
                {{ props.cancelText }}
              </button>
              <button v-if="!props.hideConfirm" :disabled="props.loading" value="true"
                class="mt-4 bg-green-400/10 hover:bg-green-400/20 font-medium py-2 px-4 rounded disabled:cursor-not-allowed disabled:opacity-50 inline-flex justify-center items-center gap-1"
                @click.prevent="confirm">
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
  </div>
</template>

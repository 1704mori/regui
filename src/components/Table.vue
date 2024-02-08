<template>
  <div class="flex flex-col gap-1">
    <div
      class="space-y-2 md:space-y-0 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden max-h-80 overflow-y-scroll"
    >
      <div
        v-if="!total || !data.length"
        class="flex justify-between items-center px-4 py-2 bg-neutral-50 dark:bg-neutral-950"
      >
        <p class="text-sm font-medium">no results found</p>
      </div>

      <div
        v-for="(item, index) in data as any"
        :key="index"
        :class="[
          'bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900 hover:cursor-pointer px-1 py-1.5 shadow-md flex flex-wrap [@media(min-width:840px)]:grid sm:gap-4',
          className,
        ]"
        :style="{ gridTemplateColumns: generateGridColumns.join(' ') }"
        @click="() => {
          if (!rowClick) return;
          const newData = { ...item };

          if (typeof Object.keys(newData).some((key) => typeof newData[key] === 'object')) {
            const thatSomeKey = Object.keys(newData).filter((key) => typeof newData[key] === 'object')
            // const value = newData[thatSomeKey!];
            // if ('__v_isVNode' in value) {
            //   // scan in value where 'data-valuehere' is
            //   let dataValue = '';

            //   // loop 'value'
            //   for (let i = 0; i < value.children.length; i++) {
            //     if (value.children[i].props?.['data-valuehere']) {
            //       dataValue = value.children[i].props['data-valuehere'];
            //     }
            //   }

            //   newData[thatSomeKey!] = dataValue;
            // }

            for (let i = 0; i < thatSomeKey.length; i++) {
              const value = newData[thatSomeKey[i]];
              if ('__v_isVNode' in value) {
                let dataValue = '';

                for (let i = 0; i < value.children.length; i++) {
                  if (value.children[i].props?.['data-valuehere']) {
                    dataValue = value.children[i].props['data-valuehere'];
                  }
                }

                newData[thatSomeKey[i]] = dataValue;
              }
            }
          }

          rowClick(newData);
        }"
      >
        <div
          v-for="(column, columnIndex) in columns as any"
          :key="columnIndex"
          :class="[
            'w-full p-2 mt-auto',
            {
              'max-md:[&:not(:last-child)]:border-b border-neutral-200 dark:border-neutral-800 self-center truncate':
                (typeof item[column.key] === 'string' &&
                  !isHTMLElement(item[column.key])) ||
                isHTMLElement(item[column.key]),
              'self-center':
                typeof item[column.key] === 'object' &&
                isHTMLElement(item[column.key]) &&
                item[column.key].props?.className,
            },
          ]"
        >
          <!-- <p
            v-if="typeof item[column.key] == 'string'"
            class="font-medium"
            v-html="item[column.key]"
          />
          <component v-else :is="item[column.key]" /> -->

          <div
            v-if="showColumnName"
            :class="[
              'flex flex-col justify-start items-stretch relative min-w-full',
              item[column.key].rules,
            ]"
          >
            <p class="text-sm font-semibold">{{ column.label }}</p>
            <p
              v-if="typeof item[column.key] == 'string'"
              class="font-medium"
              v-html="item[column.key]"
            />
            <component v-else :is="item[column.key]" />
          </div>
          <component v-else>
            <p
              v-if="typeof item[column.key] == 'string'"
              class="font-medium"
              v-html="item[column.key]"
            />
            <component v-else :is="item[column.key]" />
          </component>
          
          <div
            v-if="
              column.key === 'actions' && typeof item[column.key] != 'string'
            "
            class="w-full flex justify-center items-center"
          >
            <component :is="item[column.key]" />
          </div>

          <div
            v-if="
              typeof item[column.key] !== 'string' &&
              typeof item[column.key] == 'object'
            "
            :class="[
              'flex flex-col justify-start items-stretch relative min-w-full',
              item[column.key].rules,
            ]"
          >
            <p class="text-sm font-semibold">{{ item[column.key].head }}</p>
            <p class="text-sm truncate">
              {{
                column.modifyValue
                  ? column.modifyValue(item[column.key].child)
                  : item[column.key].child
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from "vue";
import Pagination from "./Pagination.vue";

export default defineComponent({
  name: "Table",
  components: {
    Pagination,
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    className: String,
    rowsPerPage: {
      type: Number,
      default: 5,
    },
    showColumnName: Boolean,
    total: Number,
    pageClick: Function,
    rowClick: Function,
  },
  setup(props) {
    const { columns } = toRefs(props);

    // find a better way to check if the value is an HTML element
    const isHTMLElement = (value: any) => {
      const htmlTags = [
        "input",
        "button",
        "select",
        "textarea",
        "div",
        "p",
        "span",
      ];
      return htmlTags.includes(value.type);
    };

    const generateGridColumns = columns.value.map((column: any) =>
      ["id", "actions"].includes(column.key) ? "auto" : "1fr",
    );

    return {
      isHTMLElement,
      generateGridColumns,
    };
  },
  methods: {
    pageChanged(page: number) {
      if (this.pageClick) {
        this.pageClick(page);
      }
    },
  },
});
</script>

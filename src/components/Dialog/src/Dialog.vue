<script setup lang="ts">
import { ElDialog, ElScrollbar } from "element-plus"
import { computed, useAttrs, ref, unref, useSlots } from "vue"

const slots = useSlots()

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: "Title"
  },
  fullscreen: {
    type: Boolean,
    default: true
  },
  width: {
    type: Number,
    default: 850
  }
})

const getBindValue = computed(() => {
  const delArr: string[] = ["fullscreen", "title"]
  const attrs = useAttrs()
  const obj = { ...attrs, ...props }
  for (const key in obj) {
    if (delArr.indexOf(key) !== -1) {
      delete obj[key]
    }
  }
  return obj
})

const isFullscreen = ref(false)

const toggleFull = () => {
  isFullscreen.value = !unref(isFullscreen)
}
const fullscreenSvgName = computed(() => {
  return isFullscreen.value ? "fullscreen-exit" : "fullscreen"
})
</script>

<template>
  <ElDialog
    :width="width"
    v-bind="getBindValue"
    :fullscreen="isFullscreen"
    destroy-on-close
    lock-scroll
    draggable
    :close-on-click-modal="false"
    :show-close="false"
  >
    <template #header="{ close }">
      <div class="flex justify-between items-center h-30px relative">
        <slot name="title">
          {{ title }}
        </slot>
        <div class="h-30px flex justify-between items-center absolute top-[50%] right-15px translate-y-[-50%]">
          <SvgIcon :name="fullscreenSvgName" @click="toggleFull" class="!h-30px mr-3 cursor-pointer" />
          <SvgIcon name="close" @click="close" class="!h-30px cursor-pointer" />
        </div>
      </div>
    </template>

    <ElScrollbar>
      <slot />
    </ElScrollbar>

    <template v-if="slots.footer" #footer>
      <slot name="footer" />
    </template>
  </ElDialog>
</template>

<style lang="scss">
.el-dialog {
  &__header {
    border-bottom: 1px solid var(--el-border-color-lighter);
    .svg-icon:hover {
      color: var(--el-color-primary);
    }
  }

  &__body {
    padding: 15px !important;
  }

  &__footer {
    border-top: 1px solid var(--el-border-color-lighter);
  }

  &__headerbtn {
    top: 0;
  }
}
</style>

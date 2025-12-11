<script lang="ts" setup>
import { Memo } from "@element-plus/icons-vue"
import { getDownloadSysDocApi } from "@/api/product"

const toLink = () => {
  getDownloadSysDocApi().then(({ data }) => {
    window.open(data, "_blank")
  })
}
</script>

<template>
  <div>
    <el-link @click="toLink" :underline="false">
      <Memo style="width: 1.5em; height: 1.5em" />
      使用文檔
    </el-link>
  </div>
</template>

<style lang="scss" scoped></style>

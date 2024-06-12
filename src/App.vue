<script lang="ts" setup>
import { useTheme } from "@/hooks/useTheme"
// 将 Element Plus 的语言设置为中文
import zhTw from "element-plus/es/locale/lang/zh-tw"

const { initTheme } = useTheme()

/** 初始化主题 */
initTheme()
</script>

<template>
  <el-config-provider :locale="zhTw">
    <router-view />
  </el-config-provider>
</template>

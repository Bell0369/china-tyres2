<script setup>
import { ExportOne, ExportTow, ExportThree, ExportFour } from "./export"

defineOptions({
  name: "Export"
})
</script>

<template>
  <div class="app-container">
    <export-one />
    <export-tow />
    <export-three />
    <export-four />
  </div>
</template>

<style lang="scss" scoped></style>

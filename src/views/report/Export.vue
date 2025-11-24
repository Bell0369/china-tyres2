<script setup>
import { ExportOne, ExportTow, ExportThree, ExportFour, ExportFive, ExportSix, ExportSeven } from "./export"

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
    <export-five />
    <export-six />
    <export-seven />
  </div>
</template>

<style lang="scss" scoped></style>

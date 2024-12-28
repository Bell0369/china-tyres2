<script setup>
import { ExportOne, ExportTow, ExportThree, ExportFour, ExportFive, ExportSix, ExportPdf } from "./export"

defineOptions({
  name: "Export"
})
</script>

<template>
  <div class="app-container">
    <export-pdf />
    <export-one />
    <export-tow />
    <export-three />
    <export-four />
    <export-five />
    <export-six />
  </div>
</template>

<style lang="scss" scoped></style>

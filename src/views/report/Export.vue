<script setup>
import { ExportOne, ExportTow, ExportFour, ExportFive, ExportSix, ExportSeven, ExportEight, ExportNine } from "./export"
// import {
//   ExportOne,
//   ExportTow,
//   ExportFour,
//   ExportFive,
//   ExportSix,
//   ExportSeven,
//   ExportEight
// } from "./export"

defineOptions({
  name: "Export"
})
</script>

<template>
  <div class="app-container">
    <export-tow />
    <export-one />
    <export-four />
    <export-five />
    <export-six />

    <export-seven />
    <export-eight />
    <export-nine />
  </div>
</template>

<style lang="scss" scoped></style>

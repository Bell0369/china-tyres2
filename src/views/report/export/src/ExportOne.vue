<script setup>
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { exportTheShipmentLedgerApi, exportSellRealSituationApi } from "@/api/selects"

defineOptions({
  name: "ExportOne"
})

const monthrangeData = ref(["", ""])

// 導出發貨流水賬
const loadingBtn1 = ref(false)
// 導出實時銷售情況
const loadingBtn2 = ref(false)

// 選中數據
const exportData = (Type) => {
  if (monthrangeData.value[0] === "") {
    ElMessage.error("請選擇时间先")
    return false
  }
  switch (Type) {
    case 1:
      exportFile(exportTheShipmentLedgerApi, loadingBtn1, "shipping-flow")
      break
    case 2:
      exportFile(exportSellRealSituationApi, loadingBtn2, "instant-sale")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true
  api({
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1]
  })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `${name}.xlsx`
      downloadLink.click()
    })
    .finally(() => {
      setTimeout(() => {
        loadingRef.value = false
      }, 500)
    })
}
</script>

<template>
  <el-card v-permission="['exportTheShipmentLedger', 'exportSellRealSituation']" shadow="never" class="search-wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker
          v-model="monthrangeData"
          type="daterange"
          range-separator="-"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          v-permission="['exportTheShipmentLedger']"
          @click="exportData(1)"
          :loading="loadingBtn1"
          >導出發貨流水賬</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          v-permission="['exportSellRealSituation']"
          @click="exportData(2)"
          :loading="loadingBtn2"
          >導出實時銷售情況</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

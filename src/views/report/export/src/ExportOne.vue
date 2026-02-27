<script setup>
import { ref } from "vue"
import { ElMessage } from "element-plus"
import {
  exportTheShipmentLedgerApi,
  exportSellRealSituationApi,
  exportBusinessApi,
  exportKilogramUnitPriceApi
} from "@/api/selects"

defineOptions({
  name: "ExportOne"
})

const monthrangeData = ref(["", ""])

// 導出發貨流水賬
const loadingBtn1 = ref(false)
// 導出銷售流水账
const loadingBtn2 = ref(false)
// 導出業務台賬
const loadingBtn3 = ref(false)
// 導出公斤單價
const loadingBtn4 = ref(false)

// 選中數據
const exportData = (Type) => {
  if (monthrangeData.value[0] === "") {
    ElMessage.error("請選擇时间先")
    return false
  }

  // // 将日期字符串转换为 Date 对象
  // const startDate = new Date(monthrangeData.value[0])
  // const endDate = new Date(monthrangeData.value[1])

  // // 获取时间差（以毫秒为单位）
  // const timeDiff = endDate - startDate
  // // 将毫秒转换为天数
  // const daysDiff = timeDiff / (1000 * 3600 * 24)

  switch (Type) {
    case 1:
      exportFile(exportTheShipmentLedgerApi, loadingBtn1, "發貨流水賬")
      break
    case 2:
      // if (daysDiff <= 5) {
      //   exportFile(exportSellRealSituationApi, loadingBtn2, "銷售流水账")
      // } else {
      //   ElMessage.error("最多選擇5天")
      //   return false
      // }
      exportFile(exportSellRealSituationApi, loadingBtn2, "銷售流水账")
      break
    case 3:
      exportFile(exportBusinessApi, loadingBtn3, "業務台賬")
      break
    case 4:
      exportFile(exportKilogramUnitPriceApi, loadingBtn4, "公斤單價")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true
  const FormattingDates = monthrangeData.value[0].replace(/-/g, "") + "-" + monthrangeData.value[1].replace(/-/g, "")

  api({
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1]
  })
    .then((data) => {
      if (data.type === "application/json") {
        const reader = new FileReader()
        reader.onload = () => {
          const text = reader.result
          const jsonResponse = JSON.parse(text)
          ElMessage.error(jsonResponse.message)
        }
        reader.readAsText(data)
      } else {
        const downloadLink = document.createElement("a")
        downloadLink.href = URL.createObjectURL(data)
        downloadLink.download = `${name}${FormattingDates}.xlsx`
        downloadLink.click()
      }
    })
    .finally(() => {
      setTimeout(() => {
        loadingRef.value = false
      }, 500)
    })
}
</script>

<template>
  <el-card
    shadow="never"
    class="search-wrapper"
    v-permission="['exportTheShipmentLedger', 'exportSellRealSituation', 'exportBusiness', 'exportKilogramUnitPrice']"
  >
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker
          v-model="monthrangeData"
          type="daterange"
          range-separator="-"
          start-placeholder="*開始日期*"
          end-placeholder="*結束日期*"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item v-permission="['exportTheShipmentLedger']">
        <el-button type="primary" @click="exportData(1)" :loading="loadingBtn1">導出發貨流水賬</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportSellRealSituation']">
        <el-button type="primary" @click="exportData(2)" :loading="loadingBtn2">導出銷售流水賬</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportBusiness']">
        <el-button type="primary" @click="exportData(3)" :loading="loadingBtn3">導出業務台賬</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportKilogramUnitPrice']">
        <el-button type="primary" @click="exportData(4)" :loading="loadingBtn4">導出公斤單價</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

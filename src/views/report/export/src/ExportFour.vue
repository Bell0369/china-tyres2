<script setup>
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { exportTheShipmentLedgerApi } from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"

defineOptions({
  name: "ExportFour"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

const monthrangeData = ref(["", ""])
const client_id = ref("")

// 導出訂單客戶報表
const loadingBtn1 = ref(false)

// 選中數據
const exportData = () => {
  if (monthrangeData.value[0] === "") {
    ElMessage.error("請選擇时间先")
    return false
  }
  if (client_id.value === "") {
    ElMessage.error("請選擇客戶")
    return false
  }
  ElMessage.info("暫未開通")
  return
  // exportFile(exportTheShipmentLedgerApi, loadingBtn1, "customer-report")
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true
  api({
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1],
    client_id: client_id.value
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
  <el-card shadow="never" class="search-wrapper">
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
        <el-select
          v-model="client_id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadClientData"
          :loading="loadClient"
          placeholder="客戶"
          style="width: 200px"
        >
          <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          v-permission="['exportTheShipmentLedger']"
          @click="exportData()"
          :loading="loadingBtn1"
          >導出訂單客戶報表</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

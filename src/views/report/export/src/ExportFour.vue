<script setup>
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { exportClientSellOverviewApi, exportOrderGeneralViewApi } from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"

defineOptions({
  name: "ExportFour"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

const monthrangeData = ref(["", ""])
const clientItem = ref("")

// 導出訂單客戶報表
const loadingBtn1 = ref(false)

// 導出客戶銷售總覽
const loadingBtn2 = ref(false)

// 選中數據
const exportData = (Type) => {
  if (monthrangeData.value[0] === "") {
    ElMessage.error("請選擇时间先")
    return false
  }
  if (clientItem.value === "") {
    ElMessage.error("請選擇客戶")
    return false
  }

  switch (Type) {
    case 1:
      exportFile(exportOrderGeneralViewApi, loadingBtn1, "订单发货状态总览")
      break
    case 2:
      exportFile(exportClientSellOverviewApi, loadingBtn2, "销售规格数量统计")
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
    end_date: monthrangeData.value[1],
    client_id: clientItem.value.client_id
  })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `${name}${clientItem.value.client_code}.${FormattingDates}.xlsx`
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
          v-model="clientItem"
          value-key="id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadClientData"
          :loading="loadClient"
          placeholder="客戶"
          style="width: 200px"
        >
          <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          v-permission="['exportOrderGeneralView']"
          @click="exportData(1)"
          :loading="loadingBtn1"
          >導出訂單總覽</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          v-permission="['exportClientSellOverview']"
          @click="exportData(2)"
          :loading="loadingBtn2"
          >導出客戶銷售總覽</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

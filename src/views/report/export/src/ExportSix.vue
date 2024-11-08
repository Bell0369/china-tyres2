<script setup>
import { ref } from "vue"
import { exportSalesDataSalesmanApi, exportSalesDataAdminApi } from "@/api/selects"
import { useUserStore } from "@/store/modules/user"

defineOptions({
  name: "ExportSix"
})

const { userinfo } = useUserStore()

const monthrangeData = ref(["", ""])

// 業務員
const loadingBtn1 = ref(false)

// 管理員
const loadingBtn2 = ref(false)

// 選中數據
const exportData = (Type) => {
  switch (Type) {
    case 1:
      exportFile(exportSalesDataSalesmanApi, loadingBtn1, "業務員")
      break
    case 2:
      exportFile(exportSalesDataAdminApi, loadingBtn2, "管理員")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true
  const [startDate, endDate] = monthrangeData.value.map((date) => date.replace(/-/g, ""))
  const FormattingDates = `${startDate}-${endDate}`

  api({
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1]
  })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `${name}.${FormattingDates}.xlsx`
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
        <el-button
          type="primary"
          v-permission="['exportSalesDataSalesman']"
          @click="exportData(1)"
          :loading="loadingBtn1"
          >導出sales data(業務員)</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-button v-if="userinfo.role_name === '管理员'" type="primary" @click="exportData(2)" :loading="loadingBtn2"
          >導出sales data(管理員)</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

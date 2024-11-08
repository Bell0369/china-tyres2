<script setup>
import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { exportOrderUnscheduledProductionApi, exportSalesUnitPriceQuantitySummaryApi } from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { useFactorySelect } from "@/hooks/useFactorySelect"

defineOptions({
  name: "ExportFour"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

const monthrangeData = ref(["", ""])
const FormData = reactive({
  client_id: "",
  brand_id: "",
  factory_code: "",
  tyre_type: ""
})

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

  if (FormData.factory_code === "") {
    ElMessage.error("請選擇工廠")
    return false
  }

  switch (Type) {
    case 1:
      exportFile(exportSalesUnitPriceQuantitySummaryApi, loadingBtn1, "銷售單價數量匯總")
      break
    case 2:
      exportFile(exportOrderUnscheduledProductionApi, loadingBtn2, "未排產訂單數量匯總")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true

  // name工廠代碼.日期.品牌.輪胎類型
  // 去除每个日期字符串中的 "-" 并格式化
  const [startDate, endDate] = monthrangeData.value.map((date) => date.replace(/-/g, ""))
  const { brand_id, tyre_type } = FormData

  // 初始化日期格式字符串
  let FormattingDates = `${startDate}-${endDate}`

  // 条件添加品牌ID和轮胎类型
  FormattingDates += brand_id ? `.${brand_id.short}` : ""
  FormattingDates += tyre_type ? `.${tyre_type}` : ""

  api({
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1],
    client_id: FormData.client_id || undefined,
    factory_code: FormData.factory_code.factory_code,
    brand_id: FormData.brand_id.id || undefined,
    tyre_type: FormData.tyre_type || undefined
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
        downloadLink.download = `${name}${FormData.factory_code.name}.${FormattingDates}.xlsx`
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
          v-model="FormData.client_id"
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
        <el-select v-model="FormData.brand_id" style="width: 150px" placeholder="品牌" value-key="id">
          <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          value-key="id"
          v-model="FormData.factory_code"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadFactoryData"
          :loading="loadFactory"
          style="width: 150px"
          placeholder="工廠"
        >
          <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="FormData.tyre_type" placeholder="輪胎類型" style="width: 150px">
          <el-option label="4S" value="4S" />
          <el-option label="SUMMER" value="SUMMER" />
          <el-option label="TBR" value="TBR" />
          <el-option label="WINTER" value="WINTER" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="exportData(1)"
          v-permission="['exportSalesUnitPriceQuantitySummary']"
          :loading="loadingBtn1"
          >導出銷售單價數量匯總</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          @click="exportData(2)"
          v-permission="['exportOrderUnscheduledProduction']"
          :loading="loadingBtn2"
          >導出未排產訂單數量匯總</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

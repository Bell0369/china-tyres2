<script setup>
import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import {
  exportFactoryProductionSchedulingSummaryApi,
  exportOverviewOfUnfulfilledOrderSortingAndShippingApi,
  exportSummaryOfUnfulfilledOrderDistributionDetailsApi
} from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { useFactorySelect } from "@/hooks/useFactorySelect"

defineOptions({
  name: "ExportNine"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

const FormData = reactive({
  client_id: "",
  brand_id: "",
  factory_id: ""
})

// 工廠排產訂單匯總
const loadingBtn1 = ref(false)

// 未完成訂單分貨發貨總覽
const loadingBtn2 = ref(false)

// 未完成訂單分貨明細匯總
const loadingBtn3 = ref(false)

// 選中數據
const exportData = (Type) => {
  if (FormData.factory_id === "") {
    ElMessage.error("請選擇工廠")
    return false
  }

  switch (Type) {
    case 1:
      exportFile(exportFactoryProductionSchedulingSummaryApi, loadingBtn1, "工廠排產訂單匯總")
      break
    case 2:
      exportFile(exportOverviewOfUnfulfilledOrderSortingAndShippingApi, loadingBtn2, "未完成訂單分貨發貨總覽")
      break
    case 3:
      exportFile(exportSummaryOfUnfulfilledOrderDistributionDetailsApi, loadingBtn3, "未完成訂單分貨明細匯總")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true

  const { brand_id, factory_id, client_id } = FormData

  // 条件添加品牌ID和轮胎类型
  let FormattingDates = ""
  FormattingDates += client_id ? `.${client_id.client_code}` : ""
  FormattingDates += brand_id ? `.${brand_id.short}` : ""

  api({
    client_id: client_id.id || undefined,
    factory_id: factory_id.id || undefined,
    brand_id: brand_id.id || undefined
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
        downloadLink.download = `${name}.${FormData.factory_id.name}${FormattingDates}.xlsx`
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
    v-permission="[
      'exportFactoryProductionSchedulingSummary',
      'exportOverviewOfUnfulfilledOrderSortingAndShipping',
      'exportSummaryOfUnfulfilledOrderDistributionDetails'
    ]"
  >
    <el-form :inline="true">
      <el-form-item>
        <el-select
          value-key="id"
          v-model="FormData.factory_id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadFactoryData"
          :loading="loadFactory"
          style="width: 150px"
          placeholder="*工廠*"
        >
          <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          value-key="id"
          v-model="FormData.client_id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadClientData"
          :loading="loadClient"
          placeholder="客戶"
          style="width: 150px"
          clearable
        >
          <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="FormData.brand_id" style="width: 150px" placeholder="品牌" value-key="id" clearable>
          <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item v-permission="['exportFactoryProductionSchedulingSummary']">
        <el-button type="primary" @click="exportData(1)" :loading="loadingBtn1">導出工廠排產訂單匯總</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportOverviewOfUnfulfilledOrderSortingAndShipping']">
        <el-button type="primary" @click="exportData(2)" :loading="loadingBtn2">導出未完成訂單/未完成PI總覽</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportSummaryOfUnfulfilledOrderDistributionDetails']">
        <el-button type="primary" @click="exportData(3)" :loading="loadingBtn3">導出未完成訂單分貨明細匯總</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

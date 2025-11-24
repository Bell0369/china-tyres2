<script setup>
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { getInvListApi } from "@/api/order"
import {
  exportInvApi,
  exportPackingListApi,
  exportSNApi,
  exportWeightNoteApi,
  exportAllApi,
  exportFourInOneApi
} from "@/api/selects"
import { exportDataPdf } from "../jsPdf/exportPdf"
import { exportDataPdfPacking } from "../jsPdf/exportPdfPacking"

defineOptions({
  name: "ExportTow"
})
const loading = ref(false)

// 發票號
const optionsData = ref([])
const remoteMethod = (query) => {
  loading.value = true
  getInvListApi({
    page_size: 20,
    keyword: query
  })
    .then(({ data }) => {
      optionsData.value = data.data
    })
    .catch(() => {
      optionsData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// 銷售發票
const loadingInv = ref(false)
// 裝箱單
const loadingPacking = ref(false)
// SN
const loadingSN = ref(false)
// WeightNote
const loadingWeightNote = ref(false)
//
const loadingAll = ref(false)
// 銷售發票-pdf
const loadingPdfInv = ref(false)
// 裝箱單-pdf
const loadingPdfPacking = ref(false)
//
const loadingAll2 = ref(false)

// 選中數據
const inv_no = ref(null)
const exportData = (Type) => {
  if (!inv_no.value) {
    ElMessage.error("請選擇發票先")
    return false
  }
  switch (Type) {
    case 1:
      exportFile(exportInvApi, loadingInv, "INV")
      break
    case 2:
      exportFile(exportPackingListApi, loadingPacking, "PL")
      break
    case 3:
      exportFile(exportSNApi, loadingSN, "SN")
      break
    case 4:
      exportFile(exportWeightNoteApi, loadingWeightNote, "WN")
      break
    case 5:
      exportFile(exportAllApi, loadingAll, "INV-PL-SN")
      break
    case 6:
      loadingPdfInv.value = true
      exportDataPdf(inv_no.value, () => {
        loadingPdfInv.value = false
      })
      break
    case 7:
      loadingPdfPacking.value = true
      exportDataPdfPacking(inv_no.value, () => {
        loadingPdfPacking.value = false
      })
      break
    case 8:
      exportFile(exportFourInOneApi, loadingAll2, "INV-PL-SN-WN")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true
  api({ id: inv_no.value.id })
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
        const InvNo = inv_no.value.inv_no.slice(3)
        const downloadLink = document.createElement("a")
        downloadLink.href = URL.createObjectURL(data)
        // 仅在發貨類型為WH或DIR的時候加上工廠名稱，發票列表已返回發貨類型字段：shipped_type
        if (inv_no.value.shipped_type === "WH" || inv_no.value.shipped_type === "DIR") {
          const factoryName = inv_no.value.factory_name.join("-")
          downloadLink.download = `${name}${InvNo}-${inv_no.value.quantity}X40HQ-${factoryName}-${inv_no.value.client_code}.xlsx`
        } else {
          downloadLink.download = `${name}${InvNo}-${inv_no.value.quantity}X40HQ-${inv_no.value.client_code}.xlsx`
        }
        // downloadLink.download = `${name}${InvNo}-${inv_no.value.quantity}X40HQ-${inv_no.value.client_code}.xlsx`
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
        <el-select
          v-model="inv_no"
          value-key="id"
          filterable
          remote
          remote-show-suffix
          :remote-method="remoteMethod"
          :loading="loading"
          style="width: 200px"
          placeholder="*銷售發票號*"
        >
          <el-option v-for="item in optionsData" :key="item.id" :label="item.inv_no" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item v-permission="['exportInv']">
        <el-button type="primary" @click="exportData(1)" :loading="loadingInv">導出銷售發票</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportPackingList']">
        <el-button type="primary" @click="exportData(2)" :loading="loadingPacking">導出裝箱單</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportSN']">
        <el-button type="primary" @click="exportData(3)" :loading="loadingSN">導出SN</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportWeightNote']">
        <el-button type="primary" @click="exportData(4)" :loading="loadingWeightNote">導出Weight Note</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportFourInOne']">
        <el-button type="primary" @click="exportData(8)" :loading="loadingAll2"
          >合併發票/裝箱單/SN/Weight Note</el-button
        >
      </el-form-item>
      <el-form-item v-permission="['exportAll']">
        <el-button type="primary" @click="exportData(5)" :loading="loadingAll">合併發票/裝箱單/SN</el-button>
      </el-form-item>
      <el-form-item v-permission="['exportInv']">
        <el-button type="warning" @click="exportData(6)" :loading="loadingPdfInv">導出銷售發票(PDF)</el-button>
      </el-form-item>
      <el-form-item>
        <el-button
          type="warning"
          v-permission="['exportPackingList']"
          @click="exportData(7)"
          :loading="loadingPdfPacking"
          >導出裝箱單(PDF)</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

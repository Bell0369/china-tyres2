<script setup>
import { ref } from "vue"
import { getOrderListApi } from "@/api/order"
import { exportOrderCompleteFlowSchemeApi } from "@/api/selects"
import { ElMessage } from "element-plus"

defineOptions({
  name: "ExportThree"
})
const loading = ref(false)

const optionsData = ref([])
const remoteMethod = (query) => {
  loading.value = true
  getOrderListApi({
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

const order_no = ref("")

// 導出訂單流程數據
const loadingBtn1 = ref(false)

// 選中數據
const exportData = (Type) => {
  if (order_no.value === "") {
    ElMessage.error("請選擇訂單號")
    return false
  }
  switch (Type) {
    case 1:
      exportFile(exportOrderCompleteFlowSchemeApi, loadingBtn1, "訂單全流程數據")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true
  api({
    id: order_no.value.id
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
        downloadLink.download = `${name}${order_no.value.order_no}.xlsx`
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
          v-model="order_no"
          value-key="id"
          filterable
          remote
          remote-show-suffix
          :remote-method="remoteMethod"
          :loading="loading"
          style="width: 200px"
          placeholder="*訂單號*"
        >
          <el-option v-for="item in optionsData" :key="item.id" :label="item.order_no" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item v-permission="['exportOrderCompleteFlowScheme']">
        <el-button type="primary" @click="exportData(1)" :loading="loadingBtn1">導出訂單全流程數據</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

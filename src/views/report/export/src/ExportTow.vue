<script setup>
import { ref } from "vue"
import { ElMessage } from "element-plus"
import { getInvListApi } from "@/api/order"
import { exportInvApi, exportPackingListApi, exportSNApi } from "@/api/selects"

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
// 選中數據
const inv_no = ref(null)
const exportData = (Type) => {
  if (!inv_no.value) {
    ElMessage.error("請選擇發票先")
    return false
  }
  switch (Type) {
    case 1:
      exportFile(exportInvApi, loadingInv, "inv")
      break
    case 2:
      exportFile(exportPackingListApi, loadingPacking, "packing-list")
      break
    case 3:
      exportFile(exportSNApi, loadingSN, "sn")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true
  api({ id: inv_no.value.id })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `${inv_no.value.inv_no}.${name}.xlsx`
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
  <el-card v-permission="['exportInv', 'exportPackingList', 'exportSN']" shadow="never" class="search-wrapper">
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
          placeholder="請選擇銷售發票號"
        >
          <el-option v-for="item in optionsData" :key="item.id" :label="item.inv_no" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" v-permission="['exportInv']" @click="exportData(1)" :loading="loadingInv"
          >導出銷售發票</el-button
        >
        <el-button type="primary" v-permission="['exportPackingList']" @click="exportData(2)" :loading="loadingPacking"
          >導出裝箱單</el-button
        >
        <el-button type="primary" v-permission="['exportSN']" @click="exportData(3)" :loading="loadingSN"
          >導出SN</el-button
        >
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

<script setup>
import { ref, reactive, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { UploadXlsx } from "@/components/UploadXlsx"
import { uploadProductionSchedulingApi, submitProductionSchedulingApi } from "@/api/product"
import { redirectTo } from "@/utils/tagsclose"
import { debounce } from "lodash-es"
import { useBrandSelect } from "@/hooks/useSelectOption"

defineOptions({
  name: "UploadProductionScheduling"
})

// 品牌
const { brandOptions } = useBrandSelect()

const loading = ref(false)
const fullscreenLoading = ref(false)

// // tag
const route = useRoute()
const router = useRouter()

const FileForm = ref("")

const isSubmit = ref(true)

const tableRawDataOrders = ref([]) // 原始數據
const tableDataOrders = ref([])
// 上传文件
const setUploadXlsx = (value) => {
  FileForm.value = value
}

// 上傳排產
const uploadForm = () => {
  if (FileForm.value === "") {
    ElMessage.error("請上傳文件先")
    return
  }

  loading.value = true
  uploadProductionScheduling()
}

// 防抖處理
const uploadProductionScheduling = debounce(() => {
  const formData = new FormData()
  formData.append("file", FileForm.value)
  uploadProductionSchedulingApi(formData)
    .then(({ data }) => {
      isSubmit.value = false
      tableDataOrders.value = data
      tableRawDataOrders.value = data
    })
    .finally(() => {
      loading.value = false
    })
}, 1000)

// 移除
const handleDelete = (id, index) => {
  ElMessageBox.confirm("確認移除该行产品", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    tableRawDataOrders.value = tableRawDataOrders.value.filter((item) => item.id !== id)
    tableDataOrders.value.splice(index, 1)
    ElMessage.success("移除成功")
  })
}

// 提交排產
const submitForm = () => {
  fullscreenLoading.value = true
  isSubmit.value = true
  submitProductionSchedulingApi({
    data: tableRawDataOrders.value
  })
    .then(() => {
      ElMessage.success("提交成功")
      redirectTo(router, route, "/production-allocation/productionscheduling")
    })
    .finally(() => {
      fullscreenLoading.value = false
      isSubmit.value = false
    })
}

// 篩選
const searchFormRef = ref()
const searchData = reactive({
  product_name: "",
  brand_id: 0
})

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  tableDataOrders.value = tableRawDataOrders.value
}

// 查詢
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    tableDataOrders.value = filteredData.value
    loading.value = false
  }, 1000)
}

// 过滤数据 - 保持订单结构，只过滤产品
const filteredData = computed(() => {
  return tableRawDataOrders.value.filter((product) => {
    const nameMatch =
      !searchData.product_name || product.product_name.toLowerCase().includes(searchData.product_name.toLowerCase())

    const brandMatch = !searchData.brand_id || product.brand_id === searchData.brand_id

    return nameMatch && brandMatch
  })
})
</script>

<template>
  <div class="app-container" v-loading.fullscreen.lock="fullscreenLoading">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">上傳排產文件</el-text>
      </div>
      <div class="flex items-center">
        <div class="w-sm">
          <UploadXlsx @setUploadXlsx="setUploadXlsx" />
        </div>
        <div class="ml-10">
          <el-button type="success" @click="uploadForm()">確認上傳</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">附件信息</el-text>
          <div>
            <el-button type="primary" @click="submitForm()" :disabled="isSubmit">提交</el-button>
          </div>
        </div>
      </div>
      <div class="">
        <el-form ref="searchFormRef" :inline="true" :model="searchData">
          <el-form-item prop="product_name" label="產品名稱">
            <el-input v-model="searchData.product_name" placeholder="請輸入產品名稱" style="width: 200px" />
          </el-form-item>
          <el-form-item prop="brand_id" label="品牌代碼">
            <el-select v-model="searchData.brand_id" style="width: 150px">
              <el-option label="全部" :value="0" />
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table v-loading="loading" :data="tableDataOrders" height="500">
        <el-table-column prop="product_name" label="產品名稱" align="center" />
        <el-table-column prop="brand_name" label="品牌" align="center" />
        <el-table-column prop="inventory_number" label="庫存" align="center" width="140px">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.inventory_number"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column prop="production_number" label="生產" align="center" width="140px">
          <template #default="scope">
            <el-input-number
              v-model="scope.row.production_number"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center">
          <template #default="scope">
            <el-button type="danger" text bg size="small" @click="handleDelete(scope.row.id, scope.$index)">
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped></style>

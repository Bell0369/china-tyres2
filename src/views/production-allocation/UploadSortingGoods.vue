<script setup>
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { UploadXlsx } from "@/components/UploadXlsx"
import { uploadSortingGoodsApi, submitSortingGoodsApi } from "@/api/product"
import { redirectTo } from "@/utils/tagsclose"

defineOptions({
  name: "UploadSortingGoods"
})

const loading = ref(false)

// // tag
const route = useRoute()
const router = useRouter()

const FileForm = ref("")

const isSubmit = ref(true)

const tableData = ref([])
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
  const formData = new FormData()
  formData.append("file", FileForm.value)
  uploadSortingGoodsApi(formData)
    .then(({ data }) => {
      isSubmit.value = false
      tableData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

// 提交排產
const submitForm = () => {
  loading.value = true
  submitSortingGoodsApi(tableData.value)
    .then(() => {
      redirectTo(router, route, "/production-allocation/sortinggoods")
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">上傳分貨文件</el-text>
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
      <el-table v-loading="loading" :data="tableData" height="500">
        <el-table-column prop="product_name" label="產品名稱" lign="center" />
        <el-table-column prop="brand_name" label="品牌" align="center" />
        <el-table-column prop="inventory_number" label="庫存" align="center" width="140px">
          <template #default="scope">
            <el-input v-model="scope.row.inventory_number" type="number" input-style="text-align: center" />
          </template>
        </el-table-column>
        <el-table-column prop="production_number" label="生產" align="center" width="140px">
          <template #default="scope">
            <el-input v-model="scope.row.production_number" type="number" input-style="text-align: center" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped></style>

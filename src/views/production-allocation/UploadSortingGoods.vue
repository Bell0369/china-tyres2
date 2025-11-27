<script setup>
import { ref, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { UploadXlsx } from "@/components/UploadXlsx"
import { Search, Refresh } from "@element-plus/icons-vue"
import { uploadSortingGoodsApi, submitSortingGoodsApi } from "@/api/product"
import { redirectTo } from "@/utils/tagsclose"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { debounce } from "lodash-es"

defineOptions({
  name: "UploadSortingGoods"
})

// 品牌
const { brandOptions } = useBrandSelect()

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

const loading = ref(false)

// // tag
const route = useRoute()
const router = useRouter()

// 上传文件
const setUploadXlsx = (value) => {
  FileForm.value = value
}

// 上傳分貨
const tableDataOrders = ref([])
const tableData = ref([])

const FileForm = ref("") // 文件
const isSubmit = ref(true)
const uploadForm = () => {
  if (FileForm.value === "") {
    ElMessage.error("請上傳文件先")
    return
  }

  loading.value = true
  uploadSortingGoods()
}
// 防抖處理
const uploadSortingGoods = debounce(() => {
  const formData = new FormData()
  formData.append("file", FileForm.value)
  uploadSortingGoodsApi(formData)
    .then(({ data }) => {
      isSubmit.value = false
      tableDataOrders.value = data.orders
      tableData.value = data.unmatched_products
    })
    .finally(() => {
      loading.value = false
    })
}, 1000)

// 提交排產
const submitForm = () => {
  loading.value = true
  isSubmit.value = true
  submitSortingGoodsApi({
    data: tableDataOrders.value,
    not_order: tableData.value
  })
    .then(() => {
      ElMessage.success("提交成功")
      redirectTo(router, route, "/production-allocation/sortinggoods")
    })
    .finally(() => {
      loading.value = false
      isSubmit.value = false
    })
}

// 篩選
const searchFormRef = ref()
const searchData = reactive({
  order_no: "",
  product_name: "",
  brand_id: "0",
  factory_id: "0"
})
// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

// 查詢
const handleSearch = () => {
  console.log("查詢")
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
      <div class="">
        <el-form ref="searchFormRef" :inline="true" :model="searchData">
          <el-form-item prop="order_no" label="訂單編號">
            <el-input v-model="searchData.order_no" placeholder="請輸入訂單編號" style="width: 200px" />
          </el-form-item>
          <el-form-item prop="product_name" label="產品名稱">
            <el-input v-model="searchData.product_name" placeholder="請輸入產品名稱" style="width: 200px" />
          </el-form-item>
          <el-form-item prop="brand_id" label="品牌代碼">
            <el-select v-model="searchData.brand_id" style="width: 150px">
              <el-option label="全部" value="0" />
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item prop="factory_id" label="工廠代碼">
            <el-select v-model="searchData.factory_id" style="width: 150px">
              <el-option label="全部" value="0" />
              <el-option v-for="item in factoryCodeOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!-- :show-header="false" -->
      <el-table v-loading="loading" :data="tableDataOrders" border row-key="id" row-class-name="warning-row">
        <el-table-column type="expand">
          <template #default="props">
            <div class="px-2">
              <el-table :data="props.row.item" :max-height="450" size="small">
                <el-table-column label="產品名稱" prop="product_name" min-width="150" />
                <el-table-column label="客戶編碼" prop="client_code" />
                <el-table-column label="品牌" prop="brand_code" />
                <el-table-column label="訂單數量" prop="unproduced" />
                <el-table-column label="已分貨數量" prop="already_sorting_goods_number" width="140" align="center">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.already_sorting_goods_number"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="未分貨數量" prop="not_sorting_goods_number" align="center" />
                <el-table-column label="無訂單庫存" prop="no_order_number" align="center" />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="訂單號" prop="order_no" min-width="220">
          <template #default="scope">
            <div>
              <el-text>{{ scope.row.order_no }}</el-text>
            </div>
            <el-text size="small">備注：{{ scope.row.order_remarks || "----" }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="數量&櫃量匯總" min-width="570">
          <template #default="scope">
            <div class="table-header-li">
              <ul>
                <li>訂單數量匯總：{{ scope.row.total_number }}</li>
                <li>訂單櫃量匯總：{{ scope.row.total_quantity }}</li>
              </ul>
              <ul>
                <li>已分貨匯總：{{ scope.row.already_sorting_goods_total_number }}</li>
                <li>已分貨櫃量匯總：{{ scope.row.already_quantity_total_number }}</li>
              </ul>
              <ul>
                <li>未分貨匯總：{{ scope.row.not_sorting_goods_total_number }}</li>
                <li>未分貨櫃量匯總：{{ scope.row.not_quantity_total_number }}</li>
              </ul>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 無訂單產品 -->
    <el-card>
      <div class="toolbar-wrapper">
        <div class="mb">
          <el-text tag="b" size="large">無訂單產品</el-text>
        </div>
        <el-table v-loading="loading" border :data="tableData" :max-height="400">
          <el-table-column prop="product_name" label="產品名稱" align="center" />
          <el-table-column prop="brand_code" label="品牌" align="center" />
          <el-table-column prop="factory_code" label="工廠" align="center" />
          <el-table-column prop="inventory_number" label="庫存" align="center" />
          <el-table-column prop="production_number" label="生產" align="center" />
          <el-table-column prop="production_date" label="生產時間" align="center" />
          <el-table-column prop="no_order_number" label="無訂單數量" align="center" />
          <el-table-column prop="remaining_number" label="剩餘數量" align="center" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

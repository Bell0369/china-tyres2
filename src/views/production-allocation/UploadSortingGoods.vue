<script setup>
import { ref, reactive, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { UploadXlsx } from "@/components/UploadXlsx"
import { Search, Refresh } from "@element-plus/icons-vue"
import { uploadSortingGoodsApi, submitSortingGoodsApi } from "@/api/product"
import { redirectTo } from "@/utils/tagsclose"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { debounce } from "lodash-es"
import UnmatchedProducts from "./components/UnmatchedProducts.vue"

defineOptions({
  name: "UploadSortingGoods"
})

// 品牌
const { brandOptions } = useBrandSelect()

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

const loading = ref(false)
const fullscreenLoading = ref(false)

// // tag
const route = useRoute()
const router = useRouter()

// 上传文件
const setUploadXlsx = (value) => {
  FileForm.value = value
}

// 上傳分貨
const tableRawDataOrders = ref([]) // 原始數據
const tableDataOrders = ref([])
const unmatchedProductsData = ref([])

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
      tableRawDataOrders.value = data.orders
      tableDataOrders.value = data.orders
      unmatchedProductsData.value = data.unmatched_products
    })
    .finally(() => {
      loading.value = false
    })
}, 1000)

// 提交排產
const submitForm = () => {
  fullscreenLoading.value = true
  isSubmit.value = true
  submitSortingGoodsApi({
    data: tableRawDataOrders.value,
    not_order: unmatchedProductsData.value
  })
    .then(() => {
      ElMessage.success("提交成功")
      redirectTo(router, route, "/production-allocation/sortinggoods")
    })
    .finally(() => {
      fullscreenLoading.value = false
      isSubmit.value = false
    })
}

// 篩選
const searchFormRef = ref()
const searchData = reactive({
  order_no: "",
  product_name: "",
  brand_id: 0,
  factory_id: 0
})
// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  currentPage.value = 1
  tableDataOrders.value = tableRawDataOrders.value
}

// 查詢
const orderMatch = ref([])
const handleSearch = () => {
  currentPage.value = 1
  const usersWithWang = tableRawDataOrders.value.filter((item) =>
    item.order_no.toLowerCase().includes(searchData.order_no.toLowerCase())
  )
  if (usersWithWang.length === 0) {
    tableDataOrders.value = []
    return
  } else {
    orderMatch.value = usersWithWang
    loading.value = true
    setTimeout(() => {
      // console.log(displayResults.value)
      tableDataOrders.value = displayResults.value
      loading.value = false
    }, 1000)
  }
}

// 过滤数据 - 保持订单结构，只过滤产品
const filteredData = computed(() => {
  // console.log(orderMatch.value)

  return orderMatch.value.map((order) => {
    // 复制订单信息
    const filteredOrder = { ...order }
    // 过滤产品数组
    filteredOrder.item = order.item.filter((product) => {
      const nameMatch =
        !searchData.product_name || product.product_name.toLowerCase().includes(searchData.product_name.toLowerCase())

      const brandMatch = !searchData.brand_id || product.brand_id === searchData.brand_id

      const factoryMatch = !searchData.factory_id || product.factory_id === searchData.factory_id

      return nameMatch && brandMatch && factoryMatch
    })
    return filteredOrder
  })
})

// 统一处理显示结果
const displayResults = computed(() => {
  const ordersWithProducts = filteredData.value.filter((order) => order.item.length > 0)
  return ordersWithProducts
})

// 分页状态
const currentPage = ref(1)
const paginatedData = (data) => {
  const start = (currentPage.value - 1) * 10
  const end = start + 10
  return data.slice(start, end)
}

const handlePageChange = (page) => {
  currentPage.value = page
}

// 修改數量
const RawData_already_sorting_goods_number = ref(0)
const InputNumberFocus = (value) => {
  RawData_already_sorting_goods_number.value = value
}
const InputNumberBlur = (row, index) => {
  // 計算出當前行數據
  const not_sorting_goods_number = row.unproduced - row.already_sorting_goods_number
  row.not_sorting_goods_number = not_sorting_goods_number
  const num = RawData_already_sorting_goods_number.value - row.already_sorting_goods_number
  row.no_order_number += num

  // 订单已分货/未分货总数、柜量变化
  const quantityProduct = row.quantity * num
  // console.log(num, quantityProduct)
  const indexData = paginatedData(tableDataOrders.value)[index]
  const factor = 10000000
  // 已分货
  indexData.already_sorting_goods_total_number += -num
  const already_quantity = Number(indexData.already_quantity_total_number) + -quantityProduct
  indexData.already_quantity_total_number = Math.round(already_quantity * factor) / factor

  // 未分货
  indexData.not_sorting_goods_total_number += num
  const not_quantity = Number(indexData.not_quantity_total_number) + quantityProduct
  indexData.not_quantity_total_number = Math.round(not_quantity * factor) / factor

  // 查找其他訂單產品，修改無訂單庫存數據
  tableRawDataOrders.value.forEach((subArray, rowIndex) => {
    subArray.item.forEach((value, colIndex) => {
      if (value.product_id === row.product_id) {
        tableRawDataOrders.value[rowIndex].item[colIndex].no_order_number = row.no_order_number
      }
    })
  })
}
</script>

<template>
  <div class="app-container" v-loading.fullscreen.lock="fullscreenLoading">
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
              <el-option label="全部" :value="0" />
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item prop="factory_id" label="工廠代碼">
            <el-select v-model="searchData.factory_id" style="width: 150px">
              <el-option label="全部" :value="0" />
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
      <el-table
        v-loading="loading"
        :data="paginatedData(tableDataOrders)"
        border
        row-key="order_no"
        :expand-row-keys="[]"
        row-class-name="warning-row"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="px-2">
              <el-table :data="props.row.item" :max-height="450" size="small">
                <el-table-column label="產品名稱" prop="product_name" min-width="150" />
                <el-table-column label="客戶編碼" prop="client_code" />
                <el-table-column label="品牌" prop="brand_code" />
                <el-table-column label="工廠" prop="factory_name" />
                <el-table-column label="訂單數量" prop="unproduced" />
                <el-table-column label="已分貨數量" prop="already_sorting_goods_number" width="140" align="center">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.already_sorting_goods_number"
                      :min="0"
                      :max="scope.row.unproduced"
                      controls-position="right"
                      style="width: 100%"
                      @blur="InputNumberBlur(scope.row, props.$index)"
                      @focus="InputNumberFocus(scope.row.already_sorting_goods_number)"
                      :controls="false"
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
      <!-- 分页 -->
      <div class="pager-wrapper mt-4 flex justify-end">
        <el-pagination
          layout="total, prev, pager, next"
          :total="tableDataOrders.length"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
    <!-- 無訂單產品 -->
    <el-card>
      <div class="toolbar-wrapper">
        <div class="mb">
          <el-text tag="b" size="large">無訂單產品</el-text>
        </div>
        <!-- <el-table v-loading="loading" border :data="unmatchedProductsData" :max-height="400">
          <el-table-column prop="product_name" label="產品名稱" align="center" />
          <el-table-column prop="brand_code" label="品牌" align="center" />
          <el-table-column prop="factory_code" label="工廠" align="center" />
          <el-table-column prop="inventory_number" label="庫存" align="center" />
          <el-table-column prop="production_number" label="生產" align="center" />
          <el-table-column prop="production_date" label="生產時間" align="center" />
        </el-table> -->
        <unmatched-products :tableData="unmatchedProductsData" />
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

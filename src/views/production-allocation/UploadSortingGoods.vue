<script setup>
import { ref, reactive, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { UploadXlsx } from "@/components/UploadXlsx"
import { Search, Refresh, Memo } from "@element-plus/icons-vue"
import { uploadSortingGoodsApi, submitSortingGoodsApi } from "@/api/product"
import { redirectTo } from "@/utils/tagsclose"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { debounce } from "lodash-es"
import UnmatchedProducts from "./components/UnmatchedProducts.vue"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useRemarksSelect } from "@/hooks/useOrderRemarksSelect"
import { useRoundToSevenDecimals } from "./hooks/utils"
import { cloneDeep } from "lodash-es"

defineOptions({
  name: "UploadSortingGoods"
})

// 品牌
const { brandOptions } = useBrandSelect()

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 订单备注
const { loadRemarks, optionsRemarks, loadRemarksData } = useRemarksSelect()

const loading = ref(false)
const fullscreenLoading = ref(false)

// // tag
const route = useRoute()
const router = useRouter()

// 上传文件
const setUploadXlsx = (value) => {
  FileForm.value = value
}

// 上傳庫存
const tableRawDataOrders = ref([]) // 原始數據
const tableDataOrders = ref([])
const unmatchedProductsData = ref([])

const FileForm = ref("") // 文件
const brandId = ref(null) // 品牌
const isSubmit = ref(true)
const uploadForm = () => {
  if (brandId.value === null) {
    ElMessage.error("請選擇品牌")
    return
  }

  if (FileForm.value === "") {
    ElMessage.error("請上傳文件")
    return
  }

  loading.value = true
  uploadSortingGoods()
}
// 防抖處理
const uploadSortingGoods = debounce(() => {
  const formData = new FormData()
  formData.append("file", FileForm.value)
  formData.append("brand_id", brandId.value)
  uploadSortingGoodsApi(formData)
    .then(({ data }) => {
      isSubmit.value = false
      tableRawDataOrders.value = cloneDeep(data.orders)
      tableDataOrders.value = cloneDeep(data.orders)
      unmatchedProductsData.value = data.unmatched_products
    })
    .catch(() => {
      tableRawDataOrders.value = []
      tableDataOrders.value = []
      unmatchedProductsData.value = []
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
  order_remarks: "",
  product_name: "",
  brand_id: 0,
  factory_id: 0,
  client_id: 0,
  production_date: ""
})
// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  currentPage.value = 1
  tableDataOrders.value = cloneDeep(tableRawDataOrders.value)
}

// 查詢
const orderMatch = ref([])
const handleSearch = () => {
  currentPage.value = 1
  if (usersWithWang.value.length === 0) {
    tableDataOrders.value = []
    return
  } else {
    orderMatch.value = cloneDeep(usersWithWang.value)
    loading.value = true
    setTimeout(() => {
      // console.log(displayResults.value)
      tableDataOrders.value = cloneDeep(displayResults.value)
      loading.value = false
    }, 1000)
  }
}

// 过滤第一層数据
const usersWithWang = computed(() => {
  return tableRawDataOrders.value.filter((item) => {
    const orederMatch = !searchData.order_no || item.order_no.toLowerCase().includes(searchData.order_no.toLowerCase())
    const remarksMatch = !searchData.order_remarks || item.order_remarks === searchData.order_remarks

    return orederMatch && remarksMatch
  })
})

// 过滤第二層数据 - 保持订单结构，只过滤产品
const filteredData = computed(() => {
  // 检查是否所有搜索条件都为空
  const noSearchConditions =
    !searchData.product_name &&
    !searchData.brand_id &&
    !searchData.factory_id &&
    !searchData.client_id &&
    !searchData.production_date

  return orderMatch.value.map((order, index1) => {
    const filteredOrder = { ...order }
    // 如果没有搜索条件，直接返回原始数据并添加索引
    if (noSearchConditions) {
      filteredOrder.item = order.item.map((product, index2) => ({
        ...product,
        orderIndex: index1,
        originalIndex: index2
      }))
      return filteredOrder
    }

    // 有搜索条件时才过滤
    const filteredItems = []
    const filteredOrderTotal = {
      total_number: 0, // 訂單數量匯總
      total_quantity: 0, // 訂單櫃量匯總
      already_sorting_goods_total_number: 0, // 已分貨匯總
      already_quantity_total_number: 0, // 已分貨櫃量匯總,
      not_sorting_goods_total_number: 0, // 未分貨匯總
      not_quantity_total_number: 0 // 未分貨櫃量匯總
    }

    for (let index2 = 0; index2 < order.item.length; index2++) {
      const product = order.item[index2]

      // 优化：只在需要时才计算匹配条件
      const nameMatch = searchData.product_name
        ? product.product_name.toLowerCase().includes(searchData.product_name.toLowerCase())
        : true

      const brandMatch = searchData.brand_id ? product.brand_id === searchData.brand_id : true

      const factoryMatch = searchData.factory_id ? product.factory_id === searchData.factory_id : true

      const clientMatch = searchData.client_id ? product.client_id === searchData.client_id : true

      const productionDateMatch = searchData.production_date
        ? product.production_date === searchData.production_date
        : true

      if (nameMatch && brandMatch && factoryMatch && clientMatch && productionDateMatch) {
        // 汇总计算
        filteredOrderTotal.total_number += product.unproduced
        filteredOrderTotal.total_quantity += product.quantity * product.unproduced
        filteredOrderTotal.already_sorting_goods_total_number += product.already_sorting_goods_number
        filteredOrderTotal.already_quantity_total_number += product.quantity * product.already_sorting_goods_number
        filteredOrderTotal.not_sorting_goods_total_number += product.not_sorting_goods_number
        filteredOrderTotal.not_quantity_total_number += product.quantity * product.not_sorting_goods_number

        filteredItems.push({ ...product, orderIndex: index1, originalIndex: index2 })
      }
    }
    Object.assign(filteredOrder, filteredOrderTotal)
    filteredOrder.item = filteredItems

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
let RawData_already_sorting_goods_number = 0
const InputNumberFocus = (value) => {
  RawData_already_sorting_goods_number = value
}

const InputNumberBlur = (row, index) => {
  // 計算出當前行數據
  const not_sorting_goods_number = row.unproduced - row.already_sorting_goods_number
  row.not_sorting_goods_number = not_sorting_goods_number
  const num = RawData_already_sorting_goods_number - row.already_sorting_goods_number
  row.no_order_number += num

  // 订单已分货/未分货总数、柜量变化
  const quantityProduct = row.quantity * num

  const indexData = paginatedData(tableDataOrders.value)[index]

  // 已分货
  indexData.already_sorting_goods_total_number += -num
  const already_quantity = Number(indexData.already_quantity_total_number) + -quantityProduct
  indexData.already_quantity_total_number = already_quantity

  // 未分货
  indexData.not_sorting_goods_total_number += num
  const not_quantity = Number(indexData.not_quantity_total_number) + quantityProduct
  indexData.not_quantity_total_number = not_quantity

  // 查找其他訂單產品，修改無訂單庫存數據
  tableRawDataOrders.value.forEach((subArray, rowIndex) => {
    let rowIndexData = null
    if (subArray.order_id === row.order_id) {
      rowIndexData = tableRawDataOrders.value[rowIndex]

      rowIndexData.already_sorting_goods_total_number += -num
      rowIndexData.already_quantity_total_number = Number(indexData.already_quantity_total_number) + -quantityProduct
      rowIndexData.not_sorting_goods_total_number += num
      rowIndexData.not_quantity_total_number = Number(indexData.not_quantity_total_number) + quantityProduct
    }
    subArray.item.forEach((value, colIndex) => {
      if (value.product_id === row.product_id) {
        tableRawDataOrders.value[rowIndex].item[colIndex].no_order_number = row.no_order_number
      }
      if (subArray.id === row.sorting_goods_order_id && value.product_id === row.product_id) {
        rowIndexData.item[colIndex].already_sorting_goods_number = row.already_sorting_goods_number
        rowIndexData.item[colIndex].not_sorting_goods_number = row.not_sorting_goods_number
      }
    })
  })
}

// 弹框 - 產品
const dialogOrderVisible = ref(false)
const tableDataOrdersItem = ref([])
const getTableDataOrdersItem = (row) => {
  tableDataOrdersItem.value = []
  tableRawDataOrders.value.forEach((subArray, rowIndex) => {
    subArray.item.forEach((value, colIndex) => {
      if (value.product_id === row.product_id) {
        tableRawDataOrders.value[rowIndex].item[colIndex].no_order_number = row.no_order_number

        const data = {
          ...tableRawDataOrders.value[rowIndex],
          item: [tableRawDataOrders.value[rowIndex].item[colIndex]]
        }
        tableDataOrdersItem.value.push(data)
      }
    })
  })
}

const InputNumberBlur2 = (row, index) => {
  // 計算出當前行數據
  const not_sorting_goods_number = row.unproduced - row.already_sorting_goods_number
  // 未分货数
  row.not_sorting_goods_number = not_sorting_goods_number

  const num = RawData_already_sorting_goods_number - row.already_sorting_goods_number
  // 無訂單庫存數據變化
  row.no_order_number += num

  // 订单已分货/未分货总数、柜量变化
  const quantityProduct = row.quantity * num

  const indexData = tableDataOrdersItem.value[index]

  // 已分货
  indexData.already_sorting_goods_total_number += -num
  const already_quantity = Number(indexData.already_quantity_total_number) + -quantityProduct
  indexData.already_quantity_total_number = already_quantity

  // 未分货
  indexData.not_sorting_goods_total_number += num
  const not_quantity = Number(indexData.not_quantity_total_number) + quantityProduct
  indexData.not_quantity_total_number = not_quantity

  // 查找其他訂單產品，修改無訂單庫存數據
  tableRawDataOrders.value.forEach((subArray, rowIndex) => {
    let rowIndexData = null
    if (subArray.order_id === row.order_id) {
      rowIndexData = tableRawDataOrders.value[rowIndex]

      rowIndexData.already_sorting_goods_total_number += -num
      rowIndexData.already_quantity_total_number = Number(indexData.already_quantity_total_number) + -quantityProduct
      rowIndexData.not_sorting_goods_total_number += num
      rowIndexData.not_quantity_total_number = Number(indexData.not_quantity_total_number) + quantityProduct
    }
    subArray.item.forEach((value, colIndex) => {
      if (value.product_id === row.product_id) {
        tableRawDataOrders.value[rowIndex].item[colIndex].no_order_number = row.no_order_number
      }
      if (subArray.id === row.sorting_goods_order_id && value.product_id === row.product_id) {
        rowIndexData.item[colIndex].already_sorting_goods_number = row.already_sorting_goods_number
        rowIndexData.item[colIndex].not_sorting_goods_number = row.not_sorting_goods_number
      }
    })
  })

  tableDataOrders.value.forEach((subArray, rowIndex) => {
    let rowIndexData = null
    if (subArray.order_id === row.order_id) {
      rowIndexData = tableDataOrders.value[rowIndex]

      rowIndexData.already_sorting_goods_total_number += -num
      rowIndexData.already_quantity_total_number = Number(indexData.already_quantity_total_number) + -quantityProduct
      rowIndexData.not_sorting_goods_total_number += num
      rowIndexData.not_quantity_total_number = Number(indexData.not_quantity_total_number) + quantityProduct
    }
    subArray.item.forEach((value, colIndex) => {
      if (value.product_id === row.product_id) {
        tableDataOrders.value[rowIndex].item[colIndex].no_order_number = row.no_order_number
      }
      if (subArray.id === row.sorting_goods_order_id && value.product_id === row.product_id) {
        rowIndexData.item[colIndex].already_sorting_goods_number = row.already_sorting_goods_number
        rowIndexData.item[colIndex].not_sorting_goods_number = row.not_sorting_goods_number
      }
    })
  })
}
</script>

<template>
  <div class="app-container" v-loading.fullscreen.lock="fullscreenLoading">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">上傳庫存/生產文件</el-text>
      </div>
      <div class="mb">
        <el-text>品牌代碼</el-text>
        <el-select v-model="brandId" style="width: 230px; margin-left: 10px">
          <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
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
          <el-form-item prop="order_remarks" label="訂單備註">
            <el-select
              v-model="searchData.order_remarks"
              filterable
              remote
              remote-show-suffix
              :remote-method="loadRemarksData"
              :loading="loadRemarks"
              style="width: 200px"
            >
              <el-option label="全部" value="" />
              <el-option v-for="item in optionsRemarks" :key="item.id" :label="item.content" :value="item.content" />
            </el-select>
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
          <el-form-item prop="client_id" label="客戶編碼">
            <el-select
              v-model="searchData.client_id"
              filterable
              remote
              remote-show-suffix
              :remote-method="loadClientData"
              :loading="loadClient"
              style="width: 150px"
            >
              <el-option label="全部" :value="0" />
              <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item prop="production_date" label="生產時間">
            <el-input v-model="searchData.production_date" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        v-loading="loading"
        :data="paginatedData(tableDataOrders)"
        border
        row-key="order_id"
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
                <el-table-column label="生產時間" prop="production_date" />
                <el-table-column label="已分貨數量" prop="already_sorting_goods_number" width="140" align="center">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.already_sorting_goods_number"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                      @blur="InputNumberBlur(scope.row, props.$index)"
                      @focus="InputNumberFocus(scope.row.already_sorting_goods_number)"
                      :controls="false"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="未分貨數量" prop="not_sorting_goods_number" align="center" />
                <el-table-column label="無訂單庫存" prop="no_order_number" align="center">
                  <template #default="scope">
                    {{ scope.row.no_order_number }}
                    <el-button
                      style="padding: 5px"
                      type="primary"
                      plain
                      size="small"
                      :icon="Memo"
                      @click="getTableDataOrdersItem(scope.row), (dialogOrderVisible = true)"
                    />
                  </template>
                </el-table-column>
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
                <li>訂單櫃量匯總：{{ useRoundToSevenDecimals(scope.row.total_quantity) }}</li>
              </ul>
              <ul>
                <li>已分貨匯總：{{ scope.row.already_sorting_goods_total_number }}</li>
                <li>已分貨櫃量匯總：{{ useRoundToSevenDecimals(scope.row.already_quantity_total_number) }}</li>
              </ul>
              <ul>
                <li>未分貨匯總：{{ scope.row.not_sorting_goods_total_number }}</li>
                <li>未分貨櫃量匯總：{{ useRoundToSevenDecimals(scope.row.not_quantity_total_number) }}</li>
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
        <unmatched-products :tableData="unmatchedProductsData" />
      </div>
    </el-card>

    <!-- 弹框 - 产品 -->
    <el-dialog
      v-model="dialogOrderVisible"
      :title="`同產品訂單（${tableDataOrdersItem.length} 條記錄）`"
      width="1200px"
      destroy-on-close
      top="4vh"
    >
      <el-table
        :data="tableDataOrdersItem"
        row-key="order_id"
        :default-expand-all="true"
        row-class-name="warning-row"
        max-height="80vh"
        :show-header="false"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="px-2">
              <el-table :data="props.row.item" size="small">
                <el-table-column label="產品名稱" prop="product_name" min-width="150" />
                <el-table-column label="客戶編碼" prop="client_code" />
                <el-table-column label="品牌" prop="brand_code" />
                <el-table-column label="工廠" prop="factory_name" />
                <el-table-column label="訂單數量" prop="unproduced" />
                <el-table-column label="生產時間" prop="production_date" />
                <el-table-column label="已分貨數量" prop="already_sorting_goods_number" width="140" align="center">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.already_sorting_goods_number"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                      @blur="InputNumberBlur2(scope.row, props.$index)"
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
            <div>{{ scope.row.order_no }}</div>
            <el-text size="small">備注：{{ scope.row.order_remarks || "----" }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="數量匯總" min-width="570">
          <template #default="scope">
            <div class="table-header-li">
              <ul>
                <li>訂單數量匯總：{{ scope.row.total_number }}</li>
                <li>訂單櫃量匯總：{{ useRoundToSevenDecimals(scope.row.total_quantity) }}</li>
              </ul>
              <ul>
                <li>已分貨匯總：{{ scope.row.already_sorting_goods_total_number }}</li>
                <li>已分貨櫃量匯總：{{ useRoundToSevenDecimals(scope.row.already_quantity_total_number) }}</li>
              </ul>
              <ul>
                <li>未分貨匯總：{{ scope.row.not_sorting_goods_total_number }}</li>
                <li>未分貨櫃量匯總：{{ useRoundToSevenDecimals(scope.row.not_quantity_total_number) }}</li>
              </ul>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

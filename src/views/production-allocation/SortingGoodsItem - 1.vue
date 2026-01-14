<script setup>
import { ref, reactive, onMounted, computed } from "vue"
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import { Search, Refresh, Memo } from "@element-plus/icons-vue"
import {
  submitSortingGoodsApi,
  getSortingGoodsDetailApi,
  exportNoOrderDetailApi,
  exportSortingGoodsProductDetailApi,
  additionProductApi
} from "@/api/product"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
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

onMounted(() => {
  getSortingGoodsDetail()
})

// 詳情
const tableRawDataOrders = ref([]) // 原始數據
const tableDataOrders = ref([])
const unmatchedProductsData = ref([])
const getSortingGoodsDetail = () => {
  loading.value = true
  getSortingGoodsDetailApi({ id: route.query.id })
    .then(({ data }) => {
      tableRawDataOrders.value = data.orders
      tableDataOrders.value = data.orders
      unmatchedProductsData.value = data.unmatched_products
    })
    .finally(() => {
      loading.value = false
    })
}

// 提交分貨
const isSubmit = ref(false)
const submitForm = () => {
  fullscreenLoading.value = true
  isSubmit.value = true
  submitSortingGoodsApi({
    id: route.query.id,
    data: tableRawDataOrders.value,
    not_order: unmatchedProductsData.value
  })
    .then(() => {
      ElMessage.success("分貨提交成功")
    })
    .finally(() => {
      fullscreenLoading.value = false
      isSubmit.value = false
    })
}

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
  // if (ordersWithProducts.length === 0) return []

  // // 处理订单显示数据
  // const orders = ordersWithProducts.map((order) => {
  //   return order
  // })
  return ordersWithProducts
})

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)
const paginatedData = (data) => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return data.slice(start, end)
}

const handlePageChange = (page) => {
  currentPage.value = page
}

// 修改數量
let RawData_already_sorting_goods_number = 0
const InputNumberFocus = (value) => {
  RawData_already_sorting_goods_number = value
  // RawData_already_sorting_goods_number.value = value
}
const InputNumberBlur = (row, index, type) => {
  // 計算出當前行數據
  const not_sorting_goods_number = row.unproduced - row.already_sorting_goods_number
  // 未分货数
  row.not_sorting_goods_number = not_sorting_goods_number
  // const num = RawData_already_sorting_goods_number.value - row.already_sorting_goods_number
  console.log(RawData_already_sorting_goods_number)

  const num = RawData_already_sorting_goods_number - row.already_sorting_goods_number
  // 無訂單庫存數據變化
  row.no_order_number += num

  // 订单已分货/未分货总数、柜量变化
  const quantityProduct = row.quantity * num
  const factor = 10000000
  let indexData = {}

  if (type) {
    indexData = paginatedData(tableDataOrders.value)[index]
  } else {
    indexData = tableDataOrdersItem.value[index]
  }

  // 已分货
  indexData.already_sorting_goods_total_number += -num
  const already_quantity = Number(indexData.already_quantity_total_number) + -quantityProduct
  indexData.already_quantity_total_number = Math.round(already_quantity * factor) / factor

  // 未分货
  indexData.not_sorting_goods_total_number += num
  const not_quantity = Number(indexData.not_quantity_total_number) + quantityProduct
  indexData.not_quantity_total_number = Math.round(not_quantity * factor) / factor

  if (!type) {
    tableDataOrders.value.forEach((subArray, rowIndex) => {
      if (subArray.id === row.sorting_goods_order_id) {
        const rowIndexData = tableDataOrders.value[rowIndex]
        rowIndexData.already_sorting_goods_total_number = indexData.already_sorting_goods_total_number
        rowIndexData.already_quantity_total_number = indexData.already_quantity_total_number
        rowIndexData.not_sorting_goods_total_number = indexData.not_sorting_goods_total_number
        rowIndexData.not_quantity_total_number = indexData.not_quantity_total_number
      }
    })
  }
  // 查找其他訂單產品，修改無訂單庫存數據
  tableDataOrdersItem.value = []
  tableRawDataOrders.value.forEach((subArray, rowIndex) => {
    if (subArray.id === row.sorting_goods_order_id) {
      const rowIndexData = tableRawDataOrders.value[rowIndex]
      rowIndexData.already_sorting_goods_total_number = indexData.already_sorting_goods_total_number
      rowIndexData.already_quantity_total_number = indexData.already_quantity_total_number
      rowIndexData.not_sorting_goods_total_number = indexData.not_sorting_goods_total_number
      rowIndexData.not_quantity_total_number = indexData.not_quantity_total_number
    }
    subArray.item.forEach((value, colIndex) => {
      if (value.product_id === row.product_id) {
        // console.log(rowIndex, colIndex)
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

// 導出
const exportData = (tyep, row) => {
  if (tyep) {
    const dataJson = {
      sorting_goods_order_id: row.id
    }
    exportFile(dataJson, exportSortingGoodsProductDetailApi, `分貨訂單產品明細.${row.order_no}`)
  } else {
    const dataJson = {
      sorting_goods_id: route.query.id
    }
    exportFile(dataJson, exportNoOrderDetailApi, "無訂單庫存明細")
  }
}

// 導出方法
const exportFile = (dataJson, api, name) => {
  loading.value = true

  api(dataJson)
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
        downloadLink.download = `${name}.xlsx`
        downloadLink.click()
      }
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 追加規格
const customUpload = (options) => {
  const { file, data } = options
  const formData = new FormData()
  formData.append("file", file)
  formData.append("order_id", data.order_id)
  formData.append("sorting_goods_id", route.query.id)
  formData.append("sorting_goods_order_id", data.sorting_goods_order_id)

  fullscreenLoading.value = true
  additionProductApi(formData)
    .then(() => {
      ElMessage.success("追加規格上傳成功")
      getSortingGoodsDetail()
    })
    .catch((error) => {
      console.log(error)
    })
    .finally(() => {
      fullscreenLoading.value = false
    })
}

// 覆蓋上傳
const handleExceed = (files, uploadFiles, row) => {
  const options = {
    file: files[0],
    data: {
      order_id: row.order_id,
      sorting_goods_order_id: row.id
    }
  }
  customUpload(options)
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
</script>

<template>
  <div class="app-container" v-loading.fullscreen.lock="fullscreenLoading">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">分貨詳情</el-text>
          <div>
            <el-button type="warning" @click="exportData(0, 0)">導出無訂單庫存</el-button>
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
      <el-table
        v-loading="loading"
        :data="paginatedData(tableDataOrders)"
        border
        row-key="id"
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
                <!-- <el-table-column
                  label="生產時間"
                  prop="production_date"
                  column-key="production_date"
                  :filters="[
                    { text: '2016-05-01', value: '2016-05-01' },
                    { text: '2016-05-02', value: '2016-05-02' },
                    { text: '2016-05-03', value: '2016-05-03' },
                    { text: '2016-05-04', value: '2016-05-04' }
                  ]"
                  :filter-method="filterHandler"
                /> -->
                <el-table-column label="已分貨數量" prop="already_sorting_goods_number" width="140" align="center">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.already_sorting_goods_number"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                      @blur="InputNumberBlur(scope.row, props.$index, 1)"
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
                      v-if="scope.row.no_order_number > 0"
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
            <div>{{ scope.row.order_no }}</div>
            <el-text size="small">備注：{{ scope.row.order_remarks || "----" }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="數量匯總" min-width="570">
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
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <div style="display: inline-block; width: 80px">
              <el-upload
                accept=".xlsx, .xls"
                :limit="1"
                :show-file-list="false"
                :http-request="customUpload"
                :data="{
                  order_id: scope.row.order_id,
                  sorting_goods_order_id: scope.row.id
                }"
                :on-exceed="(files, fileList) => handleExceed(files, fileList, scope.row)"
                :key="scope.row.id"
              >
                <el-button type="primary" plain size="small">追加規格</el-button>
              </el-upload>
            </div>
            <el-button type="warning" plain size="small" @click="exportData(1, scope.row)">導出明細</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pager-wrapper mt-4 flex justify-end">
        <el-pagination
          layout="total, prev, pager, next"
          :total="tableDataOrders.length"
          :current-page="currentPage"
          :page-size="pageSize"
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
        row-key="id"
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
                      @blur="InputNumberBlur(scope.row, props.$index, 0)"
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
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

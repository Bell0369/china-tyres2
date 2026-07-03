<script setup>
import { ref, reactive, onMounted, computed, watch, shallowRef } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, Memo } from "@element-plus/icons-vue"
import {
  submitSortingGoodsApi,
  getSortingGoodsDetailApi,
  exportNoOrderDetailApi,
  exportSortingGoodsProductDetailApi,
  additionProductApi,
  submitCreatePiDataApi
} from "@/api/product"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import UnmatchedProducts from "./components/UnmatchedProducts.vue"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useRemarksSelect } from "@/hooks/useOrderRemarksSelect"
import { useRoundToSevenDecimals } from "./hooks/utils"
// import { cloneDeep } from "lodash-es"
import AdditionOrder from "./components/AdditionOrder.vue"

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

onMounted(() => {
  getSortingGoodsDetail()
})

const submitData = reactive({
  brand_id: null,
  factory_id: null,
  no: "",
  sorting_goods_order_ids: []
})

// 詳情
const tableRawDataOrders = shallowRef([]) // 原始數據,使用 shallowRef 避免深度监听开销
const unmatchedProductsData = ref([]) // 無訂單產品數據
const getSortingGoodsDetail = () => {
  loading.value = true
  getSortingGoodsDetailApi({ id: route.query.id })
    .then(({ data }) => {
      const { orders, unmatched_products, brand_id, factory_id, no } = data

      tableRawDataOrders.value = orders // 初始化
      buildProductMap()
      buildOrderMap()

      unmatchedProductsData.value = unmatched_products
      // 提交
      submitData.brand_id = brand_id
      submitData.factory_id = factory_id
      submitData.sorting_goods_order_ids = orders.map((item) => item.order_id)
      submitData.no = no
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
    not_order: unmatchedProductsData.value,
    brand_id: submitData.brand_id,
    factory_id: submitData.factory_id
  })
    .then(() => {
      ElMessage.success("分貨提交成功")
      isSubmitWatcher = false
    })
    .finally(() => {
      fullscreenLoading.value = false
      isSubmit.value = false
    })
}

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

let isInitialized = false
let isSubmitWatcher = false
watch(
  [() => tableRawDataOrders.value.map((order) => order.already_sorting_goods_total_number)],
  ([newNum], [oldNum]) => {
    if (!isInitialized) {
      isInitialized = true
      return
    }
    if (JSON.stringify(newNum) !== JSON.stringify(oldNum)) {
      console.log("订单结构变化（新增/删除）")
      isSubmitWatcher = true
    }
  },
  { flush: "post" } // DOM更新后触发
)

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  currentPage.value = 1
}

// 查詢
const filteredOrders = computed(() => {
  return tableRawDataOrders.value
    .map((order) => {
      const orderMatch =
        !searchData.order_no || order.order_no.toLowerCase().includes(searchData.order_no.toLowerCase())

      const remarkMatch = !searchData.order_remarks || order.order_remarks === searchData.order_remarks

      if (!orderMatch || !remarkMatch) {
        return null
      }

      const items = order.item.filter((product) => {
        return (
          (!searchData.product_name || product.product_name.includes(searchData.product_name)) &&
          (!searchData.brand_id || product.brand_id === searchData.brand_id) &&
          (!searchData.factory_id || product.factory_id === searchData.factory_id) &&
          (!searchData.client_id || product.client_id === searchData.client_id)
        )
      })

      if (!items.length) {
        return null
      }

      return {
        ...order,
        item: items
      }
    })
    .filter(Boolean)
})

// 分页状态
const currentPage = ref(1)
const pageSize = ref(10)
const pagedOrders = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value

  return filteredOrders.value.slice(start, start + pageSize.value)
})

const productMap = shallowRef(new Map())
const buildProductMap = () => {
  const map = new Map()

  tableRawDataOrders.value.forEach((order) => {
    order.item.forEach((product) => {
      const list = map.get(product.product_id) || []

      list.push({
        order,
        product
      })

      map.set(product.product_id, list)
    })
  })

  productMap.value = map
}

const handlePageChange = (page) => {
  currentPage.value = page
}

// 導出
const exportData = (type, row) => {
  if (type) {
    const dataJson = {
      sorting_goods_order_id: row.id
    }
    exportFile(dataJson, exportSortingGoodsProductDetailApi, `分貨訂單產品明細.${row.order_no}`)
  } else {
    const dataJson = {
      sorting_goods_id: route.query.id
    }
    exportFile(dataJson, exportNoOrderDetailApi, `${submitData.no} 無訂單庫存明細`)
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

const orderMap = shallowRef(new Map())
const buildOrderMap = () => {
  const map = new Map()

  tableRawDataOrders.value.forEach((order) => {
    map.set(order.id, order)
  })

  orderMap.value = map
}

// 修改數量
let RawData_already_sorting_goods_number = 0
const InputNumberFocus = (value) => {
  RawData_already_sorting_goods_number = value
}

const handleNumberChange = (value, row) => {
  row.already_sorting_goods_number = value
  InputNumberBlur(row)
}

const InputNumberBlur = (row) => {
  const diff = RawData_already_sorting_goods_number - row.already_sorting_goods_number

  if (!diff) {
    return
  }

  row.not_sorting_goods_number = row.unproduced - row.already_sorting_goods_number

  row.no_order_number += diff

  const quantity = row.quantity * diff

  const order = orderMap.value.get(row.sorting_goods_order_id)

  if (order) {
    order.already_sorting_goods_total_number -= diff

    order.already_quantity_total_number -= quantity

    order.not_sorting_goods_total_number += diff

    order.not_quantity_total_number += quantity
  }

  const products = productMap.value.get(row.product_id)

  if (products) {
    products.forEach(({ product }) => {
      product.no_order_number = row.no_order_number
    })
  }
}

// 弹框 - 產品
const dialogOrderVisible = ref(false)
const tableDataOrdersItem = ref([])
const getTableDataOrdersItem = (row) => {
  tableDataOrdersItem.value = productMap.value.get(row.product_id) || []

  tableDataOrdersItem.value.forEach(({ product }) => {
    product.no_order_number = row.no_order_number
  })
  console.log(tableDataOrdersItem.value)
}

// const calcOrderTotal = (order) => {
//   let already = 0
//   let not = 0
//   let alreadyQuantity = 0
//   let notQuantity = 0

//   order.item.forEach((item) => {
//     already += item.already_sorting_goods_number

//     not += item.not_sorting_goods_number

//     alreadyQuantity += item.quantity * item.already_sorting_goods_number

//     notQuantity += item.quantity * item.not_sorting_goods_number
//   })

//   order.already_sorting_goods_total_number = already

//   order.not_sorting_goods_total_number = not

//   order.already_quantity_total_number = alreadyQuantity

//   order.not_quantity_total_number = notQuantity
// }

// 提交生成PI
const submitCreatePiData = (id) => {
  if (isSubmitWatcher) {
    ElMessageBox.confirm("有未保存修改數據，確定生成PI？", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        proceedSubmitCreatePiData(id)
      })
      .catch(() => {
        console.log("取消")
      })
  } else {
    ElMessageBox.confirm("確定生成PI？", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        proceedSubmitCreatePiData(id)
      })
      .catch(() => {
        console.log("取消")
      })
  }
}

const proceedSubmitCreatePiData = (id) => {
  fullscreenLoading.value = true
  submitCreatePiDataApi({
    sorting_goods_order_ids: [id]
  })
    .then(() => {
      ElMessage.success("PI生成成功")
      getSortingGoodsDetail()
    })
    .finally(() => {
      fullscreenLoading.value = false
    })
}

// 追加新訂單
const dialogAddOrderVisible = ref(false)
const handleChildConfirm = () => {
  dialogAddOrderVisible.value = false
  getSortingGoodsDetail()
}
</script>

<template>
  <div class="app-container" v-loading.fullscreen.lock="fullscreenLoading">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">分貨詳情</el-text>
          <div>
            <el-button type="primary" plain @click="dialogAddOrderVisible = true">追加新訂單 </el-button>
            <el-button type="warning" @click="exportData(0, 0)">導出無訂單庫存 </el-button>
            <el-button type="primary" @click="submitForm" :disabled="isSubmit">提交</el-button>
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
          <el-form-item prop="brand_id" label="品牌">
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
          <el-form-item prop="client_id" label="客戶">
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
            <el-button type="primary" :icon="Search" @click="currentPage = 1">查詢</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table
        v-loading="loading"
        :data="pagedOrders"
        border
        row-key="order_id"
        :expand-row-keys="[]"
        row-class-name="warning-row"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="px-2">
              <el-table :data="props.row.item" :max-height="450" size="small">
                <el-table-column label="產品名稱" prop="product_name" min-width="200" />
                <el-table-column label="客戶編碼" prop="client_code" min-width="100" />
                <el-table-column label="品牌" prop="brand_code" min-width="100" />
                <el-table-column label="工廠" prop="factory_name" />
                <el-table-column label="發貨類型" prop="tyre_type" />
                <el-table-column label="訂單數量" prop="order_product_number" />
                <el-table-column label="PI數量" prop="pi_number" />
                <el-table-column label="未分配PI數量" prop="unproduced" min-width="90" />
                <el-table-column label="生產時間" prop="production_date" />
                <el-table-column label="已分貨數量" prop="already_sorting_goods_number" width="120" align="center">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.already_sorting_goods_number"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                      @change="(value) => handleNumberChange(value, scope.row)"
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
        <el-table-column label="訂單號" prop="order_no" min-width="200">
          <template #default="scope">
            <div>{{ scope.row.order_no }}</div>
            <el-text size="small">備注：{{ scope.row.order_remarks || "----" }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="數量匯總" min-width="800">
          <template #default="scope">
            <div class="table-header-li">
              <ul>
                <li>訂單數量匯總：{{ scope.row.total_number }}</li>
                <li>訂單櫃量匯總：{{ useRoundToSevenDecimals(scope.row.total_quantity) }}</li>
              </ul>
              <ul>
                <li>未生產數量匯總：{{ scope.row.unproduced_total_number }}</li>
                <li>未生產數量櫃量匯總：{{ useRoundToSevenDecimals(scope.row.unproduced_total_quantity) }}</li>
              </ul>
              <ul>
                <li>已分貨匯總：{{ scope.row.already_sorting_goods_total_number }}</li>
                <li>已分貨櫃量匯總：{{ useRoundToSevenDecimals(scope.row.already_quantity_total_number) }}</li>
              </ul>
              <ul>
                <li>PI未發貨數量匯總：{{ scope.row.pi_not_shipped_total_number }}</li>
                <li>PI未發貨數量櫃量匯總：{{ useRoundToSevenDecimals(scope.row.pi_not_shipped_total_quantity) }}</li>
              </ul>
              <ul>
                <li>未分貨匯總：{{ scope.row.not_sorting_goods_total_number }}</li>
                <li>未分貨櫃量匯總：{{ useRoundToSevenDecimals(scope.row.not_quantity_total_number) }}</li>
              </ul>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
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
            <el-button class="mt-1" type="primary" size="small" @click="submitCreatePiData(scope.row.id)">
              生成PI
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pager-wrapper mt-4 flex justify-end">
        <el-pagination
          layout="total, prev, pager, next"
          :total="pagedOrders.length"
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
              {{ props.row }}
              <el-table :data="props.row.item" size="small">
                <el-table-column label="產品名稱" prop="product_name" min-width="150" />
                <el-table-column label="客戶編碼" prop="client_code" min-width="100" />
                <el-table-column label="訂單數量" prop="order_product_number" />
                <el-table-column label="PI數量" prop="pi_number" />
                <el-table-column label="未分配PI數量" prop="unproduced" min-width="90" />
                <el-table-column label="生產時間" prop="production_date" />
                <el-table-column label="已分貨數量" prop="already_sorting_goods_number" width="120" align="center">
                  <template #default="scope">
                    <el-input-number
                      v-model="scope.row.already_sorting_goods_number"
                      :min="0"
                      controls-position="right"
                      style="width: 100%"
                      @change="(value) => handleNumberChange(value, scope.row)"
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
        <el-table-column label="訂單號" prop="order_no" min-width="200">
          <template #default="scope">
            <div>{{ scope.row.order_no }}</div>
            <el-text size="small">備注：{{ scope.row.order_remarks || "----" }}</el-text>
          </template>
        </el-table-column>
        <el-table-column label="數量匯總" min-width="600">
          <template #default="scope">
            <div class="table-header-li">
              <ul>
                <li>訂單數量匯總：{{ scope.row.total_number }}</li>
                <li>訂單櫃量匯總：{{ useRoundToSevenDecimals(scope.row.total_quantity) }}</li>
              </ul>
              <ul>
                <li>未生產數量匯總：{{ scope.row.unproduced_total_number }}</li>
                <li>未生產數量櫃量匯總：{{ useRoundToSevenDecimals(scope.row.unproduced_total_quantity) }}</li>
              </ul>
              <ul>
                <li>已分貨匯總：{{ scope.row.already_sorting_goods_total_number }}</li>
                <li>已分貨櫃量匯總：{{ useRoundToSevenDecimals(scope.row.already_quantity_total_number) }}</li>
              </ul>
              <ul>
                <li>PI未發貨數量匯總：{{ scope.row.pi_not_shipped_total_number }}</li>
                <li>PI未發貨數量櫃量匯總：{{ useRoundToSevenDecimals(scope.row.pi_not_shipped_total_quantity) }}</li>
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

    <!-- 弹框 - 追加新訂單 -->
    <el-dialog v-model="dialogAddOrderVisible" title="追加新訂單" width="1100px" destroy-on-close>
      <addition-order :parent-data="submitData" @submit-data="handleChildConfirm" />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import { Search, Refresh } from "@element-plus/icons-vue"
import { submitSortingGoodsApi } from "@/api/product"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"

import myData from "./storingGoodsDetail.json"

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

const tableRawDataOrders = ref([]) // 原始數據
const tableDataOrders = ref([])
const tableData = ref([])
onMounted(() => {
  // 模拟数据加载
  tableRawDataOrders.value = myData.data.orders
  tableDataOrders.value = myData.data.orders
  tableData.value = myData.data.unmatched_products
})

// 提交分貨
const isSubmit = ref(false)
const submitForm = () => {
  loading.value = true
  isSubmit.value = true
  submitSortingGoodsApi({
    data: tableDataOrders.value,
    not_order: tableData.value
  })
    .then(() => {
      ElMessage.success("分貨提交成功", route.query.id)
    })
    .finally(() => {
      loading.value = false
      isSubmit.value = false
    })
}

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
  tableDataOrders.value = tableRawDataOrders.value
}

// 查詢
const handleSearch = () => {
  const usersWithWang = tableDataOrders.value.filter((item) => item.order_no.includes(searchData.order_no))
  tableDataOrders.value = usersWithWang
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">分貨詳情</el-text>
          <div>
            <el-button type="warning">導出無訂單庫存</el-button>
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
          <template #default>
            <div style="display: inline-block; width: 80px">
              <el-upload action="*" :limit="1" :show-file-list="false">
                <el-button type="primary" plain size="small">添加規格</el-button>
              </el-upload>
            </div>
            <el-button type="warning" plain size="small">導出明細</el-button>
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

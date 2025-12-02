<script setup>
import { ref, onMounted, reactive, computed } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
import { getProductionSchedulingDetailApi, submitProductionSchedulingApi } from "@/api/product"
import { useBrandSelect } from "@/hooks/useSelectOption"

defineOptions({
  name: "ProductionSchedulingItem"
})

const loading = ref(true)

const route = useRoute()

// 品牌
const { brandOptions } = useBrandSelect()

// 詳情
onMounted(() => {
  getTableData()
})

const tableRawDataOrders = ref([]) // 原始數據
const tableDataOrders = ref([])

const getTableData = () => {
  getProductionSchedulingDetailApi({
    id: route.query.id
  })
    .then(({ data }) => {
      tableDataOrders.value = data
      tableRawDataOrders.value = data
    })
    .finally(() => {
      loading.value = false
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

// 提交排產
const isSubmit = ref(false)
const submitForm = () => {
  loading.value = true
  isSubmit.value = true
  submitProductionSchedulingApi({
    data: tableRawDataOrders.value,
    id: route.query.id
  })
    .then(() => {
      ElMessage.success("修改成功")
      getTableData()
    })
    .finally(() => {
      isSubmit.value = false
      loading.value = false
    })
}

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
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">排產詳情</el-text>
          <div>
            <el-button type="primary" @click="submitForm" :disabled="isSubmit">保存修改</el-button>
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
      <el-table v-loading="loading" border :data="tableDataOrders" max-height="600">
        <el-table-column prop="product_name" label="產品名稱" align="center" />
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

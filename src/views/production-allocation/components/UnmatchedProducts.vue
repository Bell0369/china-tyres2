<script setup>
import { defineProps, ref, reactive, watch, computed } from "vue"
import { Search, Refresh } from "@element-plus/icons-vue"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { debounce } from "lodash-es"
// 品牌
const { brandOptions } = useBrandSelect()

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

const loading = ref(false)

const tableRawData = ref([]) // 原始數據
const unmatchedProductsData = ref([])

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
})

watch(
  () => props.tableData,
  debounce((newList) => {
    unmatchedProductsData.value = newList
  }, 500)
)

const searchFormRef = ref()
const searchData = reactive({
  product_name: "",
  brand_id: 0,
  factory_id: 0
})

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  unmatchedProductsData.value = tableRawData.value
}

// 查詢
const orderMatch = ref([])
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    console.log(filteredData.value)
    unmatchedProductsData.value = filteredData.value
    loading.value = false
  }, 1000)
}

// 过滤数据 - 保持订单结构，只过滤产品
const filteredData = computed(() => {
  // console.log(orderMatch.value)
  return orderMatch.value.map((order) => {
    order.filter((product) => {
      const nameMatch =
        !searchData.product_name || product.product_name.toLowerCase().includes(searchData.product_name.toLowerCase())

      const brandMatch = !searchData.brand_id || product.brand_id === searchData.brand_id

      const factoryMatch = !searchData.factory_id || product.factory_id === searchData.factory_id

      return nameMatch && brandMatch && factoryMatch
    })

    return filteredOrder
  })
})
</script>

<template>
  <div>
    <div class="" style="display: none">
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
    <el-table v-loading="loading" border :data="unmatchedProductsData" :max-height="400">
      <el-table-column prop="product_name" label="產品名稱" align="center" />
      <el-table-column prop="brand_code" label="品牌" align="center" />
      <el-table-column prop="factory_code" label="工廠" align="center" />
      <el-table-column prop="inventory_number" label="庫存" align="center" />
      <el-table-column prop="production_number" label="生產" align="center" />
      <el-table-column prop="production_date" label="生產時間" align="center" />
    </el-table>
  </div>
</template>

<style scoped></style>

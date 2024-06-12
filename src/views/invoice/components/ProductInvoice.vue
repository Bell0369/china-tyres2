<script setup>
import { ref, defineProps, watch } from "vue"

defineOptions({
  name: "ProductInvoice"
})

const props = defineProps({
  list: Object
})

const tableData = ref([])
const tableDatas = ref([])
watch(
  () => props.list,
  () => {
    tableData.value = props.list
    tableDatas.value = props.list
  }
)

//#region 查
const keyword = ref("")
const handleSearch = () => {
  const data = tableDatas.value
  const results = []
  data.forEach((obj) => {
    const filteredItem = obj.item.filter((product) => product.product_name.includes(keyword.value))
    if (filteredItem.length > 0) {
      results.push({
        ...obj,
        item: filteredItem
      })
    }
  })
  console.log(results)
  tableData.value = results
}

// 重置
const resetSearch = () => {
  keyword.value = ""
  tableData.value = tableDatas.value
}
</script>

<template>
  <div>
    <div class="toolbar-wrapper">
      <el-text tag="b" size="large">詳細信息</el-text>
    </div>
    <div>
      <el-form :inline="true">
        <el-form-item label="產品名稱">
          <el-input v-model="keyword" placeholder="請輸入產品名稱" style="width: 300px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table :data="tableData" border row-class-name="warning-row">
      <el-table-column type="expand">
        <template #default="props">
          <div class="px">
            <el-table :data="props.row.item" :max-height="450">
              <el-table-column label="序號" type="index" width="80" align="center" />
              <el-table-column label="產品名稱" prop="product_name" align="center" />
              <el-table-column label="數量" prop="number" align="center" />
              <el-table-column label="價格" prop="unit_price" align="center" />
              <el-table-column label="金額" prop="total_prices" align="center" />
              <el-table-column label="櫃號" prop="container_no" align="center" />
              <el-table-column label="鉛封號" prop="seal_no" align="center" />
              <el-table-column label="采購發票號" prop="procurement_invoice_no" align="center" />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="發貨計劃號" prop="pi_no_delivery_plan_no" />
    </el-table>
  </div>
</template>

<style scoped>
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import { getProductionSchedulingDetailApi, submitProductionSchedulingApi } from "@/api/product"

defineOptions({
  name: "ProductionSchedulingItem"
})

const loading = ref(true)

const route = useRoute()

// 詳情
onMounted(() => {
  getTableData()
})
const tableData = ref([])
const getTableData = () => {
  getProductionSchedulingDetailApi({
    id: route.query.id,
    page_size: 30
  })
    .then(({ data }) => {
      tableData.value = data.data
    })
    .finally(() => {
      loading.value = false
    })
}

// 提交排產
const submitForm = () => {
  loading.value = true
  submitProductionSchedulingApi(tableData.value)
    .then(() => {
      ElMessage.success("修改成功", route.query.id)
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
        <div class="flex justify-between">
          <el-text tag="b" size="large">排產詳情</el-text>
          <div>
            <el-button type="primary" @click="submitForm()">提交</el-button>
          </div>
        </div>
      </div>
      <el-table v-loading="loading" border :data="tableData" max-height="600">
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
      </el-table>
    </el-card>
  </div>
</template>

<style scoped></style>

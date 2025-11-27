<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from "element-plus"
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
    id: route.query.id
  })
    .then(({ data }) => {
      tableData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

// 提交排產
const isSubmit = ref(false)
const submitForm = () => {
  loading.value = true
  isSubmit.value = true
  submitProductionSchedulingApi({
    data: tableData.value,
    id: route.query.id
  })
    .then(() => {
      ElMessage.success("修改成功", route.query.id)
    })
    .finally(() => {
      loading.value = false
      isSubmit.value = false
    })
}

// 移除
const handleDelete = (index) => {
  ElMessageBox.confirm("確認移除该行产品", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    ElMessage.success("移除成功")
    tableData.value.splice(index, 1)
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
            <el-button type="primary" @click="submitForm()" :disabled="isSubmit">保存修改</el-button>
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
        <el-table-column label="操作" width="90" align="center">
          <template #default="scope">
            <el-button type="danger" text bg size="small" @click="handleDelete(scope.$index)"> 移除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped></style>

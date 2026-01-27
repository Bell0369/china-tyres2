<script setup>
import { reactive, ref, onMounted, defineProps, defineEmits } from "vue"
import { getAdditionOrderListApi, sortingGoodsAdditionOrderApi } from "@/api/product"
import { ElMessage } from "element-plus"
import { useRoute } from "vue-router"

// 接收整个对象
const props = defineProps({
  parentData: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

const route = useRoute()

const loading = ref(true)

const paginationData = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

onMounted(() => {
  getTableData()
})

const tableData = ref([])
const getTableData = () => {
  const page = {
    page: paginationData.currentPage,
    page_size: paginationData.pageSize
  }
  loading.value = true
  getAdditionOrderListApi(Object.assign(page, props.parentData))
    .then(({ data }) => {
      paginationData.total = data.total
      tableData.value = data.data
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

// 使用 emit（如果需要向父组件发送事件）
const emit = defineEmits(["submit-data"])

// 追加訂單
const tableRef = ref(null)
const btnLoading = ref(false)
const sortingGoodsAdditionOrder = () => {
  const rows = tableRef.value.getSelectionRows()
  const orderIds = rows.map((item) => item.id)
  if (orderIds.length === 0) {
    ElMessage.error("請選擇訂單")
    return
  }
  btnLoading.value = true
  sortingGoodsAdditionOrderApi({
    order_ids: orderIds,
    sorting_goods_id: route.query.id
  })
    .then(() => {
      ElMessage.success("追加成功")
      // 向父组件发送事件
      emit("submit-data", { type: "local-count" })
    })
    .finally(() => {
      btnLoading.value = false
    })
}

// 分页变化
const handlePageChange = (newPage) => {
  paginationData.currentPage = newPage
  getTableData()
}
</script>

<template>
  <div v-loading="loading">
    <div class="table-wrapper">
      <el-table :data="tableData" border ref="tableRef">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="order_no" label="訂單號" align="center" />
        <el-table-column prop="client_code" label="客戶編碼" align="center" width="120" />
        <el-table-column prop="number" label="訂單數量" align="center" width="120" />
        <el-table-column prop="unproduced" label="未生產數量" align="center" width="120" />
        <el-table-column prop="pi_number" label="PI數量" align="center" width="120" />
        <el-table-column prop="pi_shipped_number" label="PI已發貨數量" align="center" width="120" />
        <el-table-column prop="pi_not_shipped_number" label="PI未發貨數量" align="center" width="120" />
      </el-table>
    </div>
    <div class="pager-wrapper">
      <el-pagination
        layout="total, prev, pager, next"
        :total="paginationData.total"
        :page-size="paginationData.pageSize"
        @change="handlePageChange"
      />
    </div>
    <div class="text-right">
      <el-button type="primary" @click="sortingGoodsAdditionOrder" :loading="btnLoading"> 確定 </el-button>
    </div>
  </div>
</template>

<style scoped></style>

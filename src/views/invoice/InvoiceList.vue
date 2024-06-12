<script setup>
import { reactive, ref, watch } from "vue"
import { ElButton } from "element-plus"
import { Search, Refresh } from "@element-plus/icons-vue"
import { getInvListApi, deleteSellInvApi } from "@/api/order"
import { usePagination } from "@/hooks/usePagination"
import { useDeleteList } from "@/hooks/useDeleteList"
import { useClientSelect } from "@/hooks/useClientSelect"

defineOptions({
  name: "DeliveryList"
})

const loading = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteSellInvApi,
  text: "销售发票"
})
// 删除/修改柜量 成功
watch([isDeleted], () => {
  getTableData()
})

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  keyword: "",
  status: "",
  client_code: ""
})
const getTableData = () => {
  loading.value = true
  getInvListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    keyword: searchData.keyword || undefined,
    status: searchData.status,
    client_code: searchData.client_code || undefined
  })
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
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
//#endregion

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="keyword" label="訂單">
          <el-input v-model="searchData.keyword" placeholder="請輸入PI號，發票號" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="status" label="應收狀態">
          <el-select v-model="searchData.status" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="未收" :value="0" />
            <el-option label="已收" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item prop="client_code" label="客戶編碼">
          <el-select
            v-model="searchData.client_code"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadClientData"
            :loading="loadClient"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="item in optionsClient"
              :key="item.id"
              :label="item.client_code"
              :value="item.client_code"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="table-wrapper">
        <el-table :data="tableData" border>
          <el-table-column prop="inv_no" label="銷售發票號" align="center" />
          <el-table-column prop="client_code" label="客戶編碼" align="center" />
          <el-table-column prop="product_total_price" label="金額" align="center" />
          <el-table-column prop="inv_fee" label="附加金額" align="center" />
          <el-table-column prop="other_fee_price" label="其他費用" align="center" />
          <el-table-column prop="status" label="應收狀態" align="center">
            <template #default="scope">
              <el-tag type="danger" v-if="scope.row.status === 0"> 未收 </el-tag>
              <el-tag type="success" v-else> 已收 </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                v-permission="['invDetail', 'editInv']"
                type="success"
                text
                bg
                size="small"
                tag="router-link"
                :to="`/invoice/invoiceitem?id=${scope.row.id}`"
                >查看</el-button
              >
              <el-button
                v-permission="['deleteSellInv']"
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row.id)"
                style="display: none"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped></style>

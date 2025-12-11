<script setup>
import { reactive, ref, watch } from "vue"
import { ElButton, ElMessageBox } from "element-plus"
import { Search, Refresh } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { getRecordsListApi, getDetailApi } from "@/api/order"

defineOptions({
  name: "OperationLog"
})

const loading = ref(false)

// 分页
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//# 查
const tableData = ref([])

const searchFormRef = ref(null)
const searchData = reactive({
  name: "",
  monthrangeData: ""
})
const getTableData = () => {
  loading.value = true

  const monthrangeData = {}
  if (searchData.monthrangeData) {
    monthrangeData.start_date = searchData.monthrangeData[0]
    monthrangeData.end_date = searchData.monthrangeData[1]
  }
  const page = {
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    ...monthrangeData
  }
  Object.assign(searchData, page)
  getRecordsListApi(searchData)
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

// 詳情
const openDetail = (id) => {
  loading.value = true
  getDetailApi({
    id
  })
    .then(({ data }) => {
      ElMessageBox.alert(
        "<pre style='white-space: pre-wrap;'>" + JSON.stringify(data, null, 2) + "</pre>",
        "操作詳情",
        { dangerouslyUseHTMLString: true, showConfirmButton: false, closeOnClickModal: true }
      )
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="用戶名稱">
          <el-input v-model="searchData.name" placeholder="請輸入用戶名稱" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="monthrangeData" label="日期範圍">
          <el-date-picker
            v-model="searchData.monthrangeData"
            type="daterange"
            range-separator="-"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
          />
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
          <el-table-column prop="name" label="操作用戶" align="center" />
          <el-table-column prop="operation_item" label="操作內容" align="center" />
          <el-table-column prop="created_at" label="操作時間" align="center" />
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" bg text @click="openDetail(scope.row.id)"> 詳情 </el-button>
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

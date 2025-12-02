<script setup>
import { reactive, ref, watch, onActivated } from "vue"
import {
  getProductionSchedulingListApi,
  exportProductionSchedulingApi,
  deleteProduApictionSchedulingApi
} from "@/api/product"
import { ElButton } from "element-plus"
import { Search, CirclePlus, Refresh } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { useDeleteList } from "@/hooks/useDeleteList"
import { handleActivated } from "@/utils/tagsclose"

defineOptions({
  name: "ProductionScheduling"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  monthrangeData: ""
})
const getTableData = () => {
  const monthrangeData = {}
  if (searchData.monthrangeData) {
    monthrangeData.start_date = searchData.monthrangeData[0]
    monthrangeData.end_date = searchData.monthrangeData[1]
  }

  loading.value = true
  getProductionSchedulingListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    ...monthrangeData
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

// 激活
onActivated(() => {
  if (handleActivated()) getTableData()
})

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

// 導出排產
const handleExport = (row) => {
  loading.value = true
  exportProductionSchedulingApi({ id: row.id })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `排產.${row.no}.xlsx`
      downloadLink.click()
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteProduApictionSchedulingApi,
  text: "排产订单"
})

// 成功
watch([isDeleted], () => {
  handleSearch()
})
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="monthrangeData" label="日期范围">
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
      <div class="toolbar-wrapper">
        <div>
          <router-link to="/production-allocation/uploadproductionscheduling">
            <el-button type="primary" :icon="CirclePlus">上傳排產</el-button>
          </router-link>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table border :data="tableData">
          <el-table-column prop="no" label="排產編號" align="center" />
          <el-table-column prop="inventory_total_number" label="庫存總數" align="center" />
          <el-table-column prop="production_total_number" label="生產總數" align="center" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="190" align="center">
            <template #default="scope">
              <el-button
                type="success"
                text
                bg
                size="small"
                tag="router-link"
                :to="`/production-allocation/productionschedulingitem?id=${scope.row.id}`"
              >
                查看
              </el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row.id)">删除</el-button>
              <el-button type="warning" text bg size="small" @click="handleExport(scope.row)">導出</el-button>
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

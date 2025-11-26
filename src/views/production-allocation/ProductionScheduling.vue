<script setup>
import { reactive, ref, watch } from "vue"
import { getUserListApi } from "@/api/users"
import { ElButton } from "element-plus"
import { Search, CirclePlus, Refresh } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { useDepartmentSelect } from "@/hooks/useSelectOption"
import { exportProductionSchedulingApi } from "@/api/product"

defineOptions({
  name: "UserList"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 部門
const { roleOptions } = useDepartmentSelect()

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  username: "",
  state: "",
  role_name: ""
})
const getTableData = () => {
  loading.value = true
  getUserListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    keyword: searchData.username || undefined,
    status: searchData.state || undefined,
    role_name: searchData.role_name || undefined
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

// 導出排產
const handleExport = (row) => {
  loading.value = true
  exportProductionSchedulingApi({ id: row.id })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `排產.${row.pi_no}.xlsx`
      downloadLink.click()
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="searchData.username" placeholder="請輸入用戶名稱、登錄賬號、Email" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="state" label="狀態">
          <el-select v-model="searchData.state" style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="已開啟" value="1" />
            <el-option label="已關閉" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item prop="role_name" label="部门">
          <el-select v-model="searchData.role_name" style="width: 100px">
            <el-option label="全部" value="" />
            <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.name" />
          </el-select>
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
          <el-table-column prop="username" label="排產編號" align="center" />
          <el-table-column prop="account" label="庫存總數" align="center" />
          <el-table-column prop="role_name" label="生產總數" align="center" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="130" align="center">
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

<script setup>
import { reactive, ref, watch } from "vue"
import { getFactoryListApi, deleteFactoryApi, getUserListApi } from "@/api/users"
import { ElButton } from "element-plus"
import { Search, CirclePlus, Refresh } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { useRouter } from "vue-router"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { Dialog } from "@/components/Dialog"
import ForemanAdd from "./ForemanAdd.vue"
import { useDeleteList } from "@/hooks/useDeleteList"

defineOptions({
  name: "ForemanList"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteFactoryApi,
  text: "工廠"
})

// 删除成功
watch([isDeleted], () => {
  getTableData()
})

//品牌
const { brandOptions } = useBrandSelect()

// 員工列表
const loading2 = ref(false)
const userOptions = ref([])
const remoteMethod = (query) => {
  loading2.value = true
  getUserListApi({
    keyword: query || undefined
  })
    .then(({ data }) => {
      const list = data.data
      userOptions.value = list
    })
    .catch(() => {
      userOptions.value = []
    })
    .finally(() => {
      loading2.value = false
    })
}

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  keyword: "",
  payment_terms: "",
  user_id: ""
})
const getTableData = () => {
  loading.value = true
  getFactoryListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    keyword: searchData.keyword || undefined,
    user_id: searchData.user_id || undefined
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
  searchData.user_id = undefined
  searchFormRef.value?.resetFields()
  handleSearch()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

const router = useRouter()
// 改
const handleUpdate = (row) => {
  router.push({
    path: "/foreman/foremanitem",
    query: {
      id: row.id
    }
  })
}

// 逗號隔開
const userList = (list) => {
  return list.map((item) => item.username).join(", ")
}

// 添加工廠
const dialogVisible = ref(false)
const handleChildEvent = () => {
  dialogVisible.value = false
  getTableData()
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="username" label="工廠名稱">
          <el-input v-model="searchData.keyword" placeholder="請輸入工廠名稱" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="payment_terms" label="品牌" style="display: none">
          <el-select v-model="searchData.payment_terms" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in brandOptions" :label="item.name" :value="item.id" :key="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="user_id" label="員工">
          <el-select
            v-model="searchData.user_id"
            filterable
            remote
            remote-show-suffix
            :remote-method="remoteMethod"
            :loading="loading2"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in userOptions" :key="item.id" :label="item.username" :value="item.id" />
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
          <el-button v-permission="['addFactory']" type="primary" :icon="CirclePlus" @click="dialogVisible = true"
            >新增工廠</el-button
          >
        </div>
      </div>
      <div class="table-wrapper">
        <el-table ref="tableRef" :data="tableData" border>
          <el-table-column prop="name" label="工廠名稱" align="center" />
          <el-table-column prop="userInfo" label="所屬員工" width="200" :show-overflow-tooltip="true" align="center">
            <template #default="scope">
              <el-text>{{ userList(scope.row.userInfo) }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="factory_contact" label="聯絡人" align="center" />
          <el-table-column prop="phone" label="電話" align="center" />
          <el-table-column prop="email" label="Email" align="center" />
          <el-table-column prop="address" width="150" :show-overflow-tooltip="true" label="地址" align="center" />
          <el-table-column prop="advance_payment" label="預付款" align="center" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                v-permission="['addFactory', 'factoryBasicInfo']"
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row)"
                >查看</el-button
              >
              <el-button
                v-permission="['deleteFactory']"
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row.id)"
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

    <Dialog v-model="dialogVisible" title="新增工廠">
      <ForemanAdd :rowId="dialogId" @childEvent="handleChildEvent" />
    </Dialog>
  </div>
</template>

<style lang="scss" scoped></style>

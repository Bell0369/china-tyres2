<script setup>
import { reactive, ref, watch, onMounted } from "vue"
import { getUserListApi, deleteUserListApi, updateUserStatusApi, getAuthAllTreeApi } from "@/api/users"
import { ElButton, ElMessage } from "element-plus"
import { Search, CirclePlus, Refresh } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { Dialog } from "@/components/Dialog"
import EditUser from "./EditUser.vue"
import { useDeleteList } from "@/hooks/useDeleteList"
import { useDepartmentSelect } from "@/hooks/useSelectOption"
import { checkPermission } from "@/utils/permission"

defineOptions({
  name: "UserList"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 部門
const { roleOptions } = useDepartmentSelect()

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteUserListApi,
  text: "用户"
})

// 删除 成功
watch([isDeleted], () => {
  getTableData()
})

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

// 批量選中刪除
// const tableRef = ref()
// const toggleSelection = () => {
//   const rows = tableRef.value.getSelectionRows()
//   if (rows) {
//     rows.forEach((item: object) => {
//       console.log((item as any).username)
//     })
//   }
// }

// 修改狀態
const updatSatus = (row, index) => {
  if (row.id === 1 || !checkPermission(["editStatus"])) return
  loadingStates.value[index] = true
  updateUserStatusApi({
    id: row.id,
    status: row.user_status
  })
    .then(() => {
      ElMessage.success("操作成功")
    })
    .finally(() => {
      loadingStates.value[index] = false
    })
}
const loadingStates = ref([])
const isLoading = (index) => {
  return loadingStates.value[index] || false
}

// 增 / 改
const dialogVisible = ref(false)
const dialogTitle = ref("")
const userId = ref(0)
const handleUpdate = (row) => {
  userId.value = row
  dialogVisible.value = true
  if (row) {
    // 改
    dialogTitle.value = "編輯用戶"
  } else {
    // 增
    dialogTitle.value = "新增用戶"
  }
}

// 子組件調用父組件方法
const handleChildEvent = () => {
  // console.log("Received event from child:", payload)
  dialogVisible.value = false
  getTableData()
}

// 權限集
const authAllTree = ref([])
const getAuthAllTree = () => {
  getAuthAllTreeApi().then(({ data }) => {
    // Object.assign(authAllTree, data)
    const simplifiedPermissions = data.map((permission) => {
      const item = permission.item || []
      const simplifiedItem = item.map((item) => ({
        id: item.id,
        title: item.title,
        authority: item.authority
      }))
      return {
        id: permission.id,
        title: permission.title,
        authority: permission.authority,
        item: simplifiedItem
      }
    })
    authAllTree.value = simplifiedPermissions
  })
}

onMounted(() => {
  getAuthAllTree()
})
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
          <el-button v-permission="['addUser']" type="primary" :icon="CirclePlus" @click="handleUpdate(0)"
            >新增用戶</el-button
          >
          <!-- <el-button type="danger" :icon="Delete" @click="toggleSelection()">批量刪除</el-button> -->
        </div>
      </div>
      <div class="table-wrapper">
        <el-table border :data="tableData">
          <!-- <el-table-column type="selection" width="50" /> -->
          <el-table-column prop="username" label="用戶名稱" align="center" />
          <el-table-column prop="account" label="登錄號" align="center" />
          <el-table-column prop="role_name" label="部門" align="center" />
          <el-table-column prop="sex" label="性別" width="100" align="center" />
          <el-table-column prop="phone" label="電話" align="center" />
          <el-table-column prop="email" label="Email" align="center" />
          <el-table-column prop="user_status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-switch
                :disabled="scope.row.id === 1 || !checkPermission(['editStatus'])"
                v-model="scope.row.user_status"
                :active-value="1"
                :inactive-value="0"
                :loading="isLoading(scope.$index)"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                @click="updatSatus(scope.row, scope.$index)"
              />
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <el-button
                :disabled="scope.row.id === 1"
                v-permission="['addUser', 'getOneUser']"
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row.id)"
                >查看</el-button
              >
              <el-button
                :disabled="scope.row.id === 1"
                v-permission="['deleteUser']"
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

    <Dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <EditUser :authAllTree="authAllTree" :rowId="userId" @childEvent="handleChildEvent" />
    </Dialog>
  </div>
</template>

<style lang="scss" scoped></style>

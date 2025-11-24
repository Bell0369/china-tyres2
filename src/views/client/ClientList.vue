<script setup>
import { reactive, ref, watch } from "vue"
import { getClientListApi, deleteClientListApi, exportClientApi } from "@/api/users"
import { ElButton } from "element-plus"
import { Search, CirclePlus, Refresh, Upload } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { useRouter } from "vue-router"
import { usePayMentSelect } from "@/hooks/useSelectOption"
import { useDeleteList } from "@/hooks/useDeleteList"
import { useUserSelect } from "@/hooks/useUserSelect"
import { Dialog } from "@/components/Dialog"
import ClientAdd from "./ClientAdd.vue"

defineOptions({
  name: "ClientList"
})

const router = useRouter()

const { PayMentOptions } = usePayMentSelect()

// 員工
const { loadUser, optionsUser, loadUserData } = useUserSelect()

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 删
// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteClientListApi,
  text: "客戶"
})

// 删除 成功
watch([isDeleted], () => {
  getTableData()
})

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  keyword: "",
  payment_terms_id: "",
  user_id: ""
})
const getTableData = () => {
  loading.value = true
  getClientListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    keyword: searchData.keyword || undefined,
    payment_terms_id: searchData.payment_terms_id || undefined,
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
  searchFormRef.value?.resetFields()
  handleSearch()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

// 改
const handleUpdate = (row) => {
  router.push({
    path: "/client/clientitem",
    query: {
      id: row.id
    }
  })
}

// 增 / 改
const dialogVisible = ref(false)

// 編輯完成
const handleChildEvent = () => {
  dialogVisible.value = false
  getTableData()
}

// 導出客戶
const handleExportClient = () => {
  loading.value = true
  exportClientApi(searchData)
    .then((data) => {
      if (data.type === "application/json") {
        const reader = new FileReader()
        reader.onload = () => {
          const text = reader.result
          const jsonResponse = JSON.parse(text)
          ElMessage.error(jsonResponse.message)
        }
        reader.readAsText(data)
      } else {
        const downloadLink = document.createElement("a")
        downloadLink.href = URL.createObjectURL(data)
        downloadLink.download = `客戶列表.xlsx`
        downloadLink.click()
      }
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 在setup中
// const selectedLabel = computed(() => {
//   const selectedId1 = searchData.payment_terms_id
//   const selectedId2 = searchData.user_id
//   const selectedOption1 = PayMentOptions.value.find((item) => item.id === selectedId1)
//   const selectedOption2 = optionsUser.value.find((item) => item.id === selectedId2)
//   return {
//     payMentName: selectedOption1 ? selectedOption1.name : "",
//     userName: selectedOption2 ? selectedOption2.username : ""
//   }
// })
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="keyword" label="客戶名稱">
          <el-input v-model="searchData.keyword" placeholder="請輸入客戶名稱或客户编码" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="payment_terms_id" label="付款條件">
          <el-select v-model="searchData.payment_terms_id" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in PayMentOptions" :label="item.name" :value="item.id" :key="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="user_id" label="所屬員工">
          <el-select
            v-model="searchData.user_id"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadUserData"
            :loading="loadUser"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in optionsUser" :key="item.id" :label="item.username" :value="item.id" />
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
          <el-button v-permission="['addClient']" @click="dialogVisible = true" type="primary" :icon="CirclePlus">
            新增客戶
          </el-button>
          <el-button v-permission="['addClient']" @click="handleExportClient" type="warning" :icon="Upload">
            導出客戶
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table ref="tableRef" :data="tableData" border>
          <el-table-column prop="client_name" label="客戶名稱" align="center" width="120" />
          <el-table-column prop="client_code" label="编码" align="center" />
          <el-table-column prop="brand" label="品牌" align="center" />
          <el-table-column
            prop="payment_terms_name"
            label="付款條件"
            align="center"
            min-width="150"
            :show-overflow-tooltip="true"
          />
          <el-table-column prop="credit" label="信用額度" align="center" width="100" />
          <el-table-column prop="advance_payment" label="預付款" align="center" />
          <el-table-column prop="client_contact" label="聯繫人" align="center" />
          <el-table-column prop="phone" label="電話" width="150" align="center" />
          <el-table-column prop="last_inv_create_time" label="發票生成時間" align="center" width="120" />
          <el-table-column prop="created_at" label="创建时间" align="center" width="120" />
          <el-table-column fixed="right" label="操作" width="80" align="center">
            <template #default="scope">
              <el-button
                type="primary"
                v-permission="['addClient', 'clientShow']"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row)"
                >查看</el-button
              >
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row.id)" style="display: none"
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
    <Dialog v-model="dialogVisible" title="新增客戶">
      <ClientAdd :rowId="dialogId" @childEvent="handleChildEvent" />
    </Dialog>
  </div>
</template>

<style lang="scss" scoped></style>

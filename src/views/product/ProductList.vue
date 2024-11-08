<script setup>
import { reactive, ref, watch } from "vue"
import { getProductListApi, exportProductApi } from "@/api/product"
import { ElButton, ElMessage } from "element-plus"
import { Search, CirclePlus, Refresh, Upload, FolderAdd } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { useRouter } from "vue-router"
import { Dialog } from "@/components/Dialog"
import EditProduct from "./EditProduct.vue"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { useFactorySelect } from "@/hooks/useFactorySelect"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useDeleteList } from "@/hooks/useDeleteList"
import { getToken } from "@/utils/cache/cookies"

defineOptions({
  name: "ProductList"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: getProductListApi,
  text: "品牌"
})

// 删除/修改柜量 成功
watch([isDeleted], () => {
  getTableData()
})

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  name: "",
  factory_id: "",
  client_id: "",
  brand_id: "",
  tyre_type: ""
})
const getTableData = () => {
  loading.value = true
  getProductListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    name: searchData.name || undefined,
    factory_id: searchData.factory_id || undefined,
    client_id: searchData.client_id || undefined,
    brand_id: searchData.brand_id || undefined,
    tyre_type: searchData.tyre_type || undefined
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

const router = useRouter()
// 改
const handleView = (row) => {
  router.push({
    path: "/product/productitem",
    query: {
      id: row.id
    }
  })
}

// 增 / 改
const dialogVisible = ref(false)
const dialogTitle = ref("")
const dialogId = ref(0)
const handleUpdate = (row) => {
  dialogId.value = row
  dialogVisible.value = true
  if (row) {
    dialogTitle.value = "編輯產品"
  } else {
    dialogTitle.value = "新增產品"
  }
}

// 逗號隔開
const userList = (list) => {
  return list.map((item) => item.name).join(", ")
}

// 編輯完成
const handleChildEvent = () => {
  dialogVisible.value = false
  getTableData()
}

// 導出產品
const exportProduct = () => {
  loading.value = true
  exportProductApi()
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = "product.xlsx"
      downloadLink.click()
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

const baseUrl = import.meta.env.VITE_BASE_API
const token = getToken()
const headersObj = {
  Authorization: `Bearer ${token}`
}

const handleProgress = () => {
  loading.value = true
}

const uploadRef = ref()
const handleSuccess = (uploadFile) => {
  loading.value = false
  uploadRef.value.clearFiles()
  if (uploadFile.code !== 200) {
    ElMessage.error(uploadFile.message)
    return
  }
  ElMessage.success("操作成功")
  getTableData()
  // console.log(uploadFile)
}

const handleError = (uploadFile) => {
  loading.value = false
  ElMessage.success("上傳失敗")
  console.log(uploadFile)
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="name" label="產品名稱">
          <el-input v-model="searchData.name" placeholder="請輸入產品名稱" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="client_id" label="客戶編碼">
          <el-select
            v-model="searchData.client_id"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadClientData"
            :loading="loadClient"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="factory_id" label="工廠名稱">
          <el-select
            v-model="searchData.factory_id"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadFactoryData"
            :loading="loadFactory"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="brand_id" label="品牌">
          <el-select v-model="searchData.brand_id" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="tyre_type" label="輪胎類型">
          <el-select v-model="searchData.tyre_type" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="4S" value="4S" />
            <el-option label="SUMMER" value="SUMMER" />
            <el-option label="TBR" value="TBR" />
            <el-option label="WINTER" value="WINTER" />
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
        <div class="flex">
          <el-button v-permission="['addProduct']" type="primary" :icon="CirclePlus" @click="handleUpdate(0)"
            >新增產品</el-button
          >
          <el-upload
            class="ml3 mr3"
            ref="uploadRef"
            :headers="headersObj"
            :action="`${baseUrl}/product/importProduct`"
            :limit="1"
            :auto-upload="true"
            :show-file-list="false"
            accept=".xlsx, .xls"
            :on-error="handleError"
            :on-success="handleSuccess"
            :on-progress="handleProgress"
          >
            <template #trigger>
              <el-button type="primary" :icon="FolderAdd">批量新增產品</el-button>
            </template>
          </el-upload>
          <el-button v-permission="['exportProduct']" type="primary" :icon="Upload" @click="exportProduct"
            >導出產品</el-button
          >
        </div>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" border>
          <el-table-column prop="sort" label="排序值" align="center" />
          <el-table-column prop="name" label="產品名稱" align="center" />
          <el-table-column prop="brand" label="品牌" align="center" />
          <el-table-column prop="art" label="產品代碼" align="center" />
          <el-table-column prop="tyre_type" label="輪胎類型" align="center" />
          <el-table-column prop="customs_code" label="海關編碼" align="center" />
          <el-table-column prop="quantity" label="40'HQ裝櫃量" align="center" />
          <el-table-column prop="piece_weight" label="單重" align="center" />
          <el-table-column prop="client" label="客戶" align="center" width="150" :show-overflow-tooltip="true">
            <template #default="scope">
              <el-text>{{ userList(scope.row.client) }}</el-text>
              <!-- <el-text v-for="item in scope.row.client" :key="item.id">{{ item.name }}</el-text> -->
            </template>
          </el-table-column>
          <el-table-column prop="advance_payment" label="工廠" align="center">
            <template #default="scope">
              <el-text>{{ userList(scope.row.factory) }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="cost_price" label="採購價" align="center" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="130" align="center">
            <template #default="scope">
              <el-button
                v-permission="['addProduct']"
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row.id)"
                >編輯</el-button
              >
              <el-button
                v-permission="['productShow']"
                type="success"
                text
                bg
                size="small"
                @click="handleView(scope.row)"
                >查看</el-button
              >

              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row.id)" style="display: none">
                删除
              </el-button>
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
    <Dialog v-model="dialogVisible" :title="dialogTitle" width="60%">
      <EditProduct :rowId="dialogId" @childEvent="handleChildEvent" />
    </Dialog>
  </div>
</template>

<style lang="scss" scoped></style>

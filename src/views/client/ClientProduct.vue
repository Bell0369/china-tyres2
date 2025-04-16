<script setup>
import { ref, watch, reactive, onUnmounted } from "vue"
import { Search, Refresh } from "@element-plus/icons-vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useRoute } from "vue-router"
import {
  getClientProductApi,
  viewProductShowApi,
  updateClientProductApi,
  updateAllClientProductApi,
  deleteClientProductApi,
  monitorJobApi
} from "@/api/users"
import { getProductListApi } from "@/api/product"
import { usePagination } from "@/hooks/usePagination"
import { useDeleteList } from "@/hooks/useDeleteList"
import updatePrice from "@/views/componrnts/updatePrice/updatePrice.vue"
import { checkPermission } from "@/utils/permission"
import { exportClientProductApi } from "@/api/selects"
import { getToken } from "@/utils/cache/cookies"
import axios from "axios"

const loading = ref(false)

const route = useRoute()

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const props = defineProps({
  isProduct: Number,
  isDeldo: Boolean,
  isClientName: String
})

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteClientProductApi,
  text: "產品"
})

// 删除-成功
watch([isDeleted], () => {
  getTableData()
})

//#region 查
const tableData = ref([])
const keyword = ref("")
const getTableData = () => {
  loading.value = true
  getClientProductApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    keyword: keyword.value || undefined,
    id: route.query.id
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

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

// 重置
const resetSearch = () => {
  keyword.value = ""
  handleSearch()
}

// 增 / 改
const dialogVisible = ref(false)
const handleUpdate = (row) => {
  dialogVisible.value = true
  if (row) {
    getProductShow(row)
  } else {
    Object.keys(productForm).forEach((key) => {
      productForm[key] = undefined
    })
    productForm.id = 0
  }
}

// 產品信息明細 - 默認
const productFormRef = ref(null)
const productForm = reactive({
  product_id: 1,
  price: "",
  brand_name: ""
})
const getProductShow = (pid) => {
  viewProductShowApi({
    id: pid
  }).then(({ data }) => {
    Object.assign(productForm, data)
    const obj = {
      name: data.name,
      id: data.product_id
    }
    productOptions.value.push(obj)
  })
}

// 產品名稱
const loading2 = ref(false)
const productOptions = ref([])
const remoteMethod = (query) => {
  loading2.value = true
  getProductListApi({
    name: query || undefined,
    page_size: 20
  })
    .then(({ data }) => {
      const list = data.data
      productOptions.value = list
    })
    .catch(() => {
      productOptions.value = []
    })
    .finally(() => {
      loading2.value = false
    })
}

// 切換產品
const changeProduct = (e) => {
  const proNum = productOptions.value.findIndex((item) => {
    return item.id == e
  })
  productForm.brand_name = productOptions.value[proNum].brand
}

// 關閉調整產品彈框 - 清空option數據
const handleClose = () => {
  productOptions.value = []
}

// 提交產品更改
const submitProductForm = () => {
  productForm.client_id = route.query.id
  updateClientProductApi(productForm).then(() => {
    ElMessage.success("操作成功")
    dialogVisible.value = false
    getTableData()
  })
}

/** 調整價格 */
const dialogVisible2 = ref(false)

const childRef = ref(null)
const submitProductSum = () => {
  const childData = childRef.value.childData
  if (childData.price === "" && childData.per === "") {
    ElMessage.error("請輸入金額/百分比")
    return
  }
  childData.client_id = route.query.id
  updateAllClientProductApi(childData).then(() => {
    ElMessage.success("操作成功")
    dialogVisible2.value = false
    getTableData()
  })
}

const defaultContact = ref(true)
watch(
  () => props.isProduct,
  (newValue) => {
    defaultContact.value = newValue ? false : true
  }
)

// 導出產品
const clientName = ref("")
watch(
  () => props.isClientName,
  (newValue) => {
    clientName.value = newValue
  }
)
const exportClientProduct = () => {
  loading.value = true
  exportClientProductApi({
    client_id: route.query.id
  })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `${clientName.value}.product.xlsx`
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
  fullscreenLoading.value = true
}

const uploadRef = ref()
const fullscreenLoading = ref(false)
const handleSuccess = (uploadFile) => {
  fullscreenLoading.value = false
  uploadRef.value.clearFiles()
  if (uploadFile.code !== 200) {
    ElMessage.error(uploadFile.message)
    return
  }
  ElMessage.success("操作成功")
  getTableData()
}

const handleError = (uploadFile) => {
  fullscreenLoading.value = false
  console.log(uploadFile)
}

// watch(
//   () => props.isDeldo,
//   (newValue) => {
//     if (newValue) {

//     }
//   }
// )

const isJobInit = ref(0)
const isJob = ref(null)
const getMonitorJob = async () => {
  await monitorJobApi({}).then(({ data }) => {
    if (data.job && isJobInit.value > 0) {
      clearInterval(intervalId)
      isJobDialg.value = false
      ElMessage.success("同步成功")
    }
    isJob.value = data.job
  })
}

// 同步
const isJobDialg = ref(false)
const deldoSynchronization = async () => {
  isJobInit.value = 0
  await getMonitorJob()

  if (!isJob.value) {
    ElMessage.warning("已有隊列進程正在處理中，請稍後再試...")
  } else {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    axios.post(`${baseUrl}/client/deldoSynchronization`).catch(() => {})

    startInterval()
    isJobDialg.value = true
  }
}

// 定時器
let intervalId
const startInterval = () => {
  intervalId = setInterval(() => {
    isJobInit.value++
    getMonitorJob()
  }, 5000)
}

const handleCloseJob = (done) => {
  ElMessageBox.confirm("將無法得知數據同步狀態，是否關閉")
    .then(() => {
      ElMessage.warning("窗口已關閉，無法查看數據同步狀態")
      clearInterval(intervalId)
      done()
    })
    .catch(() => {})
}

// 销毁 清除定时器
onUnmounted(() => {
  clearInterval(intervalId)
})

const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>`
</script>

<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <div v-loading="loading">
      <div class="m-b">
        <div class="flex justify-between">
          <el-text size="large" tag="b">產品信息</el-text>
          <div>
            <el-tooltip :disabled="!defaultContact" content="請確定默認聯繫人先" placement="top-start">
              <el-button
                v-permission="['editAllClientProductPrice']"
                type="primary"
                @click="dialogVisible2 = true"
                :disabled="defaultContact"
                >批量調整價格</el-button
              >
            </el-tooltip>
            <el-tooltip :disabled="!defaultContact" content="請確定默認聯繫人先" placement="top-start">
              <el-button
                v-permission="['addClientProduct']"
                type="primary"
                @click="handleUpdate(0)"
                :disabled="defaultContact"
                >新增產品</el-button
              >
            </el-tooltip>
          </div>
        </div>
        <div class="mt2 flex justify-between">
          <div>
            <el-input v-model="keyword" placeholder="請輸入產品名稱" style="width: 280px; margin-right: 10px" />
            <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </div>
          <div class="flex">
            <el-button class="mr3" v-if="isDeldo" type="success" @click="deldoSynchronization">同步</el-button>
            <el-upload
              ref="uploadRef"
              :headers="headersObj"
              :data="{ client_id: route.query.id }"
              :action="`${baseUrl}/client/importClientProduct`"
              :limit="1"
              :auto-upload="true"
              :show-file-list="false"
              accept=".xlsx, .xls"
              :on-error="handleError"
              :on-success="handleSuccess"
              :on-progress="handleProgress"
            >
              <template #trigger>
                <el-button v-permission="['importClientProduct']" type="success">上傳產品</el-button>
              </template>
            </el-upload>
            <el-button class="ml3" v-permission="['exportClientProduct']" type="success" @click="exportClientProduct"
              >下載產品</el-button
            >
          </div>
        </div>
      </div>
      <div class="m-b">
        <el-table ref="tableRef" :data="tableData">
          <el-table-column prop="name" label="產品名稱" align="center" />
          <el-table-column prop="price" label="價格" align="center">
            <template #default="scope">
              <el-text :type="scope.row.price === '0.00' ? 'warning' : ''">{{ scope.row.price }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="cost_price" label="成本價" align="center">
            <template #default="scope">
              <el-text>{{ checkPermission(["showCost"]) ? scope.row.cost_price : "---" }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="profit" label="毛利" align="center">
            <template #default="scope">
              <el-text>{{ checkPermission(["showCost"]) ? scope.row.profit : "---" }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="brand_name" label="品牌" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button
                v-permission="['addClientProduct']"
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row.id)"
                >編輯</el-button
              >
              <el-button
                v-permission="['deleteClientProduct']"
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
      <!-- 產品調整 -->
      <el-dialog v-model="dialogVisible" title="產品調整" @close="handleClose">
        <el-form ref="productFormRef" :model="productForm" label-position="left" label-width="100px">
          <el-form-item label="產品名稱">
            <el-select
              v-model="productForm.product_id"
              filterable
              remote
              remote-show-suffix
              :remote-method="remoteMethod"
              :loading="loading2"
              @change="changeProduct($event)"
            >
              <el-option v-for="item in productOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item prop="price" label="價格">
            <el-input v-model="productForm.price" placeholder="請輸入價格" type="number" />
          </el-form-item>
          <el-form-item label="品牌">
            <el-text class="mx-1" size="large">{{ productForm.brand_name }}</el-text>
          </el-form-item>
        </el-form>
        <template #footer>
          <ElButton type="primary" @click="submitProductForm"> 保存 </ElButton>
          <ElButton @click="dialogVisible = false">關閉</ElButton>
        </template>
      </el-dialog>
      <!-- 調整價格 -->
      <el-dialog v-model="dialogVisible2" title="批量調整價格">
        <update-price ref="childRef" />
        <template #footer>
          <ElButton type="primary" @click="submitProductSum"> 保存 </ElButton>
          <ElButton @click="dialogVisible2 = false">關閉</ElButton>
        </template>
      </el-dialog>

      <!-- 同步數據 -->
      <el-dialog v-model="isJobDialg" title="數據同步中" width="500" align-center :before-close="handleCloseJob">
        <div
          v-loading="isJobDialg"
          :element-loading-svg="svg"
          element-loading-svg-view-box="-10, -10, 50, 50"
          class="py-10"
        />
        <p class="c-red">請勿關閉當前窗口，否則無法查看同步狀態</p>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped></style>

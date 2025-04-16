<script setup>
import { ref, watch, reactive } from "vue"
import { Search, Refresh } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { useRoute } from "vue-router"
import {
  getFactoryProductListApi,
  deleteFactoryProductApi,
  getFactoryProductShowApi,
  updateFactoryAddProductApi,
  updateAllFactoryProductApi
} from "@/api/users"
import { getProductListApi, getProductShowApi } from "@/api/product"
import { usePagination } from "@/hooks/usePagination"
import { useDeleteList } from "@/hooks/useDeleteList"
import updatePrice from "@/views/componrnts/updatePrice/updatePrice.vue"
import { exportFactoryProductApi } from "@/api/selects"
import { getToken } from "@/utils/cache/cookies"

const loading = ref(false)

const route = useRoute()

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

const props = defineProps({
  isProduct: Number
})
// const props = defineProps(["userId"])

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteFactoryProductApi,
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
  getFactoryProductListApi({
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

// 員工列表
const loading2 = ref(false)
const productOptions = ref([])
const remoteMethod = (query) => {
  loading2.value = true
  getProductListApi({
    page_size: 20,
    name: query || undefined
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

// 產品編輯
const infoData = reactive({})
const loading3 = ref(false)

// 增 / 改
const dialogVisible = ref(false)
const handleUpdate = (row) => {
  dialogVisible.value = true
  if (row) {
    // 改
    loading3.value = true
    getFactoryProductShowApi({
      id: row
    }).then(({ data }) => {
      loading3.value = false
      productForm.price = data.price
      productForm.id = data.id
      // 默認選中
      productOptions.value.push({
        id: data.product_id,
        name: data.name
      })
      productForm.product_id = data.product_id

      Object.assign(infoData, data)
    })
  } else {
    Object.keys(infoData).forEach((key) => {
      delete infoData[key]
    })
    productForm.price = ""
    productForm.product_id = ""
    productForm.id = undefined
  }
}

// 選擇後-產品詳情
const selectProduct = () => {
  loading3.value = true
  getProductShowApi({
    id: productForm.product_id
  }).then(({ data }) => {
    loading3.value = false
    Object.assign(infoData, data.info)
  })
}

// 提交產品
const productFormRef = ref()
const productForm = reactive({
  product_id: "",
  price: "",
  factory_id: route.query.id
})

const rules = reactive({
  product_id: [{ required: true, message: "請選擇產品", trigger: "change" }],
  price: [{ required: true, message: "請輸入價格", trigger: "blur" }]
})

const submitProduct = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      updateFactoryAddProductApi(productForm).then(() => {
        ElMessage.success("操作成功")
        dialogVisible.value = false
        getTableData()
      })
    } else {
      console.log("error submit!", fields)
    }
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
  childData.factory_id = route.query.id
  updateAllFactoryProductApi(childData).then(() => {
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
const exportFactoryProduct = () => {
  loading.value = true
  exportFactoryProductApi({
    factory_id: route.query.id
  })
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

const fullscreenLoading = ref(false)
const handleProgress = () => {
  fullscreenLoading.value = true
}

const uploadRef = ref()
const handleSuccess = (uploadFile) => {
  fullscreenLoading.value = false
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
  fullscreenLoading.value = false
  console.log(uploadFile)
}
</script>

<template>
  <div v-loading.fullscreen.lock="fullscreenLoading">
    <div v-loading="loading">
      <div class="m-b">
        <div class="flex justify-between">
          <el-text tag="b" size="large">產品信息</el-text>
          <div>
            <el-tooltip :disabled="!defaultContact" content="請確定默認聯繫人先" placement="top-start">
              <el-button
                v-permission="['editAllFactoryProductPrice']"
                type="primary"
                @click="dialogVisible2 = true"
                :disabled="defaultContact"
                >批量調整價格</el-button
              >
            </el-tooltip>
            <el-tooltip :disabled="!defaultContact" content="請確定默認聯繫人先" placement="top-start">
              <el-button
                v-permission="['addFactoryProduct']"
                type="primary"
                @click="handleUpdate(0)"
                :disabled="defaultContact"
                >新增產品</el-button
              >
            </el-tooltip>
          </div>
        </div>
        <div class="m-t2 flex justify-between">
          <div>
            <el-input v-model="keyword" placeholder="請輸入產品名稱" style="width: 300px; margin-right: 10px" />
            <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </div>
          <div class="flex">
            <el-upload
              ref="uploadRef"
              :headers="headersObj"
              :data="{ factory_id: route.query.id }"
              :action="`${baseUrl}/factory/importFactoryProduct`"
              :limit="1"
              :auto-upload="true"
              :show-file-list="false"
              accept=".xlsx, .xls"
              :on-error="handleError"
              :on-success="handleSuccess"
              :on-progress="handleProgress"
            >
              <template #trigger>
                <el-button v-permission="['importFactoryProduct']" type="success">上傳產品</el-button>
              </template>
            </el-upload>
            <el-button class="ml3" v-permission="['exportFactoryProduct']" type="success" @click="exportFactoryProduct"
              >下載產品</el-button
            >
          </div>
        </div>
      </div>
      <div class="m-b">
        <el-table ref="tableRef" :data="tableData">
          <el-table-column prop="name" label="產品名稱" align="center" />
          <el-table-column prop="customs_code" label="海關編碼" align="center" />
          <el-table-column prop="price" label="價格" align="center">
            <template #default="scope">
              <el-text :type="scope.row.price === '0.00' ? 'warning' : ''">{{ scope.row.price }}</el-text>
            </template>
          </el-table-column>
          <el-table-column prop="piece_weight" label="單重" align="center" />
          <el-table-column prop="type" label="類型" align="center" />
          <el-table-column prop="brand_name" label="品牌" align="center" />
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template #default="scope">
              <el-button
                v-permission="['addFactoryProduct']"
                type="primary"
                text
                bg
                size="small"
                @click="handleUpdate(scope.row.id)"
                >編輯</el-button
              >
              <el-button
                v-permission="['deleteFactoryProduct']"
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
      <el-dialog v-model="dialogVisible" title="產品信息" width="60%" destroy-on-close>
        <el-form ref="productFormRef" :model="productForm" :rules="rules">
          <el-row>
            <el-col :span="11">
              <el-form-item label="產品名稱" prop="product_id">
                <el-select
                  v-model="productForm.product_id"
                  filterable
                  remote
                  remote-show-suffix
                  :remote-method="remoteMethod"
                  :loading="loading2"
                  @change="selectProduct"
                >
                  <el-option v-for="item in productOptions" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="2" />
            <el-col :span="11">
              <el-form-item prop="price" label="價格">
                <el-input v-model="productForm.price" placeholder="請輸入價格" type="number" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div v-loading="loading3">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="產品代碼(ART)" min-width="100px">
              {{ infoData.art || "---" }}
            </el-descriptions-item>
            <el-descriptions-item label="品牌" min-width="100px">
              {{ infoData.brand_code || "---" }}
            </el-descriptions-item>
            <el-descriptions-item label="條碼EAN" min-width="100px">{{ infoData.ean || "---" }}</el-descriptions-item>
            <el-descriptions-item label="40'HQ裝箱量">{{ infoData.quantity || "---" }}</el-descriptions-item>
            <el-descriptions-item label="輪胎類型">{{ infoData.tyre_type || "---" }}</el-descriptions-item>
            <el-descriptions-item label="海關條碼">{{ infoData.customs_code || "---" }}</el-descriptions-item>
            <el-descriptions-item label="歐標等級">
              {{ infoData.european_standard_level || "---" }}
            </el-descriptions-item>
            <el-descriptions-item label="單重">{{ infoData.piece_weight || "---" }}</el-descriptions-item>
            <el-descriptions-item label="是否歐標EU OR空白">
              {{ infoData.european_standard || "---" }}
            </el-descriptions-item>
            <el-descriptions-item label="類型">{{ infoData.type || "---" }}</el-descriptions-item>
            <el-descriptions-item label="花紋">{{ infoData.decorative_design || "---" }}</el-descriptions-item>
            <el-descriptions-item label="寸口">{{ infoData.spout || "---" }}</el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <ElButton type="primary" @click="submitProduct(productFormRef)"> 保存 </ElButton>
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
    </div>
  </div>
</template>

<style scoped></style>

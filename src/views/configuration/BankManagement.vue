<script setup>
import { ref, reactive, onMounted, watch } from "vue"
import { getBankConfigListApi, addBankConfigApi, deleteBankConfigApi } from "@/api/selects"
import { useDeleteList } from "@/hooks/useDeleteList"
import { ElMessage } from "element-plus"
import { Search, Refresh } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"

defineOptions({
  name: "BankManagement"
})

const loading = ref(false)

// 分页
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 查
const tableRef = ref()
const tableData = ref([])
const searchData = reactive({
  keyword: ""
})

const getTableData = () => {
  loading.value = true
  getBankConfigListApi({
    keyword: searchData.keyword,
    page: paginationData.currentPage,
    page_size: paginationData.pageSize
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

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

onMounted(() => {
  getTableData()
})

// 重置
const resetSearch = () => {
  searchData.keyword = ""
  handleSearch()
}

/** 新增，編輯 */
const dialogVisible = ref(false)

const formRef = ref()
const formDataTitle = ref("")
const formData = reactive({
  name: ""
})

/** 彈框 */
const handleUpdate = (row) => {
  dialogVisible.value = true
  if (row) {
    Object.assign(formData, row)
    formDataTitle.value = "修改"
  } else {
    Object.keys(formData).forEach((key) => {
      formData[key] = undefined
    })
    formDataTitle.value = "新增"
  }
}

const rules = reactive({
  name: [{ required: true, message: "請輸入銀行名稱", trigger: "blur" }]
})

const submitForm = (formRef) => {
  if (!formRef) return
  formRef.validate((valid) => {
    if (valid) {
      addBankConfigApi(formData).then(() => {
        dialogVisible.value = false
        ElMessage.success("添加成功")
        getTableData()
      })
    } else {
      return false
    }
  })
}

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteBankConfigApi,
  text: "銀行？"
})

// 删除/修改 成功
watch([isDeleted], () => {
  getTableData()
})
//#endregion
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-input v-model="searchData.keyword" placeholder="輸入銀行名稱" style="width: 300px; margin-right: 15px" />
      <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
      <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="pb5">
        <div class="flex justify-between mb5">
          <el-text tag="b" size="large">銀行管理</el-text>
          <div>
            <el-button type="primary" @click="handleUpdate(0)">添加</el-button>
          </div>
        </div>
        <el-table border ref="tableRef" :data="tableData">
          <el-table-column prop="name" label="名稱" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">編輯</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row.id)">删除</el-button>
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
          hide-on-single-page
        />
      </div>
    </el-card>

    <!-- 新增/修改 -->
    <el-dialog v-model="dialogVisible" :title="formDataTitle" width="30%" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" hide-required-asterisk>
        <el-form-item label="銀行名稱" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(formRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

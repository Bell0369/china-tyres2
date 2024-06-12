<script setup>
import { ref, reactive, onMounted } from "vue"
import { getFactoryListApi, addFactoryListApi, deleteFactoryCodeApi } from "@/api/selects"
import { ElMessage, ElMessageBox } from "element-plus"

defineOptions({
  name: "Foreman"
})

const loading = ref(false)

// 查
const tableRef = ref()
const tableData = ref([])

const getTableData = () => {
  loading.value = true
  getFactoryListApi({})
    .then(({ data }) => {
      tableData.value = data
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getTableData()
})

//#region 删
const handleDelete = (row) => {
  ElMessageBox.confirm(`確認刪除該產品？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      deleteFactoryCodeApi({
        code: row.code
      }).then(() => {
        ElMessage.success("刪除成功")
        getTableData()
      })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消"
      })
    })
}
//#endregion

/** 新增，編輯 */
const dialogVisible = ref(false)

const formRef = ref()
const formDataTitle = ref("")
const formData = reactive({
  name: "",
  code: ""
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
  name: [{ required: true, message: "請輸入工廠名稱", trigger: "blur" }],
  code: [{ required: true, message: "請輸入工廠代碼", trigger: "blur" }]
})

const submitForm = (formRef) => {
  if (!formRef) return
  formRef.validate((valid) => {
    if (valid) {
      addFactoryListApi(formData).then(() => {
        ElMessage.success("添加成功")
        dialogVisible.value = false
        getTableData()
      })
    } else {
      return false
    }
  })
}
</script>
<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="mb8">
      <div class="pb5">
        <div class="flex justify-between mb5">
          <el-text tag="b" size="large">工廠代碼</el-text>
          <div>
            <el-button type="primary" @click="handleUpdate(0)">添加</el-button>
          </div>
        </div>
        <el-table border ref="tableRef" :data="tableData">
          <el-table-column prop="name" label="名稱" />
          <el-table-column prop="code" label="代碼" />
          <el-table-column prop="id" label="操作">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">編輯</el-button>
              <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    <!-- 新增/修改 -->
    <el-dialog v-model="dialogVisible" :title="formDataTitle" width="30%" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules">
        <el-form-item label="名稱" prop="name">
          <el-input v-model="formData.name" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="代碼" prop="code">
          <el-input v-model="formData.code" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(formRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

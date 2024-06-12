<script setup>
import { ref, reactive, onMounted } from "vue"
import { getBrandListApi, addBrandListApi } from "@/api/selects"
import { ElMessage } from "element-plus"

defineOptions({
  name: "Brand"
})

const loading = ref(false)

// 查
const tableRef = ref()
const tableData = ref([])

const getTableData = () => {
  loading.value = true
  getBrandListApi({})
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
/*
const handleDelete = (row) => {
  ElMessageBox.confirm(`確認刪除該品牌？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      console.log(row.id)
      // deleteFactoryApi(row.id).then(() => {
      //   ElMessage.success("刪除成功")
      // })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消"
      })
    })
}
*/
//#endregion

/** 新增，編輯 */
const dialogVisible = ref(false)

const formRef = ref()
const formDataTitle = ref("")
const formData = reactive({
  name: "",
  short: ""
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
  name: [{ required: true, message: "請輸入品牌名稱", trigger: "blur" }],
  short: [{ required: true, message: "請輸入名稱簡寫", trigger: "blur" }]
})

const submitForm = (formRef) => {
  if (!formRef) return
  formRef.validate((valid) => {
    if (valid) {
      addBrandListApi(formData).then(() => {
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
          <el-text tag="b" size="large">品牌</el-text>
          <div>
            <el-button type="primary" @click="handleUpdate(0)">添加</el-button>
          </div>
        </div>
        <el-table border ref="tableRef" :data="tableData">
          <el-table-column prop="name" label="名稱" />
          <el-table-column prop="short" label="簡寫" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">編輯</el-button>
              <!-- <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button> -->
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
        <el-form-item label="簡寫" prop="short">
          <el-input v-model="formData.short" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm(formRef)">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, defineEmits } from "vue"
import { ElMessage } from "element-plus"
import { getAddPayRecordApi, AddPriceApi } from "@/api/order"
import { validateNumberMin } from "@/utils/validate"

const { isType, row } = defineProps(["isType", "row"])
console.log(isType, row.id)
const itemId = row.id
const emit = defineEmits(["handleEditPayment"])

const loading = ref(false)

const prepayFormRef = ref()
// 初始化
const prepayForm = reactive({
  id: itemId,
  type: isType,
  price: "",
  bank_statement_number: ""
})

const rules = reactive({
  price: [{ required: true, message: "請輸入金额", trigger: "blur" }],
  bank_statement_number: [{ required: true, message: "請輸入流水單號", trigger: "blur" }]
})

// 添加记录
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      AddPriceApi(prepayForm).then(() => {
        ElMessage.success("操作成功")
        prepayFormRef.value.resetFields()
        emit("handleListPayment")
        getTableData()
      })
    } else {
      console.log("error submit!", fields)
    }
  })
}

// 列表
onMounted(() => {
  getTableData()
})

const tableData = ref([])
const getTableData = () => {
  loading.value = true
  getAddPayRecordApi({
    id: itemId,
    type: isType
  })
    .then(({ data }) => {
      tableData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}
</script>

<template>
  <div>
    <el-form ref="prepayFormRef" :model="prepayForm" :rules="rules" v-show="row.status === 0">
      <el-row>
        <el-col :span="11">
          <el-form-item prop="price" label="添加金額">
            <el-input
              v-model="prepayForm.price"
              placeholder="請輸入金額"
              type="number"
              @input="prepayForm.price = validateNumberMin(prepayForm.price)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="1" />
        <el-col :span="11">
          <el-form-item prop="bank_statement_number" label="銀行水單">
            <el-input v-model="prepayForm.bank_statement_number" placeholder="請輸入流水單號" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <div class="my">
        <div v-loading="loading">
          <el-table :data="tableData" height="300">
            <el-table-column prop="price" label="金額" align="center" />
            <el-table-column prop="bank_statement_number" label="銀行水單" align="center" />
            <el-table-column prop="created_at" label="添加時間" align="center" />
          </el-table>
        </div>
      </div>
      <div class="flex flex-row-reverse" v-show="row.status === 0">
        <div>
          <ElButton type="primary" @click="submitForm(prepayFormRef)"> 保存 </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

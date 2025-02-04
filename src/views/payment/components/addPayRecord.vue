<script setup>
import { reactive, ref, onMounted, defineEmits } from "vue"
import { ElMessage } from "element-plus"
import { getAddPayRecordApi, AddPriceApi, editClientPayRecord } from "@/api/order"
import { validateNumberMin } from "@/utils/validate"
import { EditPen } from "@element-plus/icons-vue"
import { Dialog } from "@/components/Dialog"
import { useBankSelect } from "@/hooks/useBankSelect"

//工厂
const { loadBank, optionsBank, loadBankData } = useBankSelect()

const { isType, row } = defineProps(["isType", "row"])

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

// 其他費用
const dialogVisible = ref(false)
const ClientPayFormRef = ref(null)
const ClientPayForm = reactive({
  id: 0,
  fee: "",
  reality_price: "",
  remark: "",
  price: ""
})

const ClientPayRules = reactive({
  fee: [{ required: true, message: "請輸入费用金額", trigger: "blur" }]
})

const submitClientPayForm = (formEl) => {
  console.log("111")
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      editClientPayRecord(ClientPayForm).then(() => {
        ElMessage.success("操作成功")
        ClientPayFormRef.value.resetFields()
        dialogVisible.value = false
        getTableData()
      })
    } else {
      console.log("error submit!", fields)
    }
  })
}

// 費用計算
const calculatePrice = () => {
  ClientPayForm.fee = validateNumberMin(ClientPayForm.fee) || 0
  setTimeout(() => {
    const price = parseFloat(ClientPayForm.price) - parseFloat(ClientPayForm.fee)
    ClientPayForm.reality_price = price.toFixed(2)
  }, 500)
}

const showDialog = (row) => {
  dialogVisible.value = true
  ClientPayForm.id = row.id
  ClientPayForm.fee = row.fee
  ClientPayForm.reality_price = row.reality_price
  ClientPayForm.remark = row.remark
  ClientPayForm.price = row.price
}
</script>

<template>
  <div>
    <div class="overflow-hidden">
      <el-form ref="prepayFormRef" :model="prepayForm" :rules="rules" v-show="row.status === 0" hide-required-asterisk>
        <el-row :gutter="10">
          <el-col :span="8">
            <el-form-item prop="price" label="添加金額">
              <el-input
                v-model="prepayForm.price"
                placeholder="請輸入金額"
                type="number"
                @input="prepayForm.price = validateNumberMin(prepayForm.price)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="bank_statement_number" label="銀行水單">
              <el-input v-model="prepayForm.bank_statement_number" placeholder="請輸入流水單號" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item prop="bank_name" label="銀行名稱">
              <el-select
                v-model="prepayForm.bank_name"
                filterable
                remote
                remote-show-suffix
                :remote-method="loadBankData"
                :loading="loadBank"
              >
                <el-option v-for="item in optionsBank" :key="item.id" :label="item.name" :value="item.name" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div>
      <div class="my">
        <div v-loading="loading">
          <el-table :data="tableData" height="300px" v-if="isType === 1">
            <el-table-column prop="price" label="金額" align="center" />
            <el-table-column prop="bank_statement_number" label="銀行水單" align="center" />
            <el-table-column prop="bank_name" label="銀行名稱" align="center" />
            <el-table-column prop="remark" label="備註" align="center" v-permission="['editClientPayRecord']">
              <template #default="scope">
                {{ scope.row.remark || "----" }}
                <EditPen class="w4 h4 cursor-pointer hover:c-blue" @click="showDialog(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column prop="fee" label="费用" align="center" v-permission="['editClientPayRecord']">
              <template #default="scope">
                {{ scope.row.fee }}
                <EditPen class="w4 h4 cursor-pointer hover:c-blue" @click="showDialog(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column label="實時費用" align="center" v-permission="['editClientPayRecord']">
              <template #default="scope">
                {{ scope.row.reality_price }}
                <EditPen class="w4 h4 cursor-pointer hover:c-blue" @click="showDialog(scope.row)" />
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="添加時間" align="center" />
          </el-table>
          <el-table :data="tableData" height="300" v-else>
            <el-table-column prop="price" label="金額" align="center" />
            <el-table-column prop="bank_statement_number" label="銀行水單" align="center" />
            <el-table-column prop="bank_name" label="銀行名稱" align="center" />
            <el-table-column prop="created_at" label="添加時間" align="center" />
          </el-table>
        </div>
      </div>
      <div class="flex flex-row-reverse" v-show="row.status === 0">
        <div>
          <ElButton type="primary" @click="submitForm(prepayFormRef)"> 添加 </ElButton>
        </div>
      </div>
    </div>

    <Dialog v-model="dialogVisible" title="其他費用" width="500px" align-center>
      <el-form
        ref="ClientPayFormRef"
        label-width="100px"
        label-position="left"
        :model="ClientPayForm"
        :rules="ClientPayRules"
        hide-required-asterisk
      >
        <el-form-item prop="fee" label="费用">
          <el-input v-model="ClientPayForm.fee" placeholder="請輸入费用金額" type="number" @input="calculatePrice" />
        </el-form-item>
        <el-form-item label="實時費用">
          <el-input v-model="ClientPayForm.reality_price" disabled />
        </el-form-item>
        <el-form-item prop="remark" label="備註">
          <el-input v-model="ClientPayForm.remark" placeholder="請輸入備註" />
        </el-form-item>
      </el-form>
      <div class="flex flex-row-reverse">
        <div>
          <ElButton type="primary" @click="submitClientPayForm(ClientPayFormRef)"> 保存 </ElButton>
        </div>
      </div>
    </Dialog>
  </div>
</template>

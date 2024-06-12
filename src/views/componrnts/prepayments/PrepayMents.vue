<script setup>
import { reactive, ref, computed, onMounted, defineEmits } from "vue"
import { ElMessage } from "element-plus"
// import { useRoute } from "vue-router"
import {
  addClientAdvancePaymentApi,
  addFactoryAdvancePaymentApi,
  getClientAdvancePaymentListApi,
  getFactoryAdvancePaymentListApi
} from "@/api/users"
import { validateNumberMin } from "@/utils/validate"
import { checkPermission } from "@/utils/permission"

const { isType, id } = defineProps(["isType", "id"])
console.log(isType, id)

const emit = defineEmits(["handleEditPayment"])

// const route = useRoute()

const loading = ref(false)

const prepayFormRef = ref()
// 初始化
const prepayForm = computed(() => {
  const form = reactive({
    price: null,
    invoice: ""
  })
  form[`${isType}_id`] = id
  return form
})

const rules = reactive({
  price: [
    { required: true, message: "請輸入金额", trigger: "blur" },
    { pattern: /^([1-9]\d*|0)(\.\d+)?$/, message: "請輸入有效金额", trigger: "blur" }
  ],
  invoice: [{ required: true, message: "請輸入流水單號", trigger: "blur" }]
})

// 添加记录
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      const api = isType === "factory" ? addFactoryAdvancePaymentApi : addClientAdvancePaymentApi
      api(prepayForm.value).then(() => {
        ElMessage.success("操作成功")
        prepayFormRef.value?.resetFields()
        getTableData()
        emit("handleListPayment", advancePayment.value)
      })
    } else {
      console.log("error submit!", fields)
    }
  })
}

// 列表
onMounted(() => {
  if (isPaymentList.value) getTableData()
})

const types = ref(1)
const tableData = ref([])
const advancePayment = ref(0)
const getTableData = () => {
  loading.value = true
  const api = isType === "factory" ? getFactoryAdvancePaymentListApi : getClientAdvancePaymentListApi
  api({
    id: id,
    type: types.value
  })
    .then(({ data }) => {
      tableData.value = data.list
      advancePayment.value = data.advance_payment
      emit("handleEditPayment", advancePayment.value)
    })
    .finally(() => {
      loading.value = false
    })
}

const invoiceName = computed(() => {
  const name = isType === "factory" ? "採購發票號" : "銷售發票號"
  return name
})

const isAddPayment = computed(() => {
  return isType === "factory" ? checkPermission(["factoryAdvancePayment"]) : checkPermission(["clientAdvancePayment-1"])
})

const isPaymentList = computed(() => {
  return isType === "factory"
    ? checkPermission(["factoryAdvancePaymentList"])
    : checkPermission(["clientAdvancePaymentList"])
})
</script>

<template>
  <div>
    <el-form ref="prepayFormRef" :model="prepayForm" :rules="rules" v-show="isAddPayment">
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
          <el-form-item prop="invoice" label="銀行水單">
            <el-input v-model="prepayForm.invoice" placeholder="請輸入流水單號" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <div class="mb" v-show="isPaymentList">
        <div>
          <el-radio-group v-model="types" @change="getTableData" fill="#29d">
            <el-radio-button label="添加記錄" :value="1" />
            <el-radio-button label="扣除記錄" :value="2" />
          </el-radio-group>
        </div>
        <div v-loading="loading">
          <el-table :data="tableData" height="300">
            <el-table-column prop="price" :label="types === 1 ? '添加金額' : '扣除金額'" align="center" />
            <el-table-column prop="invoice" :label="types === 1 ? '銀行水單' : invoiceName" align="center" />
            <el-table-column prop="created_at" :label="types === 1 ? '添加時間' : '扣除時間'" sortable align="center" />
          </el-table>
        </div>
      </div>
      <div class="flex justify-between m-t5 items-center">
        <div>
          <el-text>當前預付款: </el-text>
          <el-text type="danger" size="large">{{ advancePayment }}</el-text>
        </div>
        <div>
          <ElButton type="primary" @click="submitForm(prepayFormRef)" v-show="isAddPayment"> 保存 </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

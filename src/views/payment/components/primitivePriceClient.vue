<script setup>
import { reactive, ref, onMounted, defineEmits, watch } from "vue"
import { ElMessage } from "element-plus"
import {
  getClientPrimitivePriceListApi,
  AddClientPrimitivePriceApi,
  AffirmClientReceivableApi,
  deleteClientPrimitivePriceRecordApi
} from "@/api/order"
import { validateNumberMin } from "@/utils/validate"
import { useDeleteList } from "@/hooks/useDeleteList"

const { id, ids } = defineProps(["id", "ids"])
const itemId = id
const emit = defineEmits(["handleEditPayment"])

const loading = ref(false)

const prepayFormRef = ref()
// 初始化
const prepayForm = reactive({
  client_id: itemId,
  client_receipt_id: ids,
  price: "",
  remarks: ""
})

const rules = reactive({
  price: [{ required: true, message: "請輸入金额", trigger: "blur" }],
  remarks: [{ required: true, message: "請輸入備註", trigger: "blur" }]
})

// 添加记录
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      AddClientPrimitivePriceApi(prepayForm).then(() => {
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
  getClientPrimitivePriceListApi({
    client_id: itemId,
    client_receipt_id: ids
  })
    .then(({ data }) => {
      tableData.value = data
    })
    .finally(() => {
      loading.value = false
    })
}

// 財務確認收款
const handleSubmitPrice = (row) => {
  AffirmClientReceivableApi({
    client_id: row.client_id,
    id: row.id,
    other_fee: row.other_fee,
    reality_price: row.reality_price
  }).then(() => {
    ElMessage.success("操作成功")
    prepayFormRef.value.resetFields()
    emit("handleListPayment")
    getTableData()
  })
}

// 刪除記錄
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteClientPrimitivePriceRecordApi,
  text: "記錄?"
})
watch([isDeleted], () => {
  prepayFormRef.value.resetFields()
  emit("handleListPayment")
  getTableData()
})
</script>

<template>
  <div>
    <el-form ref="prepayFormRef" :model="prepayForm" :rules="rules">
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
          <el-form-item prop="remarks" label="備註">
            <el-input v-model="prepayForm.remarks" placeholder="請輸入備註" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div>
      <div class="my">
        <div v-loading="loading">
          <el-table :data="tableData" height="300">
            <el-table-column prop="created_at" label="添加時間" align="center" />
            <el-table-column prop="price" label="金額" align="center" />
            <el-table-column prop="remarks" label="備註" align="center" />
            <el-table-column prop="other_fee" label="其他扣除費用" align="center" v-permission="['affirmReceivable']">
              <template #default="scope">
                <el-input v-if="!scope.row.status" v-model="scope.row.other_fee" type="number" />
                <span v-else class="inline-block align-mid">{{ scope.row.other_fee }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="reality_price" label="實際金額" align="center" v-permission="['affirmReceivable']">
              <template #default="scope">
                <el-input v-if="!scope.row.status" v-model="scope.row.reality_price" type="number" />
                <span v-else class="inline-block align-mid">{{ scope.row.reality_price }}</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="130" align="center">
              <template #default="scope">
                <el-button
                  v-permission="['affirmReceivable']"
                  :disabled="scope.row.status"
                  type="primary"
                  text
                  bg
                  size="small"
                  @click="handleSubmitPrice(scope.row)"
                  >確認</el-button
                >
                <el-button
                  v-if="!scope.row.status"
                  type="danger"
                  text
                  bg
                  size="small"
                  @click="handleDelete(scope.row.id)"
                >
                  刪除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="flex flex-row-reverse">
        <div>
          <ElButton type="primary" @click="submitForm(prepayFormRef)"> 保存 </ElButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import UploadInfo from "./components/UploadInfo.vue"
import { useOrderSelet } from "@/hooks/useOrderSelet"
import { UploadXlsx } from "@/components/UploadXlsx"
import { uploadPiApi } from "@/api/order"
import { redirectTo } from "@/utils/tagsclose"

defineOptions({
  name: "PIOrderUpload"
})

const loading = ref(false)

// 订单
const { loadOrder, optionsOrder, loadOrderData } = useOrderSelet()

// tag
const route = useRoute()
const router = useRouter()

const ruleFormRef = ref()
const ruleForm = reactive({
  file: "",
  date: "",
  order_id: ""
})

const rules = reactive({
  order_id: [{ required: true, message: "請選擇订单", trigger: "change" }],
  date: [{ required: true, message: "請選擇时间", trigger: "change" }]
})

// 上传文件
const setUploadXlsx = (value) => {
  ruleForm.file = value
}

const isSubmit = ref(true)
// 1:  比对文件 2: 提交上傳
const isorderInfo = ref(false)
const infoData = reactive({})
const orderCheck = ref([])

const orderChecks = ref([])
const orderCheck0 = ref([])
const orderCheck1 = ref([])
const submitForm = (Type) => {
  // 重置表格数据
  orderCheck.value = []
  orderChecks.value = []
  orderCheck0.value = []
  orderCheck1.value = []
  errMsgVal.value = 0

  if (ruleForm.file === "") {
    ElMessage.error("請上傳文件先")
    return
  }

  if (!ruleFormRef.value) return
  ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      const formData = new FormData()
      formData.append("file", ruleForm.file)
      formData.append("type", Type)
      formData.append("order_id", ruleForm.order_id)
      formData.append("date", ruleForm.date)
      uploadPiApi(formData)
        .then(({ data }) => {
          if (Type === 1) {
            orderCheck.value = orderChecks.value = data.piList
            data.piList.forEach((item) => {
              if (item.err_msg === "") {
                orderCheck0.value.push(item)
              } else {
                orderCheck1.value.push(item)
              }
            })
            // 无异常，按钮亮起
            if (orderCheck1.value.length === 0) {
              isSubmit.value = false
            } else {
              isSubmit.value = true
            }
            Object.assign(infoData, data.piBasicInfo)
            isorderInfo.value = true
          } else {
            redirectTo(router, route, "/piorder/piorderlist")
          }
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      console.log("error submit!", fields)
    }
  })
}

/** 核對 */
const errMsgVal = ref(0)
const filterTable = () => {
  if (errMsgVal.value === 1) {
    orderCheck.value = orderCheck0.value
  } else if (errMsgVal.value === 2) {
    orderCheck.value = orderCheck1.value
  } else {
    orderCheck.value = orderChecks.value
  }
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">PI信息</el-text>
      </div>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="訂單號" prop="order_id">
              <el-select
                v-model="ruleForm.order_id"
                filterable
                remote
                remote-show-suffix
                :remote-method="loadOrderData"
                :loading="loadOrder"
              >
                <el-option v-for="item in optionsOrder" :key="item.id" :label="item.order_no" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="計劃月份" prop="date">
              <el-date-picker v-model="ruleForm.date" type="month" value-format="YYYYMM" placeholder="请选择月份" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="flex items-center">
        <div class="w-sm">
          <UploadXlsx @setUploadXlsx="setUploadXlsx" />
        </div>
        <div class="ml-10">
          <el-button type="success" @click="submitForm(1)">確認上傳</el-button>
        </div>
      </div>
    </el-card>

    <upload-info :infoData="infoData" v-show="isorderInfo" />

    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">信息核對</el-text>
          <div>
            <!-- <el-text type="danger" style="padding-right: 15px">預付款：----</el-text> -->
            <el-button type="primary" @click="submitForm(2)" :disabled="isSubmit">生成PI</el-button>
          </div>
        </div>
      </div>
      <div class="mb">
        <el-radio-group v-model="errMsgVal" @change="filterTable">
          <el-radio-button label="全部" :value="0" />
          <el-radio-button label="正常" :value="1" />
          <el-radio-button label="異常" :value="2" />
        </el-radio-group>
      </div>
      <el-table v-loading="loading" :data="orderCheck" height="400">
        <el-table-column prop="serial_number" label="序號" width="80" />
        <el-table-column prop="product_name" label="產品名稱" align="center" />
        <el-table-column prop="number" label="數量" align="center" />
        <el-table-column prop="unproduced" label="订单未分配PI数量" align="center" />
        <el-table-column prop="unit_price" label="單價" align="center" />
        <el-table-column prop="total_prices" label="總價" align="center" />
        <el-table-column prop="err_msg" label="備註" align="center">
          <template #default="scope">
            <el-text type="danger">{{ scope.row.err_msg }}</el-text>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped></style>

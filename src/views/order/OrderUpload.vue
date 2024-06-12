<script setup>
import { ref, reactive } from "vue"
import { ElButton, ElMessage } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { useClientSelect } from "@/hooks/useClientSelect"
import { uploadOrderApi } from "@/api/order"
import UploadInfo from "./components/UploadInfo.vue"
import { UploadXlsx } from "@/components/UploadXlsx"
import { redirectTo } from "@/utils/tagsclose"

defineOptions({
  name: "OrderUpload"
})

const loading = ref(false)

// 品牌
const { brandOptions } = useBrandSelect()

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// tag
const route = useRoute()
const router = useRouter()

const ruleFormRef = ref()
const ruleForm = reactive({
  file: "",
  client_id: undefined,
  factory_code: undefined,
  brand_id: undefined
})

const rules = reactive({
  client_id: [{ required: true, message: "請選擇客戶", trigger: "change" }],
  factory_code: [{ required: true, message: "請選擇工廠代碼", trigger: "change" }],
  brand_id: [{ required: true, message: "請選擇品牌", trigger: "change" }]
})

// 上传文件
const setUploadXlsx = (value) => {
  ruleForm.file = value
}

const isSubmit = ref(true)
// 1:  比对文件 2: 提交上傳
const isorderInfo = ref(false)
const orderInfo = reactive({})
const orderCheck = ref([])

const orderChecks = ref([])
const orderCheck0 = ref([])
const orderCheck1 = ref([])
const submitForm = (Type) => {
  if (ruleForm.file === "") {
    ElMessage.error("請上傳文件先")
    return
  }

  // 重置表格数据
  orderCheck.value = []
  orderChecks.value = []
  orderCheck0.value = []
  orderCheck1.value = []
  errMsgVal.value = 0
  // router.replace("/order/orderitem")
  if (!ruleFormRef.value) return
  ruleFormRef.value.validate((valid, fields) => {
    if (valid) {
      loading.value = true
      const formData = new FormData()
      formData.append("file", ruleForm.file)
      formData.append("type", Type)
      formData.append("client_id", ruleForm.client_id)
      formData.append("factory_code", ruleForm.factory_code)
      formData.append("brand_id", ruleForm.brand_id)
      uploadOrderApi(formData)
        .then(({ data }) => {
          if (Type === 1) {
            orderCheck.value = orderChecks.value = data.orderCheck
            data.orderCheck.forEach((item) => {
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
            Object.assign(orderInfo, data.orderInfo)
            isorderInfo.value = true
          } else {
            redirectTo(router, route, "/order/orderlist")
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
        <el-text tag="b" size="large">訂單資料</el-text>
      </div>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item prop="client_id" label="客戶編碼">
              <el-select
                v-model="ruleForm.client_id"
                filterable
                remote
                remote-show-suffix
                :remote-method="loadClientData"
                :loading="loadClient"
              >
                <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item prop="factory_code" label="工廠代碼">
              <el-select v-model="ruleForm.factory_code">
                <el-option v-for="item in factoryCodeOptions" :key="item.id" :label="item.name" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="品牌代碼" prop="brand_id">
              <el-select v-model="ruleForm.brand_id">
                <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
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

    <upload-info :orderInfo="orderInfo" v-show="isorderInfo" />

    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">信息核對</el-text>
          <el-button type="primary" @click="submitForm(2)" :disabled="isSubmit">生成訂單</el-button>
        </div>
      </div>
      <div class="mb">
        <el-radio-group v-model="errMsgVal" @change="filterTable">
          <el-radio-button label="全部" :value="0" />
          <el-radio-button label="正常" :value="1" />
          <el-radio-button label="異常" :value="2" />
        </el-radio-group>
      </div>
      <div v-loading="loading">
        <el-table :data="orderCheck" height="400">
          <el-table-column prop="serial_number" label="序號" width="100px" align="center" />
          <el-table-column prop="product_name" label="產品名稱" align="center" />
          <el-table-column prop="amount" label="數量" align="center" />
          <el-table-column prop="unit_price" label="單價" align="center" />
          <el-table-column prop="sum_price" label="總價" align="center" />
          <el-table-column prop="err_msg" label="備註">
            <template #default="scope">
              <el-text type="danger">{{ scope.row.err_msg }}</el-text>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<style scoped></style>

<script setup>
import { ref, reactive } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { useRoute, useRouter } from "vue-router"
import { useFactorySelect } from "@/hooks/useFactorySelect"
import { uploadPiQuantityPlanApi, deliveryPlanApplyCheckApi } from "@/api/order"
import FileInfo from "./components/FileInfo.vue"
import { UploadXlsx } from "@/components/UploadXlsx"
import { redirectTo } from "@/utils/tagsclose"

defineOptions({
  name: "FileDelivery"
})

const loading = ref(false)

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

// tag
const route = useRoute()
const router = useRouter()

const ruleFormRef = ref()
const ruleForm = reactive({
  file: "",
  pi_id: route.query.id,
  factory_id: undefined
})

const rules = reactive({
  factory_id: [{ required: true, message: "請選擇工廠", trigger: "change" }]
})

// 上传文件
const setUploadXlsx = (value) => {
  ruleForm.file = value
}

const apply_remarks = ref("")
const submitForm = (Type) => {
  if (infoData.is_check_deliver_project) {
    ElMessageBox.prompt("發貨計劃需要審批才能進行，是否繼續？", "發貨計劃", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      inputPlaceholder: "請輸入備註",
      inputType: "textarea",
      inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
      inputErrorMessage: "請輸入備註"
    })
      .then(({ value }) => {
        apply_remarks.value = value
        sendFormData(Type)
      })
      .catch(() => {
        ElMessage.info("已取消")
      })
  } else {
    sendFormData(Type)
  }
}

const isSubmit = ref(true)
// 1:  比对文件 2: 提交上傳
const isorderInfo = ref(false)
const infoData = reactive({})
const orderCheck = ref([])
const orderChecks = ref([])
const orderCheck0 = ref([])
const orderCheck1 = ref([])

const sendFormData = (Type) => {
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
      formData.append("pi_id", ruleForm.pi_id)
      formData.append("factory_id", ruleForm.factory_id)
      uploadPiQuantityPlanApi(formData)
        .then(({ data }) => {
          if (Type === 1) {
            orderCheck.value = orderChecks.value = data.product_list
            data.product_list.forEach((item) => {
              if (item.err_msg === "") {
                orderCheck0.value.push(item)
              } else {
                orderCheck1.value.push(item)
              }
            })
            Object.assign(infoData, data.pi_info)
            loading.value = false
            isorderInfo.value = true
            // 无异常，按钮亮起
            if (orderCheck1.value.length === 0) {
              isSubmit.value = false
            } else {
              isSubmit.value = true
            }
          } else {
            if (infoData.is_check_deliver_project) {
              deliveryPlanApplyCheckApi({
                id: data.delivery_plan_id,
                apply_remarks: apply_remarks.value
              }).then(() => {
                redirectTo(router, route, "/delivery/deliverylist")
              })
            } else {
              redirectTo(router, route, "/delivery/deliverylist")
            }
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
        <el-text tag="b" size="large">選擇文件</el-text>
      </div>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
        <el-row>
          <el-col :span="6">
            <el-form-item prop="factory_id" label="工廠名稱">
              <el-select
                v-model="ruleForm.factory_id"
                filterable
                remote
                remote-show-suffix
                :remote-method="loadFactoryData"
                :loading="loadFactory"
              >
                <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.id" />
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

    <file-info :infoData="infoData" v-show="isorderInfo" />

    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">信息核對</el-text>
          <el-button type="primary" @click="submitForm(2)" :disabled="isSubmit">生成發貨計劃</el-button>
        </div>
      </div>
      <div class="mb">
        <el-radio-group v-model="errMsgVal" @change="filterTable">
          <el-radio-button label="全部" :value="0" />
          <el-radio-button label="正常" :value="1" />
          <el-radio-button label="異常" :value="2" />
        </el-radio-group>
      </div>
      <el-table :data="orderCheck" height="400">
        <el-table-column prop="serial_number" label="序號" align="center" width="80px" />
        <el-table-column prop="product_name" label="產品名稱" align="center" />
        <el-table-column prop="number" label="數量" align="center" />
        <el-table-column prop="unproduced" label="PI未分配发货计划数量" align="center" />
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

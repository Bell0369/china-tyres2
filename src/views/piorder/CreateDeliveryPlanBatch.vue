<script setup>
import { ref, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { UploadXlsx } from "@/components/UploadXlsx"
import { createDeliveryPlanBatchApi } from "@/api/order"
import { getOptionsApi } from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"
import { redirectTo } from "@/utils/tagsclose"

defineOptions({
  name: "CreateDeliveryPlanBatch"
})

const FullLoading = ref(false)

// tag
const route = useRoute()
const router = useRouter()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// tag
const ruleForm = reactive({
  file: "",
  pi_ids: [],
  client_code: ""
})

// 上传文件
const setUploadXlsx = (value) => {
  ruleForm.file = value
}

// 1:  比对文件 2: 提交上傳
const orderCheck = ref([])
const submitForm = (Type) => {
  // 重置表格数据
  orderCheck.value = []

  if (ruleForm.pi_ids.length === 0) {
    ElMessage.error("請選擇客戶和PI號")
    return
  }
  if (ruleForm.file === "") {
    ElMessage.error("請上傳文件先")
    return
  }

  FullLoading.value = true
  const formData = new FormData()
  formData.append("file", ruleForm.file)
  formData.append("type", Type)
  ruleForm.pi_ids.forEach((item, index) => {
    formData.append(`pi_ids[${index}]`, item)
  })
  createDeliveryPlanBatchApi(formData)
    .then(({ data }) => {
      if (Type === 1) {
        orderCheck.value = data
      } else {
        ElMessage.success("生成成功")
        redirectTo(router, route, `"/delivery/deliveryitem?id=${data.delivery_plan_id}"`)
      }
    })
    .finally(() => {
      FullLoading.value = false
    })
}

// 获取PI列表
const piList = ref([])
const getPiList = () => {
  ruleForm.pi_ids = []
  FullLoading.value = true
  getOptionsApi({
    type: 9,
    keyword: ruleForm.client_code
  })
    .then(({ data }) => {
      if (data.length === 0) ElMessage.warning("該客戶沒有PI")
      piList.value = data
    })
    .finally(() => {
      FullLoading.value = false
    })
}
</script>

<template>
  <div class="app-container" v-loading="FullLoading">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">批量生成發貨計劃</el-text>
      </div>
      <div>
        <div>
          <el-text>選擇客戶：</el-text>
          <el-select
            v-model="ruleForm.client_code"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadClientData"
            :loading="loadClient"
            @change="getPiList"
            style="width: 300px"
          >
            <el-option
              v-for="item in optionsClient"
              :key="item.id"
              :label="item.client_code"
              :value="item.client_code"
            />
          </el-select>
        </div>
        <div class="my">
          <el-checkbox-group v-model="ruleForm.pi_ids">
            <el-checkbox v-for="data in piList" :key="data.id" :label="data.pi_no" :value="data.id" />
          </el-checkbox-group>
        </div>
      </div>
      <div class="flex items-center">
        <div class="w-sm">
          <UploadXlsx @setUploadXlsx="setUploadXlsx" />
        </div>
        <div class="ml-10">
          <el-button type="success" @click="submitForm(1)">確認上傳</el-button>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">訂單信息</el-text>
          <div>
            <el-button type="primary" @click="submitForm(2)" :disabled="orderCheck.length === 0">
              生成發貨計劃
            </el-button>
          </div>
        </div>
      </div>
      <el-table :data="orderCheck" border row-class-name="warning-row">
        <el-table-column type="expand">
          <template #default="props">
            <div class="px">
              <el-table :data="props.row.items" :max-height="450" size="small">
                <el-table-column prop="product_name" label="產品名稱" min-width="150" />
                <el-table-column prop="brand_code" label="品牌" min-width="100" />
                <el-table-column prop="factory_name" label="工廠" min-width="60" />
                <el-table-column prop="number" label="數量" width="80" />
                <el-table-column prop="shipped_number" label="已發貨數" width="80" />
                <el-table-column prop="not_shipped_number" label="未發貨數" width="80" />
                <el-table-column prop="allocation_number" label="分配數量" width="80" />
                <el-table-column prop="last_undone_number" label="最終未完成數量" width="100" />
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="PI號" prop="pi_no" />
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

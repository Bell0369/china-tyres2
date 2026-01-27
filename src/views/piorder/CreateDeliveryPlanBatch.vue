<script setup>
import { ref, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import { ElMessage } from "element-plus"
import { UploadXlsx } from "@/components/UploadXlsx"
import { createDeliveryPlanBatchApi, getPiListApi } from "@/api/order"
import { useClientSelect } from "@/hooks/useClientSelect"
import { redirectTo } from "@/utils/tagsclose"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { useFactorySelect } from "@/hooks/useFactorySelect"

defineOptions({
  name: "CreateDeliveryPlanBatch"
})

const FullLoading = ref(false)

// tag
const route = useRoute()
const router = useRouter()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

// tag
const ruleForm = reactive({
  file: "",
  pi_ids: []
})

const searchFormRef = ref()
const searchData = reactive({
  client_code: "",
  brand_code: "",
  factory_id: "",
  status: 0,
  page: 1,
  page_size: 1000
})
const rules = reactive({
  client_code: [{ required: true, message: "請選擇客戶", trigger: "blur" }],
  factory_id: [{ required: true, message: "請選擇工廠", trigger: "blur" }]
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
    ElMessage.error("請先選擇PI號")
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
        redirectTo(router, route, `/delivery/deliveryitem?id=${data.delivery_plan_id}`)
      }
    })
    .finally(() => {
      FullLoading.value = false
    })
}

// 获取PI列表
const piList = ref([])
const getPiList = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      ruleForm.pi_ids = []
      FullLoading.value = true
      getPiListApi(searchData)
        .then(({ data }) => {
          if (data.data.length === 0) ElMessage.warning("該客戶沒有PI")
          piList.value = data.data
        })
        .finally(() => {
          FullLoading.value = false
        })
    } else {
      console.log("error submit!")
    }
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
        <el-form ref="searchFormRef" :inline="true" :model="searchData" :rules="rules">
          <el-form-item prop="client_code" label="客戶">
            <el-select
              v-model="searchData.client_code"
              filterable
              remote
              remote-show-suffix
              :remote-method="loadClientData"
              :loading="loadClient"
              style="width: 150px"
            >
              <el-option
                v-for="item in optionsClient"
                :key="item.id"
                :label="item.client_code"
                :value="item.client_code"
              />
            </el-select>
          </el-form-item>
          <el-form-item prop="factory_id" label="工廠">
            <el-select
              v-model="searchData.factory_id"
              filterable
              remote
              remote-show-suffix
              :remote-method="loadFactoryData"
              :loading="loadFactory"
              style="width: 150px"
            >
              <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item prop="brand_code" label="品牌">
            <el-select v-model="searchData.brand_code" clearable style="width: 150px">
              <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.name" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getPiList(searchFormRef)" plain>獲取PI</el-button>
          </el-form-item>
        </el-form>
        <div class="mb">
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

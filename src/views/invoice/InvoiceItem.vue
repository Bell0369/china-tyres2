<script setup>
import { reactive, ref, onMounted } from "vue"
import { Plus, Delete } from "@element-plus/icons-vue"
import { useRoute } from "vue-router"
import { getinvDetailApi, updateInvApi } from "@/api/order"
import ProductInvoice from "./components/ProductInvoice.vue"
import { ElMessage } from "element-plus"
import { validateNumberMin } from "@/utils/validate"

const route = useRoute()

const loading = ref(false)

const invDate = reactive({})
const tableData = ref([])
const getinvDetail = () => {
  loading.value = true
  getinvDetailApi({
    id: route.query.id
  })
    .then(({ data }) => {
      Object.assign(invDate, data)
      Object.assign(domainsForm, data.inv_extra_fee_json)
      otherFee.other_fee_title = data.other_fee_title
      otherFee.other_fee_price = data.other_fee_price
      tableData.value = data.list
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getinvDetail()
})

// 額外費用
const formRef = ref()
const domainsForm = reactive([
  {
    key: 1,
    title: "",
    price: ""
  }
])

// 其它費用
const otherFee = reactive({
  id: route.query.id,
  other_fee_title: "",
  other_fee_price: ""
})

// 移除
const removeDomain = (item) => {
  const index = domainsForm.indexOf(item)
  if (index !== -1) {
    domainsForm.splice(index, 1)
  }
}

// 追加
const addDomain = () => {
  domainsForm.push({
    key: Date.now(),
    title: "",
    price: ""
  })
}

const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      loading.value = true
      const formData = Object.assign(otherFee, { inv_extra_fee_json: { inv_extra_fee_json: domainsForm } })
      updateInvApi(formData)
        .then((data) => {
          if (data.code === 200) {
            // getinvDetail()
            ElMessage.success("操作成功")
          }
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      console.log("error submit!")
      return false
    }
  })
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <div>
        <div class="m-b">
          <el-text tag="b" size="large">銷售發票基本信息</el-text>
        </div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="訂單號" :span="2">{{ invDate.order_no }}</el-descriptions-item>
          <el-descriptions-item label="PI號" :span="2">
            <el-text
              v-for="item in invDate.pi_no"
              :key="item.id"
              type="primary"
              style="padding-right: 10px; display: inline-block"
            >
              <router-link :to="`/piorder/piorderitem?id=${item.id}`">{{ item.pi_no }}</router-link>
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="發貨計劃號" :span="2">
            <el-text
              v-for="item in invDate.delivery_plan_no"
              :key="item.id"
              type="primary"
              style="padding-right: 10px; display: inline-block"
            >
              <router-link :to="`/delivery/deliveryitem?id=${item.id}`">{{ item.delivery_plan_no }}</router-link>
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="採購發票號" :span="2">
            <el-text v-for="(item, index) in invDate.procurement_invoice_no" :key="item.id">
              {{ index === 0 ? "" : "," }} {{ item }}
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="發票總金額">{{ invDate.product_total_price }}</el-descriptions-item>
          <el-descriptions-item label="客戶編碼">{{ invDate.client_code }}</el-descriptions-item>
          <el-descriptions-item label="工廠名稱">{{ invDate.factory_name }}</el-descriptions-item>
          <el-descriptions-item label="目的港">{{ invDate.destination }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="mt5">
        <div class="m-b">
          <div class="flex justify-between">
            <el-text tag="b" size="large">發票額外費用</el-text>
            <el-button v-permission="['editInv']" type="primary" @click="submitForm(formRef)">保存</el-button>
          </div>
        </div>
        <div>
          <el-form ref="formRef" :model="domainsForm">
            <el-row :gutter="20" v-for="(domain, index) in domainsForm" :key="domain.key">
              <el-col :span="6">
                <el-form-item
                  :label="`${index + 1}費用標題`"
                  :prop="index + '.title'"
                  :rules="{
                    required: true,
                    message: '請輸入費用標題',
                    trigger: 'blur'
                  }"
                >
                  <el-input v-model="domain.title" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  :label="`${index + 1}費用金額`"
                  :prop="index + '.price'"
                  :rules="{
                    required: true,
                    message: '請輸入費用金額',
                    trigger: 'blur'
                  }"
                >
                  <el-input
                    v-model="domain.price"
                    type="number"
                    @input="domain.price = validateNumberMin(domain.price)"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-button @click.prevent="removeDomain(domain)" :icon="Delete">移除</el-button>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" plain @click="addDomain" :icon="Plus">添加</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="mt5">
        <div class="m-b">
          <el-text tag="b" size="large">其它費用</el-text>
        </div>
        <div>
          <el-form>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="費用標題">
                  <el-input v-model="otherFee.other_fee_title" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="費用金額">
                  <el-input
                    v-model="otherFee.other_fee_price"
                    type="number"
                    @input="otherFee.other_fee_price = validateNumberMin(otherFee.other_fee_price)"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
    </el-card>

    <el-card shadow="never" class="search-wrapper">
      <product-invoice :list="tableData" />
    </el-card>
  </div>
</template>

<style scoped></style>

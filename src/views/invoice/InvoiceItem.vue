<script setup>
import { reactive, ref, onMounted } from "vue"
import { Plus, Delete } from "@element-plus/icons-vue"
import { useRoute } from "vue-router"
import { getinvDetailApi, updateInvApi } from "@/api/order"
import ProductInvoice from "./components/ProductInvoice.vue"
import { ElMessage } from "element-plus"
import { isValidNumber } from "@/utils/validate"
import { usePayerListSelect, useFreightForwarderListSelect } from "@/hooks/useSelectOption"

const route = useRoute()

const loading = ref(false)

// 付款方
const payerListOptions = usePayerListSelect()

// 船代
const freightForwarderListOptions = useFreightForwarderListSelect()

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
      Object.assign(otherDomainsForm, data.other_fee)
      Object.assign(inlandFee, data.sell_inv_inland_fee)
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

// 其它費用
const otherFormRef = ref()
const otherDomainsForm = reactive([
  {
    key: 1,
    title: "",
    price: ""
  }
])

// 移除
const removeDomain2 = (item) => {
  const index = otherDomainsForm.indexOf(item)
  if (index !== -1) {
    otherDomainsForm.splice(index, 1)
  }
}

// 追加
const addDomain2 = () => {
  otherDomainsForm.push({
    key: Date.now(),
    title: "",
    price: ""
  })
}

// 內陸費用
const inlandFee = reactive({
  bell_price: "",
  payee: "",
  payer: "",
  payer_time: "",
  cargo_manifest_amount: "",
  freight_forwarder: "",
  freight_rate: "",
  factory_responsibility_price: "",
  factory_responsibility_remarks: "",
  remarks: ""
})

const submitForm = async (formEl, otherFormRef) => {
  if (!formEl || !otherFormRef) return

  inlandFee.id = route.query.id

  try {
    const [valid1, valid2] = await Promise.all([
      new Promise((resolve) => formEl.validate(resolve)),
      new Promise((resolve) => otherFormRef.validate(resolve))
    ])

    if (!valid1) return
    if (!valid2) return

    loading.value = true
    // const newArr = otherDomainsForm.map(({ key, ...rest }) => rest)
    const formData = {
      inv_extra_fee_json: JSON.stringify({ inv_extra_fee_json: domainsForm }),
      other_fee: otherDomainsForm,
      ...inlandFee
    }

    const data = await updateInvApi(formData)

    if (data.code === 200) ElMessage.success("操作成功")
  } catch (error) {
    console.error("提交出错:", error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <div>
        <div class="m-b">
          <div class="flex justify-between">
            <el-text tag="b" size="large">銷售發票基本信息</el-text>
            <!-- status: 0 未收  1  已收 -->
            <el-alert
              :title="invDate.status ? '已收款' : '未收款'"
              :type="invDate.status ? 'success' : 'error'"
              effect="dark"
              :closable="false"
              show-icon
              style="width: auto"
            />
          </div>
        </div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="發票號" :span="2">{{ invDate.inv_no }}</el-descriptions-item>
          <el-descriptions-item label="訂單號" :span="2">{{ invDate.order_no }}</el-descriptions-item>
          <el-descriptions-item label="PI號" :span="4">
            <el-text
              v-for="item in invDate.pi_no"
              :key="item.id"
              type="primary"
              style="padding-right: 10px; display: inline-block"
            >
              <router-link :to="`/piorder/piorderitem?id=${item.id}`">{{ item.pi_no }}</router-link>
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="發貨計劃號" :span="4">
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
          <el-descriptions-item label="目的港" :span="2">{{ invDate.destination }}</el-descriptions-item>
          <el-descriptions-item label="工廠名稱">{{ invDate.factory_name }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="mt5">
        <div class="m-b">
          <div class="flex justify-between">
            <el-text tag="b" size="large">發票額外費用</el-text>
            <el-button v-permission="['editInv']" type="primary" @click="submitForm(formRef, otherFormRef)">
              保存
            </el-button>
          </div>
        </div>
        <div>
          <el-form ref="formRef" :model="domainsForm">
            <el-row :gutter="20" v-for="(domain, index) in domainsForm" :key="domain.key">
              <el-col :span="7">
                <el-form-item
                  :label="`${index + 1} 費用標題`"
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
              <el-col :span="7">
                <el-form-item
                  :label="`${index + 1} 費用金額`"
                  :prop="index + '.price'"
                  :rules="{
                    required: true,
                    message: '請輸入費用金額',
                    trigger: 'blur'
                  }"
                >
                  <el-input v-model="domain.price" type="number" @input="isValidNumber(domain.price)" />
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
          <el-form ref="otherFormRef" :model="otherDomainsForm">
            <el-row :gutter="20" v-for="(domain, index) in otherDomainsForm" :key="domain.key">
              <el-col :span="7">
                <el-form-item
                  :label="`${index + 1} 費用標題`"
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
              <el-col :span="7">
                <el-form-item
                  :label="`${index + 1} 費用金額`"
                  :prop="index + '.price'"
                  :rules="{
                    required: true,
                    message: '請輸入費用金額',
                    trigger: 'blur'
                  }"
                >
                  <el-input v-model="domain.price" type="number" @input="isValidNumber(domain.price)" />
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-button @click.prevent="removeDomain2(domain)" :icon="Delete">移除</el-button>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" plain @click="addDomain2" :icon="Plus">添加</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="mt5">
        <div class="m-b">
          <el-text tag="b" size="large">內陸費用</el-text>
        </div>
        <div>
          <el-form>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="賬單金額">
                  <el-input v-model="inlandFee.bell_price" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="收款方">
                  <el-input v-model="inlandFee.payee" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="付款方">
                  <el-select v-model="inlandFee.payer" style="width: 100%">
                    <el-option v-for="item in payerListOptions" :key="item.id" :label="item.name" :value="item.name" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="付款時間">
                  <el-date-picker
                    v-model="inlandFee.payer_time"
                    type="date"
                    style="width: 100%"
                    value-format="YYYY-MM-DD"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="運費">
                  <el-input type="number" v-model="inlandFee.freight_rate" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="舱单金额">
                  <el-input type="number" v-model="inlandFee.cargo_manifest_amount" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="船代">
                  <el-select v-model="inlandFee.freight_forwarder" style="width: 100%">
                    <el-option
                      v-for="item in freightForwarderListOptions"
                      :key="item.id"
                      :label="item.name"
                      :value="item.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="備注">
                  <el-input v-model="inlandFee.remarks" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工廠責任額外支付金額">
                  <el-input type="number" v-model="inlandFee.factory_responsibility_price" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="工廠責任額外支付原因">
                  <el-input v-model="inlandFee.factory_responsibility_remarks" />
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

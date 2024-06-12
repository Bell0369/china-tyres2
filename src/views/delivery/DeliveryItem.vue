<script setup>
import { ref, onMounted, reactive, watch } from "vue"
import { useRoute } from "vue-router"
import { ElMessage } from "element-plus"
import { getDeliveryPlanDetailsApi, getDeliveryPlanCheckApi, deliveryPlanApplyCheckApi } from "@/api/order"
import ProductDelivery from "./components/ProductDelivery.vue"
import { checkPermission } from "@/utils/permission"

defineOptions({
  name: "DeliveryItem"
})

const route = useRoute()

const loading = ref(false)

const showContent = ref(false)

// 基本信息
const orderInfo1 = reactive({})
const orderInfo2 = reactive({})
const orderInfo3 = reactive({})
const orderInfo4 = reactive({})
const getOrderDetail = () => {
  loading.value = true
  getDeliveryPlanDetailsApi({
    id: route.query.id
  }).then(({ data }) => {
    loading.value = false
    Object.assign(orderInfo1, data.deliveryPlanBasicData)
    Object.assign(orderInfo2, data.piNumberData)
    Object.assign(orderInfo3, data.deliveryPlanNumberData)
    Object.assign(orderInfo4, data.checkData)
    check_remarks.value = ""
    showContent.value = orderInfo4.is_check === 2 ? false : true
  })
}

onMounted(() => {
  getOrderDetail()
})

// 備註
const orderType = ref(0)
const check_remarks = ref("")

// 審批審核
const submitReview = (type) => {
  getDeliveryPlanCheckApi({
    id: route.query.id,
    check_remarks: check_remarks.value,
    is_check: type
  }).then(() => {
    getOrderDetail()
  })
}

// 申請審核
const submitApply = () => {
  if (check_remarks.value === "") {
    ElMessage.error("請填寫備註")
    return
  }
  deliveryPlanApplyCheckApi({
    id: route.query.id,
    apply_remarks: check_remarks.value
  }).then(() => {
    getOrderDetail()
  })
}

// 页面跳转
watch(
  () => route.query,
  () => {
    showContent.value = false
    getOrderDetail()
  }
)
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <div>
        <div class="m-b">
          <div class="flex justify-between">
            <el-text tag="b" size="large">發貨計劃基本信息</el-text>
            <!-- is_shipped:  0=未发货；1=已发货 -->
            <!-- is_check: 0=待审核；1=已拒绝；2=已通过 -->
            <el-alert
              v-if="orderInfo4.is_check !== 2"
              title="待审批"
              type="error"
              effect="dark"
              :closable="false"
              show-icon
              style="width: auto"
            />
            <div v-else>
              <el-alert
                v-if="orderInfo4.is_shipped === 0"
                title="未发货"
                type="warning"
                effect="dark"
                :closable="false"
                show-icon
                style="width: auto"
              />
              <el-alert
                v-else
                title="已發貨"
                type="success"
                effect="dark"
                :closable="false"
                show-icon
                style="width: auto"
              />
            </div>
          </div>
        </div>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="訂單號">
            <el-text type="primary">
              <router-link :to="`/order/orderitem?id=${orderInfo1.order_id}`">{{ orderInfo1.order_no }}</router-link>
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="PI號">
            <el-text type="primary">
              <router-link :to="`/piorder/piorderitem?id=${orderInfo1.pi_id}`">{{ orderInfo1.pi_no }}</router-link>
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="發貨計劃號">{{ orderInfo1.delivery_plan_no }}</el-descriptions-item>
          <el-descriptions-item label="關聯發貨計劃">
            <el-text
              v-for="item in orderInfo1.join_delivery_plan_no"
              :key="item.id"
              type="primary"
              style="padding-right: 10px; display: inline-block"
            >
              <router-link :to="`/delivery/deliveryitem?id=${item.id}`">{{ item.delivery_plan_no }}</router-link>
            </el-text>
          </el-descriptions-item>
          <el-descriptions-item label="客戶編碼">{{ orderInfo1.client_code }}</el-descriptions-item>
          <el-descriptions-item label="採購發票號">
            {{ orderInfo1.procurement_invoice_no || "---" }}
          </el-descriptions-item>
          <el-descriptions-item label="工廠名稱">{{ orderInfo1.factory_name }}</el-descriptions-item>
          <el-descriptions-item label="目的港">{{ orderInfo1.destination }}</el-descriptions-item>
          <el-descriptions-item label="ETD時間">{{ orderInfo1.etd_date || "---" }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="mt5">
        <div class="m-b">
          <el-text tag="b" size="large">PI數量</el-text>
        </div>
        <el-descriptions :column="3" border direction="vertical">
          <el-descriptions-item label="數量" width="33.33%">{{ orderInfo2.number }}</el-descriptions-item>
          <el-descriptions-item label="已發貨數" width="33.33%">{{ orderInfo2.shipped }}</el-descriptions-item>
          <el-descriptions-item label="未發貨數" width="33.33%">{{ orderInfo2.not_shipped }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="mt5">
        <div class="m-b">
          <el-text tag="b" size="large">發貨計劃數量</el-text>
        </div>
        <el-descriptions :column="4" border direction="vertical">
          <el-descriptions-item label="數量" width="33%.33">{{ orderInfo3.number }}</el-descriptions-item>
          <el-descriptions-item label="已發貨數" width="33.33%">{{ orderInfo3.shipped }}</el-descriptions-item>
          <el-descriptions-item label="最終未發貨數" width="33.33%" v-if="orderInfo4.is_shipped === 1">
            {{ orderInfo3.last_not_shipped }}
          </el-descriptions-item>
          <el-descriptions-item label="未發貨數" width="33.33%" v-else>
            {{ orderInfo3.not_shipped }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="mt5" v-if="showContent">
        <!-- is_check: 0=待审核；1=已拒绝；2=已通过 -->
        <div class="m-b flex items-center">
          <el-text tag="b" size="large">審批</el-text>
          <el-radio-group v-model="orderType" fill="#29d" @change="check_remarks = ''" class="ml">
            <el-radio-button label="申請人" :value="0" />
            <el-radio-button label="審核員" :value="1" :disabled="!checkPermission(['deliveryPlanCheck'])" />
          </el-radio-group>
        </div>
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              備註：
              <el-text type="danger">
                {{ orderType ? orderInfo4.apply_remarks : orderInfo4.check_remarks || "---" }}
              </el-text>
            </div>
          </template>
          <el-input v-model="check_remarks" :rows="4" type="textarea" placeholder="請輸入備註" />
          <div class="mt" v-show="orderType === 0">
            <el-button type="primary" @click="submitApply">提交</el-button>
          </div>
          <div class="mt" v-show="orderType === 1" v-if="checkPermission(['deliveryPlanCheck'])">
            <el-button type="danger" @click="submitReview(1)">拒絕</el-button>
            <el-button type="primary" @click="submitReview(2)">通過</el-button>
          </div>
        </el-card>
      </div>
    </el-card>

    <el-card shadow="never" class="search-wrapper">
      <product-delivery :userId="route.query.id" />
    </el-card>
  </div>
</template>

<style scoped></style>

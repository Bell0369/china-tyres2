<script setup>
import { ref, watch, defineEmits } from "vue"
import { EditPen } from "@element-plus/icons-vue"
import { useUpdateQuantity } from "@/hooks/useUpdateQuantity"
import { updatePiQuantityApi } from "@/api/order"

defineOptions({
  name: "PIItem"
})

const { infoData, isStatus } = defineProps(["infoData", "isStatus"])
console.log("PI詳情--", isStatus)

// 修改柜量
const { handleUpdateQuantity, isQuantity } = useUpdateQuantity({
  api: updatePiQuantityApi
})

const emits = defineEmits(["data-change"])
// 修改 成功
watch([isQuantity], () => {
  emits("data-change")
})

const loading = ref(true)
setTimeout(() => {
  loading.value = false
}, 1500)
</script>

<template>
  <el-card v-loading="loading" shadow="never" class="search-wrapper">
    <div class="m-b">
      <div class="flex justify-between">
        <el-text tag="b" size="large">PI基本信息</el-text>
      </div>
    </div>
    <el-descriptions :column="3" border>
      <el-descriptions-item label="訂單號">{{ infoData.order_no }}</el-descriptions-item>
      <el-descriptions-item label="PI號">{{ infoData.pi_no }}</el-descriptions-item>
      <el-descriptions-item label="發貨計劃號">{{ infoData.delivery_plan_no }}</el-descriptions-item>
      <el-descriptions-item label="訂單總數量">{{ infoData.order_number }}</el-descriptions-item>
      <el-descriptions-item label="PI數量">{{ infoData.pi_number }}</el-descriptions-item>
      <el-descriptions-item label="PI已發貨數">{{ infoData.pi_shipped }}</el-descriptions-item>
      <el-descriptions-item label="PI未發貨數">{{ infoData.pi_not_shipped }}</el-descriptions-item>
      <el-descriptions-item label="PI總金額">{{ infoData.pi_price }}</el-descriptions-item>
      <el-descriptions-item label="櫃量(40'HQ)">
        {{ infoData.quantity }}
        <EditPen @click="handleUpdateQuantity(infoData)" class="w4 h4 cursor-pointer hover:c-blue" />
      </el-descriptions-item>
      <el-descriptions-item label="訂單總金額">{{ infoData.order_price }}</el-descriptions-item>
      <el-descriptions-item label="目的港">{{ infoData.destination }}</el-descriptions-item>
      <el-descriptions-item label="Remarks">{{ infoData.remarks }}</el-descriptions-item>
      <el-descriptions-item label="Terms of Pay ment">{{ infoData.terms_of_payment }}</el-descriptions-item>
    </el-descriptions>
  </el-card>
</template>

<style scoped></style>

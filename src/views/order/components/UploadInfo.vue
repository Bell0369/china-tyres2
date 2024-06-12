<script setup>
import { watch, defineEmits } from "vue"
import { EditPen } from "@element-plus/icons-vue"
import { useUpdateQuantity } from "@/hooks/useUpdateQuantity"
import { updateQuantityApi } from "@/api/order"

defineOptions({
  name: "BasicInformation"
})
const { orderInfo } = defineProps(["orderInfo"])

// 修改柜量
const { handleUpdateQuantity, isQuantity } = useUpdateQuantity({
  api: updateQuantityApi
})

const emits = defineEmits(["data-change"])
// 修改 成功
watch([isQuantity], () => {
  emits("data-change")
})
</script>

<template>
  <div>
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">訂單基本信息</el-text>
      </div>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="訂單號" width="200px">{{ orderInfo.order_no }}</el-descriptions-item>
        <el-descriptions-item label="PI號" :span="2">---</el-descriptions-item>
        <el-descriptions-item label="訂單總數量" width="200px">{{ orderInfo.order_number_sum }}</el-descriptions-item>
        <el-descriptions-item label="未生產數量" width="200px">{{ orderInfo.not_shipped_number }}</el-descriptions-item>
        <el-descriptions-item label="PI數量" width="200px" />
        <el-descriptions-item label="PI已發貨數">---</el-descriptions-item>
        <el-descriptions-item label="PI未發貨數">---</el-descriptions-item>
        <el-descriptions-item label="預計櫃量(40'HQ)">
          {{ orderInfo.quantity }}
          <EditPen
            v-permission="['editQuantity']"
            @click="handleUpdateQuantity(orderInfo)"
            class="w4 h4 cursor-pointer hover:c-blue"
          />
        </el-descriptions-item>
        <el-descriptions-item label="訂單總金額">{{ orderInfo.order_price_sum }}</el-descriptions-item>
        <el-descriptions-item label="起運港">{{ orderInfo.start_harbor }}</el-descriptions-item>
        <el-descriptions-item label="目的港">{{ orderInfo.end_harbor }}</el-descriptions-item>
        <el-descriptions-item label="商品描述">{{ orderInfo.goods_description }}</el-descriptions-item>
        <el-descriptions-item label="Remarks" :span="2">{{ orderInfo.remarks }}</el-descriptions-item>
        <el-descriptions-item label="Packing">{{ orderInfo.packing }}</el-descriptions-item>
        <el-descriptions-item label="Terms of Pay ment" :span="2">{{
          orderInfo.terms_of_payment
        }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped></style>

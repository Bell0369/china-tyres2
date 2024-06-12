<script setup>
import { ref, reactive, onMounted } from "vue"
import { useRoute } from "vue-router"
import { getOrderDetailApi } from "@/api/order"
import OrderProduct from "./OrderProduct.vue"
import ItemInfo from "./components/ItemInfo.vue"

defineOptions({
  name: "OrderItem"
})

const route = useRoute()

const loading = ref(false)

// 基本信息
const orderInfo = reactive({})
const orderReal = reactive({})
const getOrderDetail = () => {
  loading.value = true
  getOrderDetailApi({
    id: route.query.id
  }).then(({ data }) => {
    loading.value = false
    Object.assign(orderInfo, data.orderInfo)
    Object.assign(orderReal, data.orderReal)
  })
}

onMounted(() => {
  getOrderDetail()
})
</script>

<template>
  <div class="app-container" v-loading="loading">
    <item-info :orderInfo="orderInfo" @data-change="getOrderDetail" />

    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">訂單實時信息</el-text>
      </div>
      <el-descriptions :column="2" border>
        <el-descriptions-item width="25%" label="訂單數量">{{ orderReal.order_number }}</el-descriptions-item>
        <el-descriptions-item width="25%" label="BO數量">{{ orderReal.unproduced }}</el-descriptions-item>
        <el-descriptions-item :span="4" label="PI數量">
          <el-collapse>
            <el-collapse-item :title="`${orderReal.pi_number}`">
              <el-table border :data="orderReal.pi_list">
                <el-table-column prop="pi_no" label="編號" align="center" />
                <el-table-column prop="number" label="數量" align="center" />
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-descriptions-item>
        <el-descriptions-item :span="4" label="INV數量">
          <el-collapse>
            <el-collapse-item :title="`${orderReal.inv_number}`">
              <el-table border :data="orderReal.inv_list">
                <el-table-column prop="inv_no" label="編號" align="center" />
                <el-table-column prop="inv_number" label="數量" align="center" />
                <el-table-column prop="etd" label="ETD时间" align="center">
                  <template #default="scope">
                    <el-text v-for="(item, index) in scope.row.etd" :key="item"
                      >{{ index === 0 ? "" : "," }} {{ item }}
                    </el-text>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card shadow="never">
      <OrderProduct :orderId="route.query.id" />
    </el-card>
  </div>
</template>

<style scoped></style>

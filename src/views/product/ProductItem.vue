<script setup>
import { ref, onMounted, reactive } from "vue"
import { useRoute } from "vue-router"
import { getProductShowApi } from "@/api/product"

const route = useRoute()
console.log(route.query.id)

const loading = ref(false)

const infoData = reactive({})
const clientData = ref([])
const factoryDate = ref([])

const getTableData = () => {
  loading.value = true
  getProductShowApi({
    id: route.query.id
  })
    .then(({ data }) => {
      Object.assign(infoData, data.info)
      clientData.value = data.client
      factoryDate.value = data.factory
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getTableData()
})
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never">
      <div class="pb5">
        <div class="m-b">
          <el-text tag="b" size="large">產品信息</el-text>
        </div>
        <el-descriptions :column="4" border>
          <el-descriptions-item label="產品名稱">{{ infoData.name }}</el-descriptions-item>
          <el-descriptions-item label="產品代碼(ART)">{{ infoData.art }}</el-descriptions-item>
          <el-descriptions-item label="條碼EAN">{{ infoData.ean }}</el-descriptions-item>
          <el-descriptions-item label="品牌">{{ infoData.brand_code }}</el-descriptions-item>
          <el-descriptions-item label="海關編碼">{{ infoData.customs_code }}</el-descriptions-item>
          <el-descriptions-item label="40'HQ裝箱量">{{ infoData.quantity }}</el-descriptions-item>
          <el-descriptions-item label="輪胎類型TYPE">{{ infoData.tyre_type }}</el-descriptions-item>
          <el-descriptions-item label="單重">{{ infoData.piece_weight }}</el-descriptions-item>
          <el-descriptions-item label="類型">{{ infoData.type }}</el-descriptions-item>
          <el-descriptions-item label="花紋">{{ infoData.decorative_design }}</el-descriptions-item>
          <el-descriptions-item label="寸口">{{ infoData.spout }}</el-descriptions-item>
          <el-descriptions-item label="歐標等級">{{ infoData.european_standard_level }}</el-descriptions-item>
          <el-descriptions-item label="是否歐標EU OR 空白">{{ infoData.european_standard }}</el-descriptions-item>
          <el-descriptions-item label="排序值">{{ infoData.sort }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div class="mt5">
        <el-text tag="b" size="large">銷售客戶</el-text>
        <el-table :data="clientData" border class="mt">
          <el-table-column prop="name" label="客戶編碼" />
          <el-table-column prop="price" label="銷售價格" />
        </el-table>
      </div>
      <div class="mt10">
        <el-text tag="b" size="large">生產工廠</el-text>
        <el-table :data="factoryDate" border class="mt">
          <el-table-column prop="name" label="工廠名稱" />
          <el-table-column prop="price" label="工廠價格" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<style scoped></style>

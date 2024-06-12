<script setup>
import { ref, reactive, onMounted } from "vue"
import { Search, Refresh } from "@element-plus/icons-vue"
import { getOrderDetailProductApi, getEtdOptionsApi, getEtdOrderProductSelectApi } from "@/api/order"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { useClientSelect } from "@/hooks/useClientSelect"
import { Dialog } from "@/components/Dialog"

defineOptions({
  name: "OrderProduct"
})

const loading = ref(false)

const { orderId } = defineProps(["orderId"])

// 品牌
const { brandOptions } = useBrandSelect()

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

const searchFormRef = ref()
const searchData = reactive({
  product_name: "",
  brand_code: "",
  factory_code: "",
  client_id: null
})

// 获取数据
const tableData = ref([])
const handleSearch = () => {
  loading.value = true
  getOrderDetailProductApi({
    id: orderId,
    product_name: searchData.product_name || undefined,
    brand_code: searchData.brand_code || undefined,
    factory_code: searchData.factory_code || undefined,
    client_id: searchData.client_id || undefined
  }).then(({ data }) => {
    loading.value = false
    tableData.value = data
  })
}

onMounted(() => {
  handleSearch()
})

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

// 查詢ETD時間
const dialogVisible = ref(false)
const etdDateOptions = ref([])
const etdDate = ref("")
const etdSearch = () => {
  dialogVisible.value = true
  getEtdOptionsApi({
    id: orderId
  }).then(({ data }) => {
    etdDateOptions.value = data
    etdDate.value = data[0]
    setTimeout(() => {
      loading2.value = true
      getEtdList()
    }, 300)
  })
}

const etdTableData = ref([])
const etdNumber = ref(0)
const loading2 = ref(false)
const getEtdList = () => {
  getEtdOrderProductSelectApi({
    id: orderId,
    etd: etdDate.value
  }).then(({ data }) => {
    loading2.value = false
    etdTableData.value = data.list
    etdNumber.value = data.total_number
  })
}
</script>

<template>
  <div>
    <div class="toolbar-wrapper">
      <el-text tag="b" size="large">產品信息</el-text>
    </div>
    <div class="mb">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="product_name" label="產品名稱">
          <el-input v-model="searchData.product_name" placeholder="請輸入產品名稱" style="width: 200px" />
        </el-form-item>
        <el-form-item prop="client_id" label="客戶編碼">
          <el-select
            v-model="searchData.client_id"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadClientData"
            :loading="loadClient"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item prop="brand_code" label="品牌">
          <el-select v-model="searchData.brand_code" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item prop="factory_code" label="工廠代碼">
          <el-select v-model="searchData.factory_code" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in factoryCodeOptions" :key="item.id" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          <el-button type="success" @click="etdSearch">ETD查詢</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-table v-loading="loading" :data="tableData" border row-key="pi_no" row-class-name="warning-row">
      <el-table-column type="expand">
        <template #default="props">
          <div class="px">
            <el-table :data="props.row.list" :max-height="450">
              <el-table-column type="index" label="序號" width="80px" align="center" />
              <el-table-column label="產品名稱" prop="product_name" />
              <el-table-column label="訂單數量" prop="order_product_number" />
              <el-table-column :label="props.row.pi_no ? 'PI數量' : '未分配PI数量'" prop="number" />
              <el-table-column label="PI已發貨數量" prop="shipped_number" />
              <el-table-column label="PI未發貨數量" prop="not_shipped_number" />
              <el-table-column label="單價" prop="unit_price" />
              <el-table-column label="總價" prop="total_prices" />
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="編號" prop="pi_no">
        <template #default="scope">
          {{ scope.row.pi_no ? scope.row.pi_no : "未分配PI" }}
        </template>
      </el-table-column>
    </el-table>

    <!-- etd -->
    <Dialog v-model="dialogVisible" title="ETD查詢">
      <div>
        <div class="flex justify-between items-center">
          <div>
            <el-select v-model="etdDate" style="width: 240px">
              <el-option v-for="(item, index) in etdDateOptions" :key="index" :label="item" :value="item" />
            </el-select>
          </div>
          <div>
            <el-text>總數量: </el-text>
            <el-text type="danger" size="large">{{ etdNumber }}</el-text>
          </div>
        </div>
        <div v-loading="loading2">
          <el-table :data="etdTableData" height="300">
            <el-table-column prop="product_name" label="產品名稱" />
            <el-table-column prop="delivery_plan_no" label="發貨計劃號" />
            <el-table-column prop="reality_number" label="發貨數量" width="100" align="center" />
          </el-table>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-info-light-9);
}
</style>

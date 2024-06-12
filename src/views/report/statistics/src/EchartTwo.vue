<script setup>
import { ref, reactive } from "vue"
import { ElMessage } from "element-plus"
import { Search } from "@element-plus/icons-vue"
import { useClientSelect } from "@/hooks/useClientSelect"
import { getStatisticClientTargetApi } from "@/api/selects"
import BaseEchart from "./BaseEchart.vue"

defineOptions({
  name: "EchartTwo"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 數據
const selectOptions = [
  { id: 1, value: "訂單量" },
  { id: 2, value: "訂單金額" },
  { id: 3, value: "PI金額" },
  { id: 4, value: "裝貨數量" },
  { id: 5, value: "采購金額" },
  { id: 6, value: "銷售發票金額" },
  { id: 7, value: "收款金額" }
]

const loading = ref(false)

const echartOptions = reactive({
  tooltip: {},
  yAxis: {},
  xAxis: {
    type: "category",
    data: []
  },
  series: []
})

const getEchart1 = () => {
  loading.value = true
  searchData.date_type = orderType.value
  searchData.date = dateValue.value
  getStatisticClientTargetApi(searchData)
    .then(({ data }) => {
      // console.log(data)
      const Datas = data
      const orderNumbers = Datas.map((item) => item.amount)
      const datas = Datas.map((item) => item.date)
      echartOptions.xAxis.data = datas
      echartOptions.series = [{ name: "數量", type: "bar", data: orderNumbers }]
    })
    .finally(() => {
      loading.value = false
    })
}

// 查詢
const orderType = ref(1)
const handleSearch = () => {
  if (dateValue.value === "") {
    ElMessage.error("請選擇時間")
    return
  }
  if (searchData.client_id === "") {
    ElMessage.error("請選擇客戶")
    return
  }
  getEchart1()
}

const dateValue = ref("")
const dateTypes = reactive({
  type: ["", "year", "month", "week"],
  value_format: ["", "YYYY", "YYYY-MM", "YYYY-MM-DD"],
  format: ["", "YYYY", "YYYY-MM", "ww [周] YYYY-MM-DD"]
})

const searchData = reactive({
  client_id: "",
  type: 1
})
</script>

<template>
  <el-card shadow="never" class="mb5">
    <div class="mb5">
      <el-text tag="b" size="large">客戶數據統計</el-text>
    </div>
    <el-form :inline="true">
      <el-form-item>
        <el-radio-group v-model="orderType" fill="#29d" @change="dateValue = ''">
          <el-radio-button label="年" :value="1" />
          <el-radio-button label="月" :value="2" />
          <el-radio-button label="周" :value="3" />
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="dateValue"
          :type="dateTypes.type[orderType]"
          :value-format="dateTypes.value_format[orderType]"
          :format="dateTypes.format[orderType]"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="searchData.client_id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadClientData"
          :loading="loadClient"
          placeholder="客戶"
          style="width: 200px"
        >
          <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="searchData.type" style="width: 200px">
          <el-option v-for="item in selectOptions" :key="item.id" :label="item.value" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
      </el-form-item>
    </el-form>
    <div v-loading="loading">
      <base-echart :chartOption="echartOptions" />
    </div>
  </el-card>
</template>

<style scoped></style>

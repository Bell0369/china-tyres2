<script setup>
import { ref, reactive, onMounted } from "vue"
import { ElMessage } from "element-plus"
import { Search } from "@element-plus/icons-vue"
import { getStatisticSalesVolumeApi } from "@/api/selects"
import BaseEchart from "./BaseEchart.vue"

defineOptions({
  name: "EchartOne"
})

const loading = ref(false)

const echartOptions = reactive({
  title: {
    text: "產品數量",
    subtext: ""
  },
  tooltip: {},
  legend: {},
  yAxis: {},
  xAxis: {
    type: "category",
    data: []
  },
  series: []
})

onMounted(() => {
  getEchart1()
})

// 加載數據
const getEchart1 = () => {
  loading.value = true
  getStatisticSalesVolumeApi({
    type: orderType.value,
    date: dateValue.value
  })
    .then(({ data }) => {
      // console.log(data)
      const Datas = data
      const orderNumbers = Datas.map((item) => item.order_number)
      const piNumbers = Datas.map((item) => item.pi_number)
      const piShippedNumbers = Datas.map((item) => item.pi_shipped_number)
      const datas = Datas.map((item) => item.date)
      echartOptions.xAxis.data = datas
      echartOptions.series = [
        { name: "訂單", type: "bar", data: orderNumbers },
        { name: "PI", type: "bar", data: piNumbers },
        { name: "已發貨", type: "bar", data: piShippedNumbers }
      ]
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
  getEchart1()
}

const currentYear = new Date().getFullYear()
const dateValue = ref(currentYear)
const dateTypes = reactive({
  type: ["", "year", "month", "week"],
  value_format: ["", "YYYY", "YYYY-MM", "YYYY-MM-DD"],
  format: ["", "YYYY", "YYYY-MM", "ww [周] YYYY-MM-DD"]
})
</script>

<template>
  <el-card shadow="never" class="mb5">
    <div class="mb5">
      <el-text tag="b" size="large">銷售總體概況</el-text>
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
        <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
      </el-form-item>
    </el-form>
    <div v-loading="loading">
      <base-echart :chartOption="echartOptions" />
    </div>
  </el-card>
</template>

<style scoped></style>

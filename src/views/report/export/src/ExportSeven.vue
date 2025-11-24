<script setup>
import { reactive, ref, onMounted } from "vue"
import { ElMessage } from "element-plus"
import { exportOrderPiDataApi, getDeliveryListApi } from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { useFactorySelect } from "@/hooks/useFactorySelect"

defineOptions({
  name: "ExportSeven"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

// 发货方式
const optionsShipping = ref([])
onMounted(async () => {
  const { data } = await getDeliveryListApi()
  optionsShipping.value = data
})

const monthrangeData = ref(["", ""])
const FormData = reactive({
  factory_id: "",
  client_id: "",
  brand_id: "",
  status: "",
  shipped_type: ""
})

// 導出訂單PI一覽表
const loadingBtn1 = ref(false)

// 選中數據
const exportData = (Type) => {
  if (monthrangeData.value[0] === "") {
    ElMessage.error("請選擇时间先")
    return false
  }

  if (FormData.factory_id === "") {
    ElMessage.error("請選擇工廠")
    return false
  }

  switch (Type) {
    case 1:
      exportFile(exportOrderPiDataApi, loadingBtn1, "訂單PI一覽表")
      break
    default:
      break
  }
}

const exportFile = (api, loadingRef, name) => {
  loadingRef.value = true

  // name工廠代碼.日期.品牌.輪胎類型
  // 去除每个日期字符串中的 "-" 并格式化
  const [startDate, endDate] = monthrangeData.value.map((date) => date.replace(/-/g, ""))
  const { brand_id } = FormData

  // 初始化日期格式字符串
  let FormattingDates = `${startDate}-${endDate}`

  // 条件添加品牌ID
  FormattingDates += brand_id ? `.${brand_id.short}` : ""

  api({
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1],
    client_id: FormData.client_id,
    factory_id: FormData.factory_id.id,
    brand_id: FormData.brand_id.id,
    status: FormData.status || undefined,
    shipped_type: FormData.shipped_type.name || undefined
  })
    .then((data) => {
      if (data.type === "application/json") {
        const reader = new FileReader()
        reader.onload = () => {
          const text = reader.result
          const jsonResponse = JSON.parse(text)
          ElMessage.error(jsonResponse.message)
        }
        reader.readAsText(data)
      } else {
        const downloadLink = document.createElement("a")
        downloadLink.href = URL.createObjectURL(data)
        downloadLink.download = `${name}${FormData.factory_id.name}.${FormattingDates}.xlsx`
        downloadLink.click()
      }
    })
    .finally(() => {
      setTimeout(() => {
        loadingRef.value = false
      }, 500)
    })
}
</script>

<template>
  <el-card shadow="never" class="search-wrapper">
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker
          v-model="monthrangeData"
          type="daterange"
          range-separator="-"
          start-placeholder="*開始日期*"
          end-placeholder="*結束日期*"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          value-key="id"
          v-model="FormData.factory_id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadFactoryData"
          :loading="loadFactory"
          style="width: 150px"
          placeholder="*工廠*"
        >
          <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="FormData.client_id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadClientData"
          :loading="loadClient"
          placeholder="*客戶*"
          style="width: 150px"
        >
          <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="FormData.brand_id" style="width: 150px" placeholder="*品牌*" value-key="id">
          <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="FormData.status" placeholder="pi狀態" style="width: 150px">
          <el-option label="未完成" value="0" />
          <el-option label="已完成" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="FormData.shipped_type" placeholder="發貨方式" style="width: 150px" value-key="id">
          <el-option v-for="item in optionsShipping" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportData(1)" :loading="loadingBtn1">導出訂單PI一覽表</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

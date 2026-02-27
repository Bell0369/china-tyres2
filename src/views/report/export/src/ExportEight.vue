<script setup>
import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { exportUndonePiNumberApi } from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { useFactorySelect } from "@/hooks/useFactorySelect"

defineOptions({
  name: "ExportEight"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

const monthrangeData2 = ref(["", ""])
const FormData2 = reactive({
  client_id: "",
  brand_id: "",
  factory_id: "",
  tyre_type: "",
  status: "1"
})
// 導出PI規格數量匯總
const loadingBtn11 = ref(false)

// 選中數據
const exportData2 = (Type) => {
  if (monthrangeData2.value[0] === "") {
    ElMessage.error("請選擇时间先")
    return false
  }

  if (FormData2.factory_id === "") {
    ElMessage.error("請選擇工廠")
    return false
  }

  if (FormData2.brand_id === "") {
    ElMessage.error("請選擇品牌")
    return false
  }

  switch (Type) {
    case 1:
      exportFile2(exportUndonePiNumberApi, loadingBtn11, "PI規格數量匯總")
      break
    default:
      break
  }
}

const exportFile2 = (api, loadingRef, name) => {
  loadingRef.value = true

  // name工廠代碼.日期.品牌.輪胎類型
  // 去除每个日期字符串中的 "-" 并格式化
  const [startDate, endDate] = monthrangeData2.value.map((date) => date.replace(/-/g, ""))
  const { brand_id, tyre_type } = FormData2

  // 初始化日期格式字符串
  let FormattingDates = `${startDate}-${endDate}`

  // 条件添加品牌ID和轮胎类型
  FormattingDates += brand_id ? `.${brand_id.short}` : ""
  FormattingDates += tyre_type ? `.${tyre_type}` : ""

  api({
    start_date: monthrangeData2.value[0],
    end_date: monthrangeData2.value[1],
    client_id: FormData2.client_id || undefined,
    factory_id: FormData2.factory_id.id,
    brand_id: FormData2.brand_id.id || undefined,
    status: FormData2.status || undefined,
    tyre_type: FormData2.tyre_type || undefined
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
        downloadLink.download = `${name}${FormData2.factory_id.name}.${FormattingDates}.xlsx`
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
  <el-card shadow="never" class="search-wrapper" v-permission="['exportUndonePiNumber']">
    <el-form :inline="true">
      <el-form-item>
        <el-date-picker
          v-model="monthrangeData2"
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
          v-model="FormData2.factory_id"
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
        <el-select v-model="FormData2.brand_id" style="width: 150px" placeholder="*品牌*" value-key="id">
          <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="FormData2.status" placeholder="*PI狀態*" style="width: 150px">
          <el-option label="已完成" value="1" />
          <el-option label="未完成" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="FormData2.client_id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadClientData"
          :loading="loadClient"
          placeholder="客戶"
          style="width: 150px"
        >
          <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="FormData2.tyre_type" placeholder="輪胎類型" style="width: 150px">
          <el-option label="4S" value="4S" />
          <el-option label="SUMMER" value="SUMMER" />
          <el-option label="TBR" value="TBR" />
          <el-option label="WINTER" value="WINTER" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="exportData2(1)" :loading="loadingBtn11">導出PI規格數量匯總</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped></style>

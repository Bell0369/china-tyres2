<script setup>
import { reactive, ref } from "vue"
import { ElMessage } from "element-plus"
import { exportClientSellOverviewApi, exportOrderGeneralViewApi } from "@/api/selects"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { useFactorySelect } from "@/hooks/useFactorySelect"

defineOptions({
  name: "ExportFour"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

const monthrangeData = ref(["", ""])
const clientItem = ref("")

// 導出訂單客戶報表
const loadingBtn1 = ref(false)
const FormData = reactive({
  brand_id: "",
  factory_code: ""
})

// 導出客戶銷售總覽
const loadingBtn2 = ref(false)

// 選中數據
const exportData = (Type) => {
  if (monthrangeData.value[0] === "") {
    ElMessage.error("請選擇时间先")
    return false
  }
  if (clientItem.value === "") {
    ElMessage.error("請選擇客戶")
    return false
  }
  const dataJson = {
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1],
    client_id: clientItem.value.id
  }

  switch (Type) {
    case 1:
      exportFile(Object.assign(dataJson, FormData), exportOrderGeneralViewApi, loadingBtn1, "訂單發貨狀態總覽")
      break
    case 2:
      exportFile(dataJson, exportClientSellOverviewApi, loadingBtn2, "客戶銷售規格數量統計")
      break
    default:
      break
  }
}

const exportFile = (dataJson, api, loadingRef, name) => {
  loadingRef.value = true
  const FormattingDates = monthrangeData.value[0].replace(/-/g, "") + "-" + monthrangeData.value[1].replace(/-/g, "")

  api(dataJson)
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
        downloadLink.download = `${name}${clientItem.value.client_code}.${FormattingDates}.xlsx`
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
  <el-card shadow="never" class="search-wrapper" v-permission="['exportClientSellOverview', 'exportOrderGeneralView']">
    <el-form :inline="true" style="border-bottom: 1px dashed #67c23a">
      <el-form-item>
        <el-date-picker
          v-model="monthrangeData"
          type="daterange"
          range-separator="-"
          start-placeholder="開始日期"
          end-placeholder="結束日期"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="clientItem"
          value-key="id"
          filterable
          remote
          remote-show-suffix
          :remote-method="loadClientData"
          :loading="loadClient"
          placeholder="客戶"
          style="width: 200px"
        >
          <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item" />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="mt" v-permission="['exportClientSellOverview']">
      <el-button type="primary" @click="exportData(2)" :loading="loadingBtn2">導出客戶銷售規格數量統計</el-button>
    </div>
    <div class="mt" v-permission="['exportOrderGeneralView']">
      <el-form :inline="true">
        <el-form-item>
          <el-select v-model="FormData.brand_id" style="width: 150px" placeholder="品牌">
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-select
            v-model="FormData.factory_code"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadFactoryData"
            :loading="loadFactory"
            style="width: 150px"
            placeholder="工廠"
          >
            <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.factory_code" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="exportData(1)" :loading="loadingBtn1">導出訂單發貨狀態總覽</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<style scoped></style>

<script setup>
import { ref, reactive, onMounted, computed } from "vue"
import { ElMessage, ElMessageBox } from "element-plus"
import { Refresh, Search } from "@element-plus/icons-vue"
import { useRoute, useRouter } from "vue-router"
import { useFactorySelect } from "@/hooks/useFactorySelect"
import {
  getPiProductDetailApi,
  getPiBasicDetailApi,
  uploadPIDeliveryPlanApi,
  deliveryPlanApplyCheckApi
} from "@/api/order"
import ItemInfo from "./components/ItemInfo.vue"
import { redirectTo } from "@/utils/tagsclose"

defineOptions({
  name: "PIDelivery"
})

const loading = ref(false)

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

// tag
const route = useRoute()
const router = useRouter()

// 查-基本信息
const infoData = reactive({})
const getInfoData = () => {
  getPiBasicDetailApi({
    id: route.query.id
  }).then(({ data }) => {
    Object.assign(infoData, data)
  })
}

// 查-产品信息
const tableData = ref([])
const listTableData = ref([])
const getTableData = () => {
  loading.value = true
  getPiProductDetailApi({
    id: route.query.id
  }).then(({ data }) => {
    const filteredData = data.filter((item) => item.unproduced !== 0)
    tableData.value = listTableData.value = filteredData
    loading.value = false
  })
}

onMounted(() => {
  getInfoData()
  getTableData()
})

// 查询产品信息
const keyword = ref("")
const searchTable = () => {
  const searchTerm = keyword.value.trim().toLowerCase()
  if (searchTerm === "") {
    tableData.value = listTableData.value
    return tableData.value
  }

  tableData.value = listTableData.value.filter((item) => {
    const productName = item.product_name.toLowerCase()
    return productName.includes(searchTerm)
  })
}

// 重置
const resetSearch = () => {
  keyword.value = ""
  tableData.value = listTableData.value
}

// 選中變化
const rows = ref([])
const handleSelectionChange = (newSelection) => {
  rows.value = newSelection
}

// 審批
const apply_remarks = ref("")
const submitForm = () => {
  if (ruleForm.factory_id === "") {
    ElMessage.error("請選擇工廠")
    return
  }
  if (rows.value.length === 0) {
    ElMessage.error("請勾選產品")
    return false
  }

  if (infoData.is_check_deliver_project) {
    ElMessageBox.prompt("發貨計劃需要審批才能進行，是否繼續？", "發貨計劃", {
      confirmButtonText: "確定",
      cancelButtonText: "取消",
      inputPlaceholder: "請輸入備註",
      inputType: "textarea",
      inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
      inputErrorMessage: "請輸入備註"
    })
      .then(({ value }) => {
        apply_remarks.value = value
        sendFormData()
      })
      .catch(() => {
        ElMessage.info("已取消")
      })
  } else {
    sendFormData()
  }
}

const tableRef = ref()
//
const ruleForm = reactive({
  type: 2,
  pi_id: route.query.id,
  factory_id: "",
  data_arr: []
})

const sendFormData = () => {
  rows.value.forEach((item) => {
    const data_arr = {
      id: item.id,
      product_name: item.product_name,
      brand_code: item.brand_code,
      number: item.not_shipped_number
    }
    ruleForm.data_arr.push(data_arr)
  })
  loading.value = true
  uploadPIDeliveryPlanApi(ruleForm)
    .then(({ data }) => {
      if (infoData.is_check_deliver_project) {
        deliveryPlanApplyCheckApi({
          id: data.delivery_plan_id,
          apply_remarks: apply_remarks.value
        }).then(() => {
          redirectTo(router, route, "/delivery/deliverylist")
        })
      } else {
        redirectTo(router, route, "/delivery/deliverylist")
      }
    })
    .finally(() => {
      loading.value = true
    })
}

// 一个计算属性 ref
const Numbers = computed(() => {
  return tableData.value.reduce((unproduced, item) => unproduced + item.unproduced, 0)
})
const ShipNumber = computed(() => {
  return rows.value.reduce((unproduced, item) => unproduced + item.not_shipped_number, 0)
})
const PiNumber = computed(() => {
  return Numbers.value - ShipNumber.value
})
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <el-text tag="b" size="large">選擇工廠</el-text>
      </div>
      <el-form :model="ruleForm">
        <el-row>
          <el-col :span="6">
            <el-form-item label="工廠名稱">
              <el-select
                v-model="ruleForm.factory_id"
                filterable
                remote
                remote-show-suffix
                :remote-method="loadFactoryData"
                :loading="loadFactory"
              >
                <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <item-info :infoData="infoData" />

    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">核對信息</el-text>
          <el-button type="primary" @click="submitForm">生成發貨計劃</el-button>
        </div>
      </div>
      <div class="mb">
        <div class="flex justify-between items-center">
          <div>
            <el-input v-model="keyword" placeholder="請輸入產品名稱" style="width: 300px" class="pr" />
            <el-button type="primary" :icon="Search" @click="searchTable">查詢</el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </div>
          <div class="line-height-5">
            <div>
              <el-text>PI未發貨數量：</el-text><el-text type="danger"> {{ PiNumber }} </el-text>
            </div>
            <div>
              <el-text>計劃發貨數量：</el-text><el-text type="primary">{{ ShipNumber }} </el-text>
            </div>
          </div>
        </div>
      </div>
      <el-table ref="tableRef" :data="tableData" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序號" width="80" align="center" />
        <el-table-column prop="product_name" label="產品名稱" align="center" />
        <el-table-column prop="unproduced" label="PI未分配發貨計劃數" align="center" />
        <el-table-column prop="not_shipped_number" label="發貨數量" align="center" width="200">
          <template #default="scope">
            <el-input-number v-model.number="scope.row.not_shipped_number" :min="0" :max="scope.row.unproduced" />
            <!-- <el-input v-model.number="scope.row.not_shipped_number" type="number" /> -->
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped></style>

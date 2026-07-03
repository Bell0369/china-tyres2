<script setup>
import { reactive, ref, watch } from "vue"
import { ElButton } from "element-plus"
import { Search, Refresh } from "@element-plus/icons-vue"
import { getInlandFeeListApi, updateInlandStatusApi, exportInlandFeeApi } from "@/api/order"
import { usePagination } from "@/hooks/usePagination"
import { usePayerListSelect, useFreightForwarderListSelect } from "@/hooks/useSelectOption"
import { useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { Upload } from "@element-plus/icons-vue"
import InlandFeeForm from "./components/InlandFeeForm.vue"
import { useBrandSelect } from "@/hooks/useSelectOption"
import { Dialog } from "@/components/Dialog"

defineOptions({
  name: "InlandFeeList"
})

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

// 付款方
const payerListOptions = usePayerListSelect()

// 船代
const freightForwarderListOptions = useFreightForwarderListSelect()

// 品牌
const { brandOptions } = useBrandSelect()

const loading = ref(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  inv_no: "",
  factory_name: "",
  payee: "",
  payer: "",
  freight_forwarder: "",
  status: "",
  brand_id: ""
})
const monthrangeData = ref(["", ""])

const getTableData = () => {
  loading.value = true
  getInlandFeeListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    start_payer_time: monthrangeData.value[0] || undefined,
    end_payer_time: monthrangeData.value[1] || undefined,
    ...searchData
  })
    .then(({ data }) => {
      paginationData.total = data.total
      tableData.value = data.data
    })
    .catch(() => {
      tableData.value = []
    })
    .finally(() => {
      loading.value = false
    })
}
const handleSearch = () => {
  paginationData.currentPage === 1 ? getTableData() : (paginationData.currentPage = 1)
}
//#endregion

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  monthrangeData.value = ["", ""]
  handleSearch()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

// 更新内陸費用狀態
const handleUpdateInlandStatus = (id, status) => {
  loading.value = true
  updateInlandStatusApi({
    id,
    status: status === 0 ? 1 : 0 // 切換狀態
  })
    .then(() => {
      getTableData()
    })
    .finally(() => {
      loading.value = false
    })
}

// 导出内陆费用登记表
const handleExportInlandFee = () => {
  loading.value = true
  exportInlandFeeApi({
    start_payer_time: monthrangeData.value[0] || undefined,
    end_payer_time: monthrangeData.value[1] || undefined,
    ...searchData
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
        downloadLink.download = `內陸費用登記表.xlsx`
        downloadLink.click()
      }
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}

// 逗號隔開
const listMap = (list) => {
  const listMap = JSON.parse(list)
  return listMap.map((item) => item).join(", ")
}

// 内陸費用
const dialogVisible = ref(false)
const dialogId = ref(null)
const handleInlandFee = (id) => {
  dialogId.value = id
  dialogVisible.value = true
}

const handleChildEvent = () => {
  dialogVisible.value = false
  getTableData()
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item label="發票號" prop="inv_no">
          <el-input v-model="searchData.inv_no" style="width: 260px" placeholder="請輸入發票號" />
        </el-form-item>
        <el-form-item label="工廠名稱" prop="factory_name">
          <el-select v-model="searchData.factory_name" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in factoryCodeOptions" :key="item.id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款方" prop="payee">
          <el-input v-model="searchData.payee" style="width: 200px" placeholder="請輸入收款方" />
        </el-form-item>
        <el-form-item label="付款方" prop="payer">
          <el-select v-model="searchData.payer" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in payerListOptions" :key="item.id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="船代" prop="freight_forwarder">
          <el-select v-model="searchData.freight_forwarder" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option
              v-for="item in freightForwarderListOptions"
              :key="item.id"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="付款時間">
          <el-date-picker
            v-model="monthrangeData"
            type="daterange"
            range-separator="-"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item prop="status" label="付款狀態">
          <el-select v-model="searchData.status" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="未付" :value="0" />
            <el-option label="已付" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item prop="brand_id" label="品牌">
          <el-select v-model="searchData.brand_id" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <el-button type="warning" :icon="Upload" @click="handleExportInlandFee">導出內陸費用登記表</el-button>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" border>
          <el-table-column prop="sell_inv_no" label="發票號" align="center" width="140" />
          <el-table-column
            prop="procurement_invoice_no"
            label="採購發票號"
            align="center"
            width="170"
            :show-overflow-tooltip="true"
          >
            <template #default="scope">
              {{ listMap(scope.row.procurement_invoice_no) }}
            </template>
          </el-table-column>
          <el-table-column prop="bl_no" label="提單號" align="center" width="160" :show-overflow-tooltip="true">
            <template #default="scope">
              {{ listMap(scope.row.bl_no) }}
            </template>
          </el-table-column>
          <el-table-column prop="factory_name" label="工廠名稱" align="center" width="90" />
          <el-table-column prop="bell_price" label="賬單金額" align="center" width="100" />
          <el-table-column prop="payee" label="收款方" align="center" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column prop="payer" label="付款方" align="center" min-width="100" :show-overflow-tooltip="true" />
          <el-table-column prop="cargo_manifest_amount" label="舱单金额" align="center" width="100" />
          <el-table-column prop="freight_forwarder" label="船代" align="center" />
          <el-table-column prop="freight_rate" label="運費" align="center" />
          <el-table-column prop="status" label="付款狀態" align="center" width="90">
            <template #default="scope">
              <el-tag type="danger" v-if="scope.row.status === 0"> 未付 </el-tag>
              <el-tag type="success" v-else> 已付 </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="updated_at" label="更新時間" align="center" sortable width="120" />
          <el-table-column fixed="right" label="操作" width="180" align="center">
            <template #default="scope">
              <el-button
                :type="scope.row.status ? 'info' : 'danger'"
                text
                bg
                size="small"
                @click="handleUpdateInlandStatus(scope.row.sell_inv_id, scope.row.status)"
                >{{ scope.row.status ? "取消付款" : "確認付款" }}</el-button
              >
              <el-button type="primary" text bg size="small" @click="handleInlandFee(scope.row.id)">內陸費用</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pager-wrapper">
        <el-pagination
          background
          :layout="paginationData.layout"
          :page-sizes="paginationData.pageSizes"
          :total="paginationData.total"
          :page-size="paginationData.pageSize"
          :currentPage="paginationData.currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <Dialog v-model="dialogVisible" title="內陸費用" width="850">
      <inland-fee-form :rowId="dialogId" @childEvent="handleChildEvent" />
    </Dialog>
  </div>
</template>

<style lang="scss">
.el-dialog {
  &__header {
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__body {
    padding: 15px !important;
  }
}
</style>

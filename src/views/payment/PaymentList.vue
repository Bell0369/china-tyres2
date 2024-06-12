<script setup>
import { reactive, ref, watch } from "vue"
import { getClientProceedsApi, getFactoryCopeApi, getConfirmReceiptApi } from "@/api/order"
import { ElMessageBox, ElMessage, ElButton } from "element-plus"
import { Search, Refresh, Tickets } from "@element-plus/icons-vue"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useFactorySelect } from "@/hooks/useFactorySelect"
import { usePagination } from "@/hooks/usePagination"
import { Dialog } from "@/components/Dialog"
import addPayRecord from "./components/addPayRecord.vue"
import PrepayMents from "@/views/componrnts/prepayments/PrepayMents.vue"

defineOptions({
  name: "PaymentList"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 修改查詢狀態
const orderType = ref(0)
const updataOrderType = () => {
  if (orderType.value) {
    searchData.client_id = undefined
  } else {
    searchData.factory_id = undefined
  }
  searchData.status = undefined
  handleSearch()
}

//#region 查
const totalPrice = ref(0)
const tableData = ref([])

const monthrangeData = ref(["", ""])

const searchFormRef = ref(null)
const searchData = reactive({
  keyword: "" || undefined,
  status: "" || undefined,
  client_id: "" || undefined,
  factory_id: "" || undefined
})
const getTableData = () => {
  loading.value = true
  const page = {
    start_date: monthrangeData.value[0] || undefined,
    end_date: monthrangeData.value[1] || undefined,
    page: paginationData.currentPage,
    page_size: paginationData.pageSize
  }
  Object.assign(searchData, page)
  const api = orderType.value ? getFactoryCopeApi : getClientProceedsApi
  api(searchData)
    .then(({ data }) => {
      paginationData.total = data.total
      tableData.value = data.list
      totalPrice.value = data.total_price
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

// 改
const dialogVisible = ref(false)
const prepayId = ref(0)
const prepayType = ref(1)
const handleAddPrice = (row) => {
  dialogVisible.value = true
  prepayId.value = row
  prepayType.value = orderType.value ? 2 : 1
}

const dialogVisible2 = ref(false)
const showPrepay = (id) => {
  prepayType.value = orderType.value ? "factory" : "client"
  dialogVisible2.value = true
  prepayId.value = id
}

//#region
const handleReceipt = (id, type) => {
  const text = type === 1 ? "確認收款？" : "確認付款？"
  ElMessageBox.confirm(text, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      getConfirmReceiptApi({
        id: id,
        type: type
      })
        .then(() => {
          getTableData()
        })
        .finally(() => {
          loading.value = false
        })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消"
      })
    })
}

// 修改後刷新表格
const handleListPayment = () => {
  getTableData()
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="keyword" label="發票號">
          <el-input v-model="searchData.keyword" placeholder="" style="width: 300px" />
        </el-form-item>
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
        <el-form-item prop="status" label="應收" v-show="orderType === 0">
          <el-select v-model="searchData.status" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="未收" value="0" />
            <el-option label="已收" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item prop="client_id" label="客戶名稱" v-show="orderType === 0">
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
            <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item prop="status" label="應付" v-show="orderType === 1">
          <el-select v-model="searchData.status" style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="未付" value="0" />
            <el-option label="已付" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item prop="factory_id" label="工廠名稱" v-show="orderType === 1">
          <el-select
            v-model="searchData.factory_id"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadFactoryData"
            :loading="loadFactory"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.id" />
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
        <div class="flex justify-between">
          <div>
            <el-radio-group v-model="orderType" fill="#29d" @change="updataOrderType">
              <el-radio-button label="應收" :value="0" />
              <el-radio-button label="應付" :value="1" />
            </el-radio-group>
          </div>
          <div>
            <el-text size="large" v-show="orderType === 0">應收金額：</el-text>
            <el-text size="large" v-show="orderType === 1">應付金額：</el-text>
            <el-text size="large" type="danger">{{ totalPrice }}</el-text>
          </div>
        </div>
      </div>
      <div class="table-wrapper">
        <div v-show="orderType === 0">
          <el-table :data="tableData" border>
            <el-table-column prop="client_name" label="客戶名稱" align="center" />
            <el-table-column prop="inv_no" label="銷售發票" align="center" />
            <el-table-column prop="receivable_price" label="應收金額" align="center" />
            <el-table-column prop="paicl_price" label="實收金額" align="center">
              <template #default="scope">
                <span class="inline-block align-mid">{{ scope.row.paicl_price }}</span>
                <Tickets
                  v-permission="['clientAdvancePayment-1', 'clientAdvancePaymentList']"
                  @click="showPrepay(scope.row.client_id)"
                  class="color-blue cursor-pointer w5 h5 inline-block align-mid"
                />
              </template>
            </el-table-column>
            <el-table-column prop="uncollected_price" label="未收金額" align="center" />
            <el-table-column prop="status" label="應收狀態" align="center">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.status">已收</el-tag>
                <el-tag type="danger" v-else>未收</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" align="center" sortable />
            <el-table-column fixed="right" label="操作" width="180" align="center">
              <template #default="scope">
                <el-button
                  v-permission="['addPrice']"
                  type="primary"
                  text
                  bg
                  size="small"
                  @click="handleAddPrice(scope.row)"
                >
                  {{ scope.row.status ? "查看记录" : "添加金額" }}</el-button
                >
                <el-button
                  v-permission="['confirmReceipt']"
                  :disabled="scope.row.status === 1"
                  type="danger"
                  text
                  bg
                  size="small"
                  @click="handleReceipt(scope.row.id, 1)"
                >
                  確認收款
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-show="orderType === 1">
          <el-table :data="tableData" border>
            <el-table-column prop="factory_name" label="工廠名稱" align="center" />
            <el-table-column prop="procurement_invoice_no" label="採購發票" align="center">
              <template #default="scope">
                <span v-for="item in scope.row.procurement_invoice_no" :key="item">{{ item }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="accrued_price" label="應付金額" align="center" />
            <el-table-column prop="actually_price" label="實付金額" align="center">
              <template #default="scope">
                <span class="inline-block align-mid">{{ scope.row.actually_price }}</span>
                <Tickets
                  v-permission="['factoryAdvancePayment', 'factoryAdvancePaymentList']"
                  @click="showPrepay(scope.row.factory_id)"
                  class="color-blue cursor-pointer w5 h5 inline-block align-mid"
                />
              </template>
            </el-table-column>
            <el-table-column prop="unpaid_price" label="未付金額" align="center" />
            <el-table-column prop="status" label="應付狀態" align="center">
              <template #default="scope">
                <el-tag type="success" v-if="scope.row.status">已付</el-tag>
                <el-tag type="danger" v-else>未付</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" align="center" sortable />
            <el-table-column fixed="right" label="操作" width="180" align="center">
              <template #default="scope">
                <el-button
                  v-permission="['addPrice']"
                  type="primary"
                  text
                  bg
                  size="small"
                  @click="handleAddPrice(scope.row)"
                  >{{ scope.row.status ? "查看记录" : "添加金額" }}</el-button
                >
                <el-button
                  v-permission="['confirmReceipt']"
                  :disabled="scope.row.status === 1"
                  type="danger"
                  text
                  bg
                  size="small"
                  @click="handleReceipt(scope.row.id, 2)"
                >
                  確認付款
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
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

    <Dialog v-model="dialogVisible" :title="prepayId.status ? '查看记录' : '添加金額'">
      <add-payRecord :isType="prepayType" :row="prepayId" @handle-listPayment="handleListPayment" />
    </Dialog>

    <Dialog v-model="dialogVisible2" title="預付款">
      <prepay-ments :isType="prepayType" :id="prepayId" @handle-listPayment="handleListPayment" />
    </Dialog>
  </div>
</template>

<style lang="scss" scoped></style>

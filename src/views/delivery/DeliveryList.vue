<script setup>
import { reactive, ref, watch, onActivated } from "vue"
import {
  getDeliveryPlanListApi,
  deleteDeliveryPlanApi,
  createInvApi,
  exportDeliveryPlanApi,
  exportDeliveryPlanListApi,
  exportShippedProductDetailsApi
} from "@/api/order"
import { ElButton, ElMessage } from "element-plus"
import { Search, CirclePlus, Refresh, FolderAdd, Upload } from "@element-plus/icons-vue"
import { useRouter } from "vue-router"
import { usePagination } from "@/hooks/usePagination"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useRemarksSelect } from "@/hooks/useOrderRemarksSelect"
import { useDeleteList } from "@/hooks/useDeleteList"
import { handleActivated } from "@/utils/tagsclose"

defineOptions({
  name: "DeliveryList"
})

const router = useRouter()

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂代碼
const factoryCodeOptions = useFactoryCodeSelect()

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 订单备注
const { loadRemarks, optionsRemarks, loadRemarksData } = useRemarksSelect()

// 删除
const { handleDelete, isDeleted } = useDeleteList({
  api: deleteDeliveryPlanApi,
  text: "發貨計劃"
})

// 成功
watch([isDeleted], () => {
  getTableData()
})

//#region 查
const tableData = ref([])
const notShipped = ref(0)

const monthrangeData = ref(["", ""])

const searchFormRef = ref(null)
const searchData = reactive({
  is_check: undefined,
  is_shipped: 0,
  keyword: "" || undefined,
  client_code: "" || undefined,
  factory_code: "" || undefined,
  brand_code: "" || undefined,
  procurement_invoice_no: "" || undefined,
  order_remarks: "" || undefined,
  bl_no: "" || undefined
})
const getTableData = () => {
  loading.value = true
  const page = {
    start_date: monthrangeData.value[0] || undefined,
    end_date: monthrangeData.value[1] || undefined,
    page: paginationData.currentPage,
    page_size: paginationData.pageSize
  }
  Object.assign(page, searchData)
  getDeliveryPlanListApi(page)
    .then(({ data }) => {
      paginationData.total = data.total
      tableData.value = data.data
      notShipped.value = data.not_shipped
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
  // orderType.value = 0
  // searchData.is_check = undefined
  // searchData.is_shipped = 0
  monthrangeData.value = ["", ""]
  handleSearch()
}

// 修改查詢狀態
const orderType = ref(0)
const updataOrderType = () => {
  if (orderType.value === 2) {
    searchData.is_check = 0
    searchData.is_shipped = undefined
  } else {
    searchData.is_check = undefined
    searchData.is_shipped = orderType.value
  }
  getTableData()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

// 改
const handleView = (row) => {
  router.push({
    path: "/delivery/deliveryitem",
    query: {
      id: row.id
    }
  })
}

// 生成发票
const tableRef = ref(null)
const CreateInvoice = () => {
  console.log(orderType.value)
  if (orderType.value !== 1) {
    ElMessage.error("只有已發貨訂單可生成銷售發票")
    return false
  }

  const rows = tableRef.value.getSelectionRows()
  if (rows.length > 0) {
    const delivery_Arr = []
    rows.forEach((item) => {
      delivery_Arr.push(item.delivery_plan_no)
    })
    loading.value = true
    createInvApi({
      delivery_plan_no: delivery_Arr
    })
      .then(() => {
        ElMessage.success("銷售發票已生成")
        getTableData()
      })
      .finally(() => {
        loading.value = false
      })
  } else {
    ElMessage.error("未选中需生成的订单")
  }
}

onActivated(() => {
  if (handleActivated()) getTableData()
})

// 是否可选
const selectable = (row) => {
  if (row.is_create_inv) {
    return false
  } else {
    return true
  }
}

// 導出發貨計劃
const handleExport = (rows) => {
  const name = `${rows.delivery_plan_no}.${rows.brand_code}.${rows.client_code}`
  const page = {
    id: rows.id
  }
  exportFile(page, exportDeliveryPlanApi, name)
}

// 導出發貨計劃列表
const handleExportDeliveryPlan = () => {
  loading.value = true
  const page = {
    start_date: monthrangeData.value[0] || undefined,
    end_date: monthrangeData.value[1] || undefined
  }
  Object.assign(page, searchData)
  exportFile(page, exportDeliveryPlanListApi, "發貨計劃列表")
}

// 導出已发货规格明细
const handleExportShippedProductDetails = () => {
  const page = {
    start_date: monthrangeData.value[0] || undefined,
    end_date: monthrangeData.value[1] || undefined
  }
  Object.assign(page, searchData)
  exportFile(page, exportShippedProductDetailsApi, "已發貨規格明細")
}

// 導出方法
const exportFile = (dataJson, api, name) => {
  loading.value = true

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
        downloadLink.download = `${name}.xlsx`
        downloadLink.click()
      }
    })
    .finally(() => {
      setTimeout(() => {
        loading.value = false
      }, 500)
    })
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="keyword" label="訂單">
          <el-input v-model="searchData.keyword" placeholder="請輸入PI號，發貨計劃號" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="procurement_invoice_no" label="采購發票號">
          <el-input v-model="searchData.procurement_invoice_no" placeholder="請輸入采購發票號" style="width: 300px" />
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
        <el-form-item prop="bl_no" label="提單號">
          <el-input v-model="searchData.bl_no" placeholder="請輸入提單號" style="width: 300px" />
        </el-form-item>
        <el-form-item prop="client_code" label="客戶編碼">
          <el-select
            v-model="searchData.client_code"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadClientData"
            :loading="loadClient"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="item in optionsClient"
              :key="item.id"
              :label="item.client_code"
              :value="item.client_code"
            />
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
        <el-form-item prop="order_remarks" label="訂單備註">
          <el-select
            v-model="searchData.order_remarks"
            filterable
            remote
            remote-show-suffix
            :remote-method="loadRemarksData"
            :loading="loadRemarks"
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option v-for="item in optionsRemarks" :key="item.id" :label="item.content" :value="item.content" />
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
        <div class="flex justify-between items-center">
          <div>
            <router-link class="mr" v-permission="['uploadPackingList']" to="/delivery/deliveryupload">
              <el-button type="primary" :icon="CirclePlus">上傳裝箱單</el-button>
            </router-link>
            <el-button v-permission="['createInv']" type="primary" :icon="FolderAdd" @click="CreateInvoice"
              >銷售發票生成</el-button
            >
            <el-button type="warning" :icon="Upload" @click="handleExportDeliveryPlan">導出發貨計劃列表</el-button>
            <el-button
              type="warning"
              v-permission="['exportShippedProductDetails']"
              :icon="Upload"
              @click="handleExportShippedProductDetails"
            >
              導出已發貨規格明細
            </el-button>
          </div>
          <div>
            <el-text size="large">未發貨總數量：</el-text>
            <el-text size="large" type="danger">{{ notShipped }}</el-text>
          </div>
        </div>
      </div>
      <div class="mb5">
        <el-radio-group v-model="orderType" fill="#29d" @change="updataOrderType">
          <el-radio-button label="未發貨" :value="0" />
          <el-radio-button label="已發貨" :value="1" />
          <el-radio-button label="待審批" :value="2" />
        </el-radio-group>
      </div>
      <div class="table-wrapper">
        <!-- @selection-change="handleSelectionChange" -->
        <el-table ref="tableRef" border :data="tableData">
          <el-table-column type="selection" width="55" align="center" :selectable="selectable" fixed />
          <el-table-column prop="delivery_plan_no" label="發貨計劃號" align="center" width="150" />
          <el-table-column prop="pi_no" label="PI號" align="center" width="150" />
          <el-table-column prop="client_code" label="客戶編碼" align="center" width="100" />
          <el-table-column prop="number" label="計劃發貨數" align="center" width="100" />
          <el-table-column prop="shipped" label="已發貨數" align="center" width="100" />
          <el-table-column prop="not_shipped" label="未發貨數" align="center" width="100" />
          <el-table-column prop="procurement_invoice_no" label="採購發票號" align="center" width="120" />
          <el-table-column prop="order_remarks" label="訂單備註" align="center" width="100" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable width="120" />
          <el-table-column fixed="right" label="操作" width="190" align="center">
            <template #default="scope">
              <el-button
                v-permission="['deliveryPlanDetails']"
                type="success"
                text
                bg
                size="small"
                @click="handleView(scope.row)"
                >查看</el-button
              >
              <el-button
                v-permission="['deleteDeliveryPlan']"
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row.id)"
                >删除</el-button
              >
              <el-button type="warning" text bg size="small" @click="handleExport(scope.row)">導出</el-button>
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
  </div>
</template>

<style lang="scss" scoped></style>

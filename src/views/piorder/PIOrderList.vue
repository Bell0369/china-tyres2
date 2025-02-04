<script setup>
import { reactive, ref, watch, onActivated } from "vue"
import { Search, CirclePlus, Refresh, EditPen } from "@element-plus/icons-vue"
import { getPiListApi, deletePiListApi, updatePiQuantityApi, exportPIApi } from "@/api/order"
import { usePagination } from "@/hooks/usePagination"
import { useDeleteList } from "@/hooks/useDeleteList"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useRemarksSelect } from "@/hooks/useOrderRemarksSelect"
import { useUpdateQuantity } from "@/hooks/useUpdateQuantity"
import { handleActivated } from "@/utils/tagsclose"

defineOptions({
  name: "PIOrderList"
})

const loading = ref(false)

// 分页
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
  api: deletePiListApi,
  text: "PI"
})

// 修改柜量
const { handleUpdateQuantity, isQuantity } = useUpdateQuantity({
  api: updatePiQuantityApi
})

// 删除/修改柜量 成功
watch([isDeleted, isQuantity], () => {
  getTableData()
})

//查
const tableData = ref([])
const notShipped = ref(0)

const monthrangeData = ref(["", ""])

const searchFormRef = ref()
const searchData = reactive({
  keyword: "",
  client_code: "",
  brand_code: "",
  factory_code: "",
  order_remarks: ""
})
const getTableData = () => {
  loading.value = true
  const page = {
    start_date: monthrangeData.value[0],
    end_date: monthrangeData.value[1],
    page: paginationData.currentPage,
    page_size: paginationData.pageSize
  }
  Object.assign(searchData, page)
  getPiListApi(searchData)
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
  monthrangeData.value = ["", ""]
  handleSearch()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

onActivated(() => {
  if (handleActivated()) getTableData()
})

// 导出PI
const exportPI = (row) => {
  loading.value = true
  exportPIApi({ id: row.id })
    .then((data) => {
      const downloadLink = document.createElement("a")
      downloadLink.href = URL.createObjectURL(data)
      downloadLink.download = `${row.pi_no}.xlsx`
      downloadLink.click()
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
          <el-input v-model="searchData.keyword" placeholder="請輸入訂單號，PI號" style="width: 300px" />
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
        <div class="flex justify-between">
          <div>
            <el-button
              v-permission="['uploadPi']"
              type="primary"
              :icon="CirclePlus"
              tag="router-link"
              to="/piorder/piorderupload"
              >上傳PI</el-button
            >
          </div>
          <div>
            <el-text>未發貨PI總數量：</el-text>
            <el-text size="large" type="danger">{{ notShipped }}</el-text>
          </div>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table border :data="tableData">
          <el-table-column prop="pi_no" label="PI號" align="center" />
          <el-table-column prop="order_no" label="訂單號" align="center" />
          <el-table-column prop="client_code" label="客戶編碼" align="center" />
          <el-table-column prop="quantity" label="櫃量(40'HQ)" align="center">
            <template #default="scope">
              {{ scope.row.quantity }}
              <EditPen
                v-permission="['PiEditQuantity']"
                @click="handleUpdateQuantity(scope.row)"
                class="w4 h4 cursor-pointer hover:c-blue"
              />
            </template>
          </el-table-column>
          <el-table-column prop="product_total_number" label="PI數量" align="center" />
          <el-table-column prop="shipped" label="已發貨數" align="center" />
          <el-table-column prop="not_shipped" label="未發貨數" align="center" />
          <el-table-column prop="total_price" label="PI總金額" align="center" />
          <el-table-column prop="status" label="是否完成" align="center" width="100">
            <template #default="scope">
              <el-tag type="success" v-if="scope.row.status">已完成</el-tag>
              <el-tag type="danger" v-else>未完成</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="order_remarks" label="訂單備註" align="center" />
          <el-table-column prop="profit_margin" label="毛利率" align="center" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="200" align="center">
            <template #default="scope">
              <el-button
                v-permission="['piBasicDetail']"
                type="primary"
                text
                bg
                size="small"
                tag="router-link"
                :to="`/piorder/piorderitem?id=${scope.row.id}`"
                >查看</el-button
              >
              <el-button type="success" text bg size="small" @click="exportPI(scope.row)">下載</el-button>
              <el-button
                v-permission="['deletePi']"
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row.id)"
                >删除</el-button
              >
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

<script setup>
import { reactive, ref, watch, onActivated } from "vue"
import { ElButton, ElMessage, ElMessageBox } from "element-plus"
import { Search, CirclePlus, Refresh, EditPen, Upload } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import {
  getOrderListApi,
  updateQuantityApi,
  deleteOrderApi,
  updateOrderStatusApi,
  quickGenerationApi,
  exportOrderContractApi,
  exportNotCompletedOrderApi,
  exportNotCompletedOrderDetailApi
} from "@/api/order"
import { useBrandSelect, useFactoryCodeSelect } from "@/hooks/useSelectOption"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useRemarksSelect } from "@/hooks/useOrderRemarksSelect"
import { useDeleteList } from "@/hooks/useDeleteList"
import { useUpdateQuantity } from "@/hooks/useUpdateQuantity"
import { handleActivated } from "@/utils/tagsclose"

defineOptions({
  name: "OrderList"
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
  api: deleteOrderApi,
  text: "訂單？刪除訂單會連帶刪除PI、出貨計畫、發票等數據"
})

// 修改柜量
const { handleUpdateQuantity, isQuantity } = useUpdateQuantity({
  api: updateQuantityApi
})

// 删除/修改 成功
watch([isDeleted, isQuantity], () => {
  getTableData()
})

//# 查
const tableData = ref([])

const monthrangeData = ref(["", ""])

const searchFormRef = ref()
const searchData = reactive({
  keyword: "",
  client_code: "",
  brand_code: "",
  factory_code: "",
  order_remarks: "",
  status: 0
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
  getOrderListApi(searchData)
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

onActivated(() => {
  if (handleActivated()) getTableData()
})

// 切換完成狀態
const updataOrderStatus = () => {
  handleSearch()
}

// 完成订单
/**完成PI */
const connectUpdate = (id) => {
  ElMessageBox.confirm("確定完成訂單？", "提示", {
    confirmButtonText: "確定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      updateOrderStatusApi({
        id
      }).then(() => {
        ElMessage.success("訂單完成")
        getTableData()
      })
    })
    .catch(() => {})
}

// 一鍵生成PI
const dialogFormVisible = ref(false)
const dialogFormVisibleLoading = ref(false)
const quickGenerationForm = reactive({
  id: 0,
  date: "",
  factory_id: ""
})
const handelQuickGeneration = () => {
  dialogFormVisibleLoading.value = true
  quickGenerationApi(quickGenerationForm)
    .then(() => {
      ElMessage.success("成功生成PI")
      dialogFormVisible.value = false
    })
    .finally(() => {
      dialogFormVisibleLoading.value = false
    })
}
// 打開彈框
const handleShowDialogFormVisible = (id) => {
  dialogFormVisible.value = true
  quickGenerationForm.id = id
  quickGenerationForm.date = ""
  quickGenerationForm.factory_id = ""
}

// 导出導出訂單合同
const handelExportOrderContract = (row) => {
  const data = {
    id: row.id
  }
  exportFile(data, exportOrderContractApi, `訂單合同.${row.order_no}`)
}

// 導出未完成訂單匯總
const handleExportNotCompletedOrder = () => {
  exportFile({}, exportNotCompletedOrderApi, "未完成訂單匯總")
}

// 導出未完成訂單匯總明細
const handleExportNotCompletedOrderDetail = () => {
  exportFile({}, exportNotCompletedOrderDetailApi, "未完成訂單匯總明細")
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
            <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.short" />
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
      <div v-permission="['uploadOrder']" class="toolbar-wrapper">
        <router-link to="/order/orderupload" class="mr">
          <el-button type="primary" :icon="CirclePlus">上傳訂單</el-button>
        </router-link>
        <el-button type="warning" :icon="Upload" @click="handleExportNotCompletedOrder">導出未完成訂單匯總</el-button>
        <el-button type="warning" :icon="Upload" @click="handleExportNotCompletedOrderDetail">
          導出未完成訂單匯總明細
        </el-button>
      </div>
      <div class="mb5">
        <el-radio-group v-model="searchData.status" fill="#29d" @change="updataOrderStatus">
          <el-radio-button label="未完成" :value="0" />
          <el-radio-button label="已完成" :value="1" />
        </el-radio-group>
      </div>
      <div class="table-wrapper">
        <el-table :data="tableData" border>
          <el-table-column prop="order_no" label="訂單號" align="center" width="150" />
          <el-table-column prop="client_code" label="客戶編碼" align="center" min-width="100" />
          <el-table-column prop="quantity" label="櫃量(40'HQ)" align="center" min-width="120">
            <template #default="scope">
              {{ scope.row.quantity }}
              <EditPen
                v-permission="['editQuantity']"
                @click="handleUpdateQuantity(scope.row)"
                class="w4 h4 cursor-pointer hover:c-blue"
              />
            </template>
          </el-table-column>
          <el-table-column prop="price" label="訂單金額" align="center" min-width="100" />
          <el-table-column prop="number" label="訂單數量" align="center" min-width="100" />
          <el-table-column prop="unproduced" label="未生產數量" align="center" min-width="100" />
          <el-table-column prop="pi_number" label="PI數量" align="center" />
          <el-table-column prop="pi_shipped_number" label="PI已發貨數量" align="center" min-width="120" />
          <el-table-column prop="pi_not_shipped_number" label="PI未發貨數量" align="center" min-width="120" />
          <el-table-column prop="order_remarks" label="訂單備註" align="center" min-width="100" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable width="120" />
          <el-table-column fixed="right" label="操作" width="240" align="center">
            <template #default="scope">
              <el-button
                v-permission="['orderDetail']"
                type="success"
                text
                bg
                size="small"
                tag="router-link"
                :to="`/order/orderitem?id=${scope.row.id}`"
                >查看</el-button
              >
              <el-button
                v-permission="['deleteOrder']"
                type="danger"
                text
                bg
                size="small"
                @click="handleDelete(scope.row.id)"
                >删除</el-button
              >
              <el-button type="primary" size="small" @click="connectUpdate(scope.row.id)" v-if="!searchData.status">
                完成
              </el-button>
              <el-button
                class="mt-2"
                type="primary"
                size="small"
                @click="handleShowDialogFormVisible(scope.row.id)"
                v-if="!searchData.status"
              >
                一鍵生成PI
              </el-button>
              <el-button
                :class="{ 'mt-2': !searchData.status }"
                type="warning"
                size="small"
                plain
                @click="handelExportOrderContract(scope.row)"
              >
                導出訂單合同
              </el-button>
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

    <!-- 一鍵生成PI彈框 -->
    <el-dialog v-model="dialogFormVisible" title="一鍵生成PI" width="500">
      <el-form :model="quickGenerationForm">
        <el-form-item label="日期">
          <el-date-picker v-model="quickGenerationForm.date" type="month" style="width: 100%" value-format="YYYY-MM" />
        </el-form-item>
        <el-form-item label="工廠">
          <el-select v-model="quickGenerationForm.factory_id">
            <el-option v-for="item in factoryCodeOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handelQuickGeneration" :loading="dialogFormVisibleLoading">
            確定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>

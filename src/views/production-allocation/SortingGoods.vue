<script setup>
import { reactive, ref, watch, onActivated } from "vue"
import { getSortingGoodsListApi, createPiDataApi, submitCreatePiDataApi } from "@/api/product"
import { ElButton } from "element-plus"
import { Search, CirclePlus, Refresh } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { handleActivated } from "@/utils/tagsclose"

defineOptions({
  name: "SortingGoods"
})

const loading = ref(false)

const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 查
const tableData = ref([])
const searchFormRef = ref(null)
const searchData = reactive({
  monthrangeData: ""
})
const getTableData = () => {
  const monthrangeData = {}
  if (searchData.monthrangeData) {
    monthrangeData.start_date = searchData.monthrangeData[0]
    monthrangeData.end_date = searchData.monthrangeData[1]
  }

  loading.value = true
  getSortingGoodsListApi({
    page: paginationData.currentPage,
    page_size: paginationData.pageSize,
    ...monthrangeData
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

// 激活
onActivated(() => {
  if (handleActivated()) getTableData()
})

// 重置
const resetSearch = () => {
  searchFormRef.value?.resetFields()
  handleSearch()
}

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })

//  一鍵生成PI彈窗的列表
const dialogPiTableVisible = ref(false)
const dialogPiTableLoading = ref(false)
const PiTableData = ref([])
const handleCreatePiData = (id) => {
  dialogPiTableLoading.value = true
  dialogPiTableVisible.value = true
  createPiDataApi({
    id
  })
    .then(({ data }) => {
      PiTableData.value = data
    })
    .finally(() => {
      dialogPiTableLoading.value = false
    })
}

// 是否可选
const tableRef = ref(null)
const selectable = (row) => {
  if (row.status) return false
  else return true
}

// 提交生成PI
const submitCreatePiBtnLoading = ref(false)
const submitCreatePiData = () => {
  submitCreatePiBtnLoading.value = true
  const selectedIds = tableRef.value.getSelectionRows().map((item) => item.id)
  submitCreatePiDataApi({
    sorting_goods_order_ids: selectedIds
  })
    .then(() => {
      ElMessage.success("PI生成成功")
      dialogPiTableVisible.value = false
    })
    .finally(() => {
      setTimeout(() => {
        submitCreatePiBtnLoading.value = false
      }, 1000)
    })
}
</script>

<template>
  <div class="app-container">
    <el-card shadow="never" class="search-wrapper">
      <el-form ref="searchFormRef" :inline="true" :model="searchData">
        <el-form-item prop="monthrangeData" label="日期范围">
          <el-date-picker
            v-model="searchData.monthrangeData"
            type="daterange"
            range-separator="-"
            start-placeholder="開始日期"
            end-placeholder="結束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查詢</el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading" shadow="never">
      <div class="toolbar-wrapper">
        <div>
          <router-link to="/production-allocation/uploadsortinggoods">
            <el-button type="primary" :icon="CirclePlus">上傳庫存/生產</el-button>
          </router-link>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table border :data="tableData">
          <el-table-column prop="no" label="分貨編號" align="center" />
          <el-table-column prop="already_total_number" label="已分貨總數" align="center" />
          <el-table-column prop="already_total_quantity" label="已分貨櫃量" align="center" />
          <el-table-column prop="not_total_number" label="未分貨總數" align="center" />
          <el-table-column prop="not_total_quantity" label="未分貨櫃量" align="center" />
          <el-table-column prop="created_at" label="创建时间" align="center" sortable />
          <el-table-column fixed="right" label="操作" width="180" align="center">
            <template #default="scope">
              <el-button
                type="success"
                text
                bg
                size="small"
                tag="router-link"
                :to="`/production-allocation/sortinggoodsitem?id=${scope.row.id}`"
              >
                查看
              </el-button>
              <el-button type="primary" size="small" @click="handleCreatePiData(scope.row.id)">一鍵生成PI</el-button>
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

    <el-dialog v-model="dialogPiTableVisible" title="一鍵生成PI" width="95%">
      <div v-loading="dialogPiTableLoading">
        <el-table :data="PiTableData" ref="tableRef" max-height="500">
          <el-table-column property="id" type="selection" width="55" align="center" :selectable="selectable" />
          <el-table-column property="order_no" label="訂單號" min-width="200" />
          <el-table-column property="order_remarks" label="訂單備註">
            <template #default="scope">
              <div>{{ scope.row.order_remarks || "----" }}</div>
            </template>
          </el-table-column>
          <el-table-column property="total_number" label="訂單總數" />
          <el-table-column property="already_sorting_goods_total_number" label="已分貨數量" />
          <el-table-column property="not_sorting_goods_total_number" label="未分貨數量" />
          <el-table-column property="already_quantity_total_number" label="已分貨櫃量" />
          <el-table-column property="not_quantity_total_number" label="未分貨櫃量" />
          <el-table-column property="status" label="PI狀態">
            <template #default="scope">
              <el-tag :type="scope.row.status ? 'success' : 'danger'">
                {{ scope.row.status ? "已生成PI" : "未生成PI" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button type="primary" @click="submitCreatePiData" :loading="submitCreatePiBtnLoading"> 生成PI </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>

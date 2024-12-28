import { request } from "@/utils/service"

/** 工廠代碼配置 */
//  查
export function getFactoryListApi(params) {
  return request({
    url: "config/factoryCode",
    method: "get",
    params
  })
}
//  加
export function addFactoryListApi(data) {
  return request({
    url: "config/addFactoryCode",
    method: "post",
    data
  })
}

// 刪
export function deleteFactoryCodeApi(data) {
  return request({
    url: "config/deleteFactoryCode",
    method: "post",
    data
  })
}

/** 品牌配置 */
//  查
export function getBrandListApi(params) {
  return request({
    url: "config/brand",
    method: "get",
    params
  })
}
//  加
export function addBrandListApi(data) {
  return request({
    url: "config/addBrand",
    method: "post",
    data
  })
}

/** 發貨方式配置 */
//  查
export function getDeliveryListApi(params) {
  return request({
    url: "config/deliveryMethod",
    method: "get",
    params
  })
}

//  加
export function addDeliveryListApi(data) {
  return request({
    url: "config/addDeliveryMethod",
    method: "post",
    data
  })
}

/** 付款條件配置 */
//  查
export function getPaymentTermsApi(params) {
  return request({
    url: "config/paymentTerms",
    method: "get",
    params
  })
}

//  加
export function addPaymentTermsApi(data) {
  return request({
    url: "config/addPaymentTerms",
    method: "post",
    data
  })
}

/**訂單備注配置列表 */
//  查
export function getOrderRemarksConfigListApi(params) {
  return request({
    url: "config/orderRemarksConfigList",
    method: "get",
    params
  })
}

//  加
export function addOrderRemarksConfigApi(data) {
  return request({
    url: "config/addOrderRemarksConfig",
    method: "post",
    data
  })
}

//  刪
export function deleteOrderRemarksConfigApi(data) {
  return request({
    url: "config/deleteOrderRemarksConfig",
    method: "post",
    data
  })
}

// 國家地區
export function getCountriesAreaApi(params) {
  return request({
    url: "common/getCountriesArea",
    method: "get",
    params
  })
}

// 部門列表
export function getDepartmentApi(params) {
  return request({
    url: "auth/roleList",
    method: "get",
    params
  })
}

/**數據統計 */
// 銷售總體概況
export function getStatisticSalesVolumeApi(params) {
  return request({
    url: "report/statisticSalesVolume",
    method: "get",
    params
  })
}

// 根據客戶統計
export function getStatisticClientTargetApi(params) {
  return request({
    url: "report/statisticClientTarget",
    method: "get",
    params
  })
}

/** 導出 */
// 导出發票
export function exportInvApi(params) {
  return request({
    url: "inv/exportInv",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出裝箱單
export function exportPackingListApi(params) {
  return request({
    url: "inv/exportPackingList",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出SN
export function exportSNApi(params) {
  return request({
    url: "inv/exportSN",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出WeightNoteApi
export function exportWeightNoteApi(params) {
  return request({
    url: "report/exportWeightNote",
    method: "post",
    responseType: "blob",
    params
  })
}

// 發貨流水賬導出
export function exportTheShipmentLedgerApi(params) {
  return request({
    url: "report/exportTheShipmentLedger",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出銷售實時情況
export function exportSellRealSituationApi(params) {
  return request({
    url: "report/exportSellRealSituation",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出業務台帳
export function exportBusinessApi(params) {
  return request({
    url: "report/exportBusiness",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出訂單全流程
export function exportOrderCompleteFlowSchemeApi(data) {
  return request({
    url: "report/exportOrderCompleteFlowScheme",
    method: "post",
    responseType: "blob",
    data
  })
}

// 導出客戶銷售總覽
export function exportClientSellOverviewApi(params) {
  return request({
    url: "report/exportClientSellOverview",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出sales data（業務員）
export function exportSalesDataSalesmanApi(params) {
  return request({
    url: "report/exportSalesDataSalesman",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出sales data（管理員）
export function exportSalesDataAdminApi(params) {
  return request({
    url: "report/exportSalesDataAdmin",
    method: "post",
    responseType: "blob",
    params
  })
}

// 1=訂單、2=客戶、3=工廠、4=發貨計劃、5=用戶 -- 選擇對象
export function getOptionsApi(params) {
  return request({
    url: "common/options",
    method: "get",
    params
  })
}

// 導出客戶產品
export function exportClientProductApi(params) {
  return request({
    url: "client/exportClientProduct",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出工廠產品
export function exportFactoryProductApi(params) {
  return request({
    url: "factory/exportFactoryProduct",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出發票，裝箱單，SN到一起
export function exportAllApi(params) {
  return request({
    url: "report/exportAll",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出訂單總覽
export function exportOrderGeneralViewApi(data) {
  return request({
    url: "report/exportOrderGeneralView",
    method: "post",
    responseType: "blob",
    data
  })
}

// 導出未排產訂單數量
export function exportOrderUnscheduledProductionApi(params) {
  return request({
    url: "report/exportOrderUnscheduledProduction",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出銷售單價匯總
export function exportSalesUnitPriceQuantitySummaryApi(params) {
  return request({
    url: "report/exportSalesUnitPriceQuantitySummary",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出公斤单价
export function exportKilogramUnitPriceApi(params) {
  return request({
    url: "report/exportKilogramUnitPrice",
    method: "post",
    responseType: "blob",
    params
  })
}

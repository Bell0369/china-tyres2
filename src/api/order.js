import { request } from "@/utils/service"

/** 訂單管理-列表 */
// 查
export function getOrderListApi(params) {
  return request({
    url: "order/orderList",
    method: "get",
    params
  })
}

// 刪
export function deleteOrderApi(data) {
  return request({
    url: "order/deleteOrder",
    method: "post",
    data
  })
}

// 修改柜量
export function updateQuantityApi(data) {
  return request({
    url: "order/editQuantity",
    method: "post",
    data
  })
}

// 上传订单
export function uploadOrderApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "order/uploadOrder",
    method: "post",
    data
  })
}

// 订单详情
// 详情基本信息
export function getOrderDetailApi(params) {
  return request({
    url: "order/orderDetail",
    method: "get",
    params
  })
}

// 产品信息
export function getOrderDetailProductApi(params) {
  return request({
    url: "order/orderDetailProduct",
    method: "get",
    params
  })
}

// 订单产品ETD时间查询options
export function getEtdOptionsApi(params) {
  return request({
    url: "order/etdOptions",
    method: "get",
    params
  })
}

// 订单产品ETD时间查询
export function getEtdOrderProductSelectApi(params) {
  return request({
    url: "order/etdOrderProductSelect",
    method: "get",
    params
  })
}

/** PI订单 */
// 列表
export function getPiListApi(params) {
  return request({
    url: "order/piList",
    method: "get",
    params
  })
}

// 刪
export function deletePiListApi(data) {
  return request({
    url: "order/deletePi",
    method: "post",
    data
  })
}

// 導出
export function exportPIApi(params) {
  return request({
    url: "order/exportPI",
    method: "post",
    responseType: "blob",
    params
  })
}

// 上传PI
export function uploadPiApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "order/uploadPi",
    method: "post",
    data
  })
}

// PI基本信息
export function getPiBasicDetailApi(params) {
  return request({
    url: "order/piBasicDetail",
    method: "get",
    params
  })
}

// PI产品信息
export function getPiProductDetailApi(params) {
  return request({
    url: "order/piProductDetail",
    method: "get",
    params
  })
}

// 完成PI
export function accomplishPApi(data) {
  return request({
    url: "order/accomplishPI",
    method: "post",
    data
  })
}

// 修改PI数量
export function updatePiNumberApi(data) {
  return request({
    url: "order/editPiNumber",
    method: "post",
    data
  })
}

// 修改柜量
export function updatePiQuantityApi(data) {
  return request({
    url: "order/PiEditQuantity",
    method: "post",
    data
  })
}

// 生成发货计划-上传文件
export function uploadPiQuantityPlanApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "order/uploadDeliveryPlan",
    method: "post",
    data
  })
}

// 生成发货计划-從PI導入
export function uploadPIDeliveryPlanApi(data) {
  return request({
    url: "order/PIDeliveryPlan",
    method: "post",
    data
  })
}

// 申請審批
export function deliveryPlanApplyCheckApi(data) {
  return request({
    url: "delivery/deliveryPlanApplyCheck",
    method: "post",
    data
  })
}

// 審批審核
export function getDeliveryPlanCheckApi(data) {
  return request({
    url: "delivery/deliveryPlanCheck",
    method: "post",
    data
  })
}

/** 發貨計劃 */
// 列表
export function getDeliveryPlanListApi(params) {
  return request({
    url: "delivery/deliveryPlanList",
    method: "get",
    params
  })
}

// 刪
export function deleteDeliveryPlanApi(data) {
  return request({
    url: "delivery/deleteDeliveryPlan",
    method: "post",
    data
  })
}

// 生成销售发票
export function createInvApi(data) {
  return request({
    url: "delivery/createInv",
    method: "post",
    data
  })
}

// 導出發貨計劃
export function exportDeliveryPlanApi(data) {
  return request({
    url: "delivery/exportDeliveryPlan",
    method: "post",
    responseType: "blob",
    data
  })
}

// 查詢發貨計劃號
export function getDeliveryPlanNoApi(params) {
  return request({
    url: "delivery/searchDeliveryPlanNo",
    method: "get",
    params
  })
}

// 上傳發貨計劃
export function uploadPackingListApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "delivery/uploadPackingList",
    method: "post",
    data
  })
}

// 詳情
export function getDeliveryPlanDetailsApi(params) {
  return request({
    url: "delivery/deliveryPlanDetails",
    method: "get",
    params
  })
}

// 詳情 - 產品
export function getDeliveryPlanProductApi(params) {
  return request({
    url: "delivery/deliveryPlanProduct",
    method: "get",
    params
  })
}

/** 销售发票 */
// 列表
export function getInvListApi(params) {
  return request({
    url: "inv/invList",
    method: "get",
    params
  })
}

// 刪
export function deleteSellInvApi(data) {
  return request({
    url: "inv/deleteSellInv",
    method: "post",
    data
  })
}

// 詳情
export function getinvDetailApi(params) {
  return request({
    url: "inv/invDetail",
    method: "get",
    params
  })
}

// 修改發票
export function updateInvApi(data) {
  return request({
    url: "inv/editInv",
    method: "post",
    data
  })
}

/** 應收應付 */
// 應收
export function getClientProceedsApi(params) {
  return request({
    url: "receipt/clientProceeds",
    method: "get",
    params
  })
}
// 應付
export function getFactoryCopeApi(params) {
  return request({
    url: "receipt/factoryCope",
    method: "get",
    params
  })
}

// 客户or工厂添加金额
export function AddPriceApi(data) {
  return request({
    url: "receipt/addPrice",
    method: "post",
    data
  })
}

// 添加金额记录列表
export function getAddPayRecordApi(params) {
  return request({
    url: "receipt/addPayRecord",
    method: "get",
    params
  })
}

// 客户or工厂确认收款
export function getConfirmReceiptApi(data) {
  return request({
    url: "receipt/confirmReceipt",
    method: "post",
    data
  })
}

/** 预付款 */
// 客户
export function getClientAdvancePaymentApi(params) {
  return request({
    url: "receipt/clientAdvancePayment",
    method: "get",
    params
  })
}
// 工厂
export function getFactoryAdvancePaymentApi(params) {
  return request({
    url: "receipt/factoryAdvancePayment",
    method: "get",
    params
  })
}

// 客戶初始金額記錄列表
export function getClientPrimitivePriceListApi(params) {
  return request({
    url: "receipt/clientPrimitivePriceList",
    method: "get",
    params
  })
}

// 添加客戶初始金額記錄
export function AddClientPrimitivePriceApi(data) {
  return request({
    url: "receipt/clientPrimitivePrice",
    method: "post",
    data
  })
}

// 財務確認客戶應收
export function AffirmClientReceivableApi(data) {
  return request({
    url: "receipt/affirmReceivable",
    method: "post",
    data
  })
}

// 工廠初始金額記錄列表
export function getFactoryPrimitivePriceListApi(params) {
  return request({
    url: "receipt/factoryPrimitivePriceList",
    method: "get",
    params
  })
}

// 添加工廠初始金額記錄
export function AddFactoryPrimitivePriceApi(data) {
  return request({
    url: "receipt/factoryPrimitivePrice",
    method: "post",
    data
  })
}

// 財務確認工廠應付
export function AffirmFactoryReceivableApi(data) {
  return request({
    url: "receipt/affirmFactoryReceivable",
    method: "post",
    data
  })
}

// 發票導出PDF數據
export function exportInvToPdfApi(data) {
  return request({
    url: "inv/exportInvToPdf",
    method: "post",
    data
  })
}

// 發票導出PDF數據
export function exportPackingListToPdfApi(data) {
  return request({
    url: "inv/exportPackingListToPdf",
    method: "post",
    data
  })
}

// 財務操作客戶應收
export function editClientPayRecord(data) {
  return request({
    url: "receipt/editClientPayRecord",
    method: "post",
    data
  })
}

// 應收初始金額記錄刪除
export function deleteClientPrimitivePriceRecordApi(data) {
  return request({
    url: "receipt/deleteClientPrimitivePriceRecord",
    method: "post",
    data
  })
}

// 應收-添加金額記錄-刪除
export function deleteClientPayRecordApi(data) {
  return request({
    url: "receipt/deleteClientPayRecord",
    method: "post",
    data
  })
}

// 應付-初始金額記錄刪除
export function deleteFactoryPrimitivePriceRecordApi(data) {
  return request({
    url: "receipt/deleteFactoryPrimitivePriceRecord",
    method: "post",
    data
  })
}

// 應付-添加金額記錄-刪除
export function deleteFactoryPayRecordApi(data) {
  return request({
    url: "receipt/deleteFactoryPayRecord",
    method: "post",
    data
  })
}

// 完成訂單
export function updateOrderStatusApi(data) {
  return request({
    url: "order/updateOrderStatus",
    method: "post",
    data
  })
}

// 操作記錄
export function getRecordsListApi(params) {
  return request({
    url: "records/list",
    method: "get",
    params
  })
}

// 操作記錄詳情
export function getDetailApi(params) {
  return request({
    url: "records/detail",
    method: "get",
    params
  })
}

// 导出PI未发货数产品明细
export function exportPiNotShippedDetailsApi(params) {
  return request({
    url: "order/exportPiNotShippedDetails",
    method: "post",
    responseType: "blob",
    params
  })
}

// 一鍵生成PI
export function quickGenerationApi(data) {
  return request({
    url: "order/quickGeneration",
    method: "post",
    data
  })
}

// 導出訂單合同
export function exportOrderContractApi(params) {
  return request({
    url: "order/exportOrderContract",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出未完成訂單匯總
export function exportNotCompletedOrderApi(params) {
  return request({
    url: "order/exportNotCompletedOrder",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出未完成訂單匯總明細
export function exportNotCompletedOrderDetailApi(params) {
  return request({
    url: "order/exportNotCompletedOrderDetail",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出發貨計劃列表
export function exportDeliveryPlanListApi(params) {
  return request({
    url: "delivery/exportDeliveryPlanList",
    method: "post",
    responseType: "blob",
    params
  })
}

// 導出已发货规格明细
export function exportShippedProductDetailsApi(params) {
  return request({
    url: "delivery/exportShippedProductDetails",
    method: "post",
    responseType: "blob",
    params
  })
}

// 内陸費用列表
export function getInlandFeeListApi(params) {
  return request({
    url: "inv/inlandFeeList",
    method: "get",
    params
  })
}

// 更新内陸費用狀態
export function updateInlandStatusApi(data) {
  return request({
    url: "inv/updateInlandStatus",
    method: "post",
    data
  })
}

// 导出内陆费用登记表
export function exportInlandFeeApi(params) {
  return request({
    url: "inv/exportInlandFee",
    method: "post",
    responseType: "blob",
    params
  })
}

// 獲取最新成本價
export function getNewCostPriceApi(data) {
  return request({
    url: "delivery/getNewCostPrice",
    method: "post",
    data
  })
}

// 獲取最新銷售價
export function getNewSalesPriceApi(data) {
  return request({
    url: "delivery/getNewSalesPrice",
    method: "post",
    data
  })
}

// 獲取目的港
export function getDestinationApi(params) {
  return request({
    url: "delivery/getDestination",
    method: "get",
    params
  })
}

// 批量生成發貨計劃
export function createDeliveryPlanBatchApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "order/createDeliveryPlanBatch",
    method: "post",
    data
  })
}

// 獲取内陸費用信息
export function getInlandFeeApi(params) {
  return request({
    url: "inv/getInlandFee",
    method: "get",
    params
  })
}

// 更新内陸費用信息
export function updateInlandFeeApi(data) {
  return request({
    url: "inv/updateInlandFee",
    method: "post",
    data
  })
}

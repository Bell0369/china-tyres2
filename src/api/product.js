import { request } from "@/utils/service"

/**產品管理-列表 */
// 查
export function getProductListApi(params) {
  return request({
    url: "product/productList",
    method: "get",
    params
  })
}

// 導出
export function exportProductApi(data) {
  return request({
    url: "product/exportProduct",
    method: "post",
    responseType: "blob",
    data
  })
}

// 看
export function getProductShowApi(params) {
  return request({
    url: "product/productShow",
    method: "get",
    params
  })
}

// 改
export function updateProductApi(data) {
  return request({
    url: "product/addProduct",
    method: "post",
    data
  })
}

// 删
export function deleteProductApi(data) {
  return request({
    url: "product/deleteProduct",
    method: "post",
    data
  })
}

/* 排產分貨 **/
// 排產列表
export function getProductionSchedulingListApi(params) {
  return request({
    url: "production_scheduling/productionSchedulingList",
    method: "get",
    params
  })
}

// 導出排產
export function exportProductionSchedulingApi(params) {
  return request({
    url: "production_scheduling/exportProductionScheduling",
    method: "post",
    responseType: "blob",
    params
  })
}

// 刪除排產
export function deleteProduApictionSchedulingApi(data) {
  return request({
    url: "production_scheduling/deleteProductionScheduling",
    method: "post",
    data
  })
}

// 上傳排產
export function uploadProductionSchedulingApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "production_scheduling/uploadProductionScheduling",
    method: "post",
    data
  })
}

// 提交排產
export function submitProductionSchedulingApi(data) {
  return request({
    url: "production_scheduling/submitProductionScheduling",
    method: "post",
    data
  })
}

// 排產詳請
export function getProductionSchedulingDetailApi(params) {
  return request({
    url: "production_scheduling/productionSchedulingDetail",
    method: "get",
    params
  })
}

// 详情产品移除
export function productionSchedulingProductDeleteApi(data) {
  return request({
    url: "production_scheduling/productionSchedulingProductDelete",
    method: "post",
    data
  })
}

/* 分货 **/
// 分货列表
export function getSortingGoodsListApi(params) {
  return request({
    url: "sorting_goods/sortingGoodsList",
    method: "get",
    params
  })
}

// 一鍵生成PI彈窗的列表
export function createPiDataApi(params) {
  return request({
    url: "sorting_goods/createPiData",
    method: "get",
    params
  })
}

// 提交生成PI
export function submitCreatePiDataApi(data) {
  return request({
    url: "sorting_goods/submitCreatePiData",
    method: "post",
    data
  })
}

// 上傳分貨
export function uploadSortingGoodsApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "sorting_goods/uploadSortingGoods",
    method: "post",
    data
  })
}

// 提交分貨
export function submitSortingGoodsApi(data) {
  return request({
    url: "sorting_goods/submitSortingGoods",
    method: "post",
    data
  })
}

// 分货详情
export function getSortingGoodsDetailApi(params) {
  return request({
    url: "sorting_goods/sortingGoodsDetail",
    method: "get",
    params
  })
}

// 無訂單庫存導出
export function exportNoOrderDetailApi(params) {
  return request({
    url: "sorting_goods/exportNoOrderDetail",
    method: "post",
    responseType: "blob",
    params
  })
}

// 下載明細
export function exportSortingGoodsProductDetailApi(params) {
  return request({
    url: "sorting_goods/exportSortingGoodsProductDetail",
    method: "post",
    responseType: "blob",
    params
  })
}

// 追加规格
export function additionProductApi(data) {
  return request({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    url: "sorting_goods/additionProduct",
    method: "post",
    data
  })
}

// 使用手冊
export function getDownloadSysDocApi(params) {
  return request({
    url: "common/downloadSysDoc",
    method: "get",
    params
  })
}

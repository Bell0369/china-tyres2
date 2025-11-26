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
// 導出排產
export function exportProductionSchedulingApi(params) {
  return request({
    url: "production_scheduling/exportProductionScheduling",
    method: "post",
    responseType: "blob",
    params
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
    url: "user/userList",
    method: "get",
    params
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

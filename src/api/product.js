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
export function exportProductApi(params) {
  return request({
    url: "product/exportProduct",
    method: "post",
    responseType: "blob",
    params
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
export function updateProductApi(params) {
  return request({
    url: "product/addProduct",
    method: "post",
    params
  })
}

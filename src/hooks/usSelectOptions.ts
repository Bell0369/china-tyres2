import { ref } from "vue"
import { getDeliveryListApi } from "@/api/selects"

// 發貨類型
export function useDeliverType() {
  const deliverTypeArr2 = ref([])
  // const { data } = getDeliveryListApi()
  getDeliveryListApi().then(({ data }) => {
    console.log(data)
    deliverTypeArr2.value = data
  })
  return deliverTypeArr2
}

// 區號
const codeArr = ["86", "852", "1", "44", "91", "81", "49", "7", "82", "39", "33", "34", "61", "64", "52"]

// 付款條件
const paymentTermsArr = ["付款条件A", "付款条件B", "付款条件C", "付款条件D"]

// 發貨類型
const deliverTypeArr = ["CTD", "DIR", "WH"]

export function useSelectOptions() {
  return { deliverTypeArr, paymentTermsArr, codeArr }
}

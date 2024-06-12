import { ref } from "vue"
import { getOrderListApi } from "@/api/order"
import { debounce } from "lodash-es"

type OptionValue = string | number

/** Select 需要的数据格式 */
interface SelectOption {
  value: OptionValue
  label: string
  disabled?: boolean
}

export function useOrderSelet() {
  const loadOrder = ref<boolean>(false)
  const optionsOrder = ref<SelectOption[]>([])
  const keyword = ref<string>("")

  const loadOrderData = (query: string) => {
    loadOrder.value = true
    keyword.value = query
    getUserListThrottled()
  }

  /** 调用接口获取数据 */
  const remoteMethod = () => {
    getOrderListApi({
      page_size: 20,
      keyword: keyword.value
    })
      .then(({ data }) => {
        optionsOrder.value = data.data
      })
      .catch(() => {
        optionsOrder.value = []
      })
      .finally(() => {
        loadOrder.value = false
      })
  }

  // 节流
  const getUserListThrottled = debounce(remoteMethod, 500)

  return {
    loadOrder,
    optionsOrder,
    loadOrderData
  }
}

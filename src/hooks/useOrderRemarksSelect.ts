import { ref } from "vue"
import { getOrderRemarksConfigListApi } from "@/api/selects"
import { debounce } from "lodash-es"

type OptionValue = string | number

/** Select 需要的数据格式 */
interface SelectOption {
  id: OptionValue
  content: string
}

export function useRemarksSelect() {
  const optionsRemarks = ref<SelectOption[]>([])
  const loadRemarks = ref(false)
  const keyword = ref<string>("")

  const loadRemarksData = (query: string) => {
    console.log(query)

    loadRemarks.value = true
    keyword.value = query
    getListThrottled()
  }

  /** 调用接口获取数据 */
  const remoteMethod = () => {
    getOrderRemarksConfigListApi({
      page: 1,
      pageSize: 20,
      keyword: keyword.value
    })
      .then(({ data }) => {
        optionsRemarks.value = data.data
      })
      .catch(() => {
        optionsRemarks.value = []
      })
      .finally(() => {
        loadRemarks.value = false
      })
  }

  // 节流
  const getListThrottled = debounce(remoteMethod, 300)

  return {
    loadRemarks,
    optionsRemarks,
    loadRemarksData
  }
}

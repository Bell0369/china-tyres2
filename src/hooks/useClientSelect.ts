import { ref } from "vue"
import { getOptionsApi } from "@/api/selects"
import { debounce } from "lodash-es"

type OptionValue = string | number

/** Select 需要的数据格式 */
interface SelectOption {
  value: OptionValue
  label: string
  disabled?: boolean
}

export function useClientSelect() {
  const loadClient = ref<boolean>(false)
  const optionsClient = ref<SelectOption[]>([])
  const keyword = ref<string>("")

  const loadClientData = (query: string) => {
    loadClient.value = true
    keyword.value = query

    if (query) {
      getUserListThrottled()
    } else {
      remoteMethod()
    }
  }

  /** 调用接口获取数据 */
  const remoteMethod = () => {
    getOptionsApi({
      type: 2,
      keyword: keyword.value
    })
      .then(({ data }) => {
        optionsClient.value = data
      })
      .catch(() => {
        optionsClient.value = []
      })
      .finally(() => {
        loadClient.value = false
      })
  }

  // 节流，3秒调起一次
  const getUserListThrottled = debounce(remoteMethod, 500)

  return {
    loadClient,
    optionsClient,
    loadClientData
  }
}

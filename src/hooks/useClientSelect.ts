import { ref } from "vue"
import { getClientListApi } from "@/api/users"
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
    getClientListApi({
      page_size: 20,
      keyword: keyword.value
    })
      .then(({ data }) => {
        optionsClient.value = data.data
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

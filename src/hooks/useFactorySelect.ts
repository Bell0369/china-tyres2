import { ref } from "vue"
import { getFactoryListApi } from "@/api/users"
import { debounce } from "lodash-es"

type OptionValue = string | number

/** Select 需要的数据格式 */
interface SelectOption {
  value: OptionValue
  label: string
  disabled?: boolean
}

export function useFactorySelect() {
  const loadFactory = ref<boolean>(false)
  const optionsFactory = ref<SelectOption[]>([])
  const keyword = ref<string>("")

  const loadFactoryData = (query: string) => {
    loadFactory.value = true
    keyword.value = query
    getUserListThrottled()
  }

  /** 调用接口获取数据 */
  const remoteMethod = () => {
    getFactoryListApi({
      page_size: 20,
      keyword: keyword.value
    })
      .then(({ data }) => {
        optionsFactory.value = data.data
      })
      .catch(() => {
        optionsFactory.value = []
      })
      .finally(() => {
        loadFactory.value = false
      })
  }

  // 节流
  const getUserListThrottled = debounce(remoteMethod, 500)

  return {
    loadFactory,
    optionsFactory,
    loadFactoryData
  }
}

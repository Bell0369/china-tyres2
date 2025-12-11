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

export function useOptionsSelect() {
  const loadOptions = ref<boolean>(false)
  const SelectOptions = ref<SelectOption[]>([])
  const keyword = ref<string>("")
  const optionsType = ref<number>(1)

  const loadOptionsData = (query: string, type: number) => {
    loadOptions.value = true
    keyword.value = query
    optionsType.value = type

    if (query) {
      getOptionsThrottled()
    } else {
      remoteMethod()
    }
  }

  /** 调用接口获取数据 */
  const remoteMethod = () => {
    getOptionsApi({
      type: optionsType.value,
      keyword: keyword.value
    })
      .then(({ data }) => {
        SelectOptions.value = data
      })
      .catch(() => {
        SelectOptions.value = []
      })
      .finally(() => {
        loadOptions.value = false
      })
  }

  // 节流，3秒调起一次
  const getOptionsThrottled = debounce(remoteMethod, 500)

  return {
    loadOptions,
    SelectOptions,
    loadOptionsData
  }
}

import { ref } from "vue"
import { getBankConfigListApi } from "@/api/selects"
import { debounce } from "lodash-es"

type OptionValue = string | number

/** Select 需要的数据格式 */
interface SelectOption {
  value: OptionValue
  label: string
  disabled?: boolean
}

export function useBankSelect() {
  const loadBank = ref<boolean>(false)
  const optionsBank = ref<SelectOption[]>([])
  const keyword = ref<string>("")

  const loadBankData = (query: string) => {
    loadBank.value = true
    keyword.value = query

    if (query) {
      getUserListThrottled()
    } else {
      remoteMethod()
    }
  }

  /** 调用接口获取数据 */
  const remoteMethod = () => {
    getBankConfigListApi({
      keyword: keyword.value,
      page: 1,
      page_size: 50
    })
      .then(({ data }) => {
        optionsBank.value = data.data
      })
      .catch(() => {
        optionsBank.value = []
      })
      .finally(() => {
        loadBank.value = false
      })
  }

  // 节流，3秒调起一次
  const getUserListThrottled = debounce(remoteMethod, 500)

  return {
    loadBank,
    optionsBank,
    loadBankData
  }
}

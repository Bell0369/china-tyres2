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

export function useUserSelect() {
  const loadUser = ref<boolean>(false)
  const optionsUser = ref<SelectOption[]>([])
  const keyword = ref<string>("")

  const loadUserData = (query: string) => {
    loadUser.value = true
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
      type: 5,
      keyword: keyword.value
    })
      .then(({ data }) => {
        optionsUser.value = data
      })
      .catch(() => {
        optionsUser.value = []
      })
      .finally(() => {
        loadUser.value = false
      })
  }

  // 节流，3秒调起一次
  const getUserListThrottled = debounce(remoteMethod, 500)

  return {
    loadUser,
    optionsUser,
    loadUserData
  }
}

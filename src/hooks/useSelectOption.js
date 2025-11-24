import { ref, onMounted } from "vue"
import {
  getBrandListApi,
  getDeliveryListApi,
  getFactoryListApi,
  getDepartmentApi,
  getPaymentTermsApi,
  getPayerListApi,
  getFreightForwarderListApi,
  getOriginatingListApi
} from "@/api/selects"

// 獲取品牌
export function useBrandSelect() {
  const brandOptions = ref([])
  const getBrandList = () => {
    getBrandListApi().then(({ data }) => {
      brandOptions.value = data
    })
  }
  onMounted(() => {
    getBrandList()
  })

  return {
    brandOptions
  }
}

// 獲取發貨類型
export function useeDeliverTypeSelect() {
  const eDeliverTypeOptions = ref([])
  const getBrandList = () => {
    getDeliveryListApi().then(({ data }) => {
      eDeliverTypeOptions.value = data
    })
  }
  onMounted(() => {
    getBrandList()
  })

  return {
    eDeliverTypeOptions
  }
}

// 獲取付款條件
export function usePayMentSelect() {
  // 區號
  const codeArr = ["86", "852", "1", "44", "91", "81", "49", "7", "82", "39", "33", "34", "61", "64", "52"]

  const PayMentOptions = ref([])
  const getPaymentTerms = () => {
    getPaymentTermsApi().then(({ data }) => {
      PayMentOptions.value = data
    })
  }
  onMounted(() => {
    getPaymentTerms()
  })

  return {
    PayMentOptions,
    codeArr
  }
}

// 獲取工廠代碼
export function useFactoryCodeSelect() {
  const factoryCodeOptions = ref([])
  const getBrandList = () => {
    getFactoryListApi().then(({ data }) => {
      factoryCodeOptions.value = data
    })
  }
  onMounted(() => {
    getBrandList()
  })

  return factoryCodeOptions
}

// 獲取部門
export function useDepartmentSelect() {
  const roleOptions = ref([])
  const getDataList = () => {
    getDepartmentApi().then(({ data }) => {
      roleOptions.value = data
    })
  }
  onMounted(() => {
    getDataList()
  })

  return {
    roleOptions
  }
}

// 獲取付款方
export function usePayerListSelect() {
  const payerOptions = ref([])
  const getDataList = () => {
    getPayerListApi({
      page: 1,
      page_size: 1000
    }).then(({ data }) => {
      payerOptions.value = data.data
    })
  }
  onMounted(() => {
    getDataList()
  })

  return payerOptions
}

// 獲取船代
export function useFreightForwarderListSelect() {
  const freightForwarderOptions = ref([])
  const getDataList = () => {
    getFreightForwarderListApi({
      page: 1,
      page_size: 1000
    }).then(({ data }) => {
      freightForwarderOptions.value = data.data
    })
  }
  onMounted(() => {
    getDataList()
  })

  return freightForwarderOptions
}

// 獲取起運港
export function useOriginatingListSelect() {
  const originatingOptions = ref([])
  const getDataList = () => {
    getOriginatingListApi({
      page: 1,
      page_size: 1000
    }).then(({ data }) => {
      originatingOptions.value = data.data
    })
  }
  onMounted(() => {
    getDataList()
  })

  return originatingOptions
}

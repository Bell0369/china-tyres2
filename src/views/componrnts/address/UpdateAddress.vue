<script setup>
import { reactive, ref, onMounted, computed, defineEmits } from "vue"
import { useRoute } from "vue-router"
import cloneDeep from "lodash-es/cloneDeep" // 导入深拷贝函数
import { CirclePlus, Delete, Edit } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { getCountriesAreaApi } from "@/api/selects"
import { updateFactoryContactApi, updateClientContactApi } from "@/api/users"
import { usePayMentSelect } from "@/hooks/useSelectOption"

const { addressData, idName } = defineProps(["addressData", "idName"])

const route = useRoute()

const loading = ref(false)

// 初始化
const ruleForm = computed(() => {
  const form = reactive({
    id: 0,
    phones: [],
    address: [],
    emails: []
  })
  form[`${idName}_contact`] = ""
  // form[`${idName}_contact_id`] = 0
  form[`${idName}_id`] = route.query.id
  return form
})

onMounted(() => {
  Object.assign(ruleForm.value, addressData)

  // 默認 phone
  const phones = ruleForm.value.phones
  phones_default.value = phones.findIndex((phone) => phone.default === 1)

  // 默認 address
  const addresses = ruleForm.value.address
  address_default.value = addresses.findIndex((address) => address.default === 1)
  // for (const key in addressData.address) {
  //   if (ruleForm.value.address[key].default === 1) {
  //     address_default.value = Number(key)
  //     break
  //   }
  // }

  // 默認 email
  const emails = ruleForm.value.phones
  emails_default.value = emails.findIndex((emails) => emails.default === 1)
})

// 區號
const { codeArr } = usePayMentSelect()

// 移除數據
const removeDomain = (type, index) => {
  if (type === "phone") {
    ruleForm.value.phones.splice(index, 1)
  } else if (type === "address") {
    ruleForm.value.address.splice(index, 1)
  } else {
    ruleForm.value.emails.splice(index, 1)
  }
}

/**---------------------- */
// 添加電話
const phones_default = ref(0)
const phoneVisible = ref(false)
const phonesForm = ref({
  id: 0,
  area: null,
  phone: ""
})

const phonesFormRef = ref(null)
const phoneRules = reactive({
  phone: [
    { required: true, message: "請輸入電話", trigger: "blur" },
    { pattern: /^\d+$/, message: "請輸入正確電話", trigger: ["blur", "change"] }
  ]
})

let phoneType = false
// 修改時找到對應修改數據的下標
let phoneIndex = 0
const addPhone = (formEl) => {
  formEl.validate((valid, fields) => {
    if (valid) {
      const phones = ruleForm.value.phones
      if (phoneType) {
        // 深拷贝 phonesForm 中的值
        const phone = cloneDeep(phonesForm.value)
        phones.push(phone)
      } else {
        Object.assign(phones[phoneIndex], phonesForm.value)
      }
      phoneVisible.value = false
    } else {
      console.log("error submit!", fields)
    }
  })
}

const updatePhone = (item, index) => {
  phoneVisible.value = true
  phoneIndex = index
  if (item) {
    const phones = cloneDeep(item)
    phoneType = false
    phonesForm.value = phones
  } else {
    phoneType = true
    phonesForm.value.area = "852"
    phonesForm.value.phone = ""
  }
}

/**---------------------- */
// 點擊獲取地區數據
const countryOptions = ref([])
const countryVal = ref({})
const provinceOptions = ref([])
const provinceVal = ref({})
const cityOptions = ref([])
const cityVal = ref({})
const getOptions = (type) => {
  if (type === 1) {
    addressForm.value.country = countryVal.value.id
    addressForm.value.country_name = countryVal.value.name
    provinceVal.value = {}
    cityVal.value = {}
    cityOptions.value = []

    addressForm.value.province = null
    addressForm.value.province_name = null
    addressForm.value.city = null
    addressForm.value.city_name = null
    getCountriesArea(2, countryVal.value.id)
  } else if (type === 2) {
    addressForm.value.province = provinceVal.value.id
    addressForm.value.province_name = provinceVal.value.name
    cityVal.value = {}

    addressForm.value.city = null
    addressForm.value.city_name = null
    getCountriesArea(3, provinceVal.value.id)
  } else {
    addressForm.value.city = cityVal.value.id
    addressForm.value.city_name = cityVal.value.name
  }
}

// 添加地址
const address_default = ref(0)
const addressVisible = ref(false)
const addressForm = ref({
  id: 0,
  country: "",
  province: "",
  city: "",
  address: ""
})

let addressType = false
// 修改時找到對應修改數據的下標
let addressIndex = 0

const addaddress = () => {
  if (addressForm.value.country === "") {
    ElMessage.error("請选择国家")
    return
  }
  if (addressForm.value.address === "") {
    ElMessage.error("請输入详细地址")
    return
  }
  const addresses = ruleForm.value.address
  console.log(addresses)
  if (addressType) {
    const address = cloneDeep(addressForm.value)
    addresses.push(address)
  } else {
    Object.assign(addresses[addressIndex], addressForm.value)
  }
  addressForm.value = {}
  addressVisible.value = false
}

const updateAddress = (item, index) => {
  addressVisible.value = true
  addressIndex = index
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 800)

  getCountriesArea(1)
  if (item) {
    const addresses = cloneDeep(item)
    addressType = false
    addressForm.value = addresses
    // 默認選中
    if (addresses.country) {
      getCountriesArea(2, addresses.country)
    }
    if (addresses.province) {
      getCountriesArea(3, addresses.province)
    }

    countryVal.value = {
      id: Number(addresses.country),
      name: addresses.country_name
    }
    provinceVal.value = {
      id: Number(addresses.province),
      name: addresses.province_name
    }
    cityVal.value = {
      id: Number(addresses.city),
      name: addresses.city_name
    }
  } else {
    addressType = true
    // 添加清空
    countryVal.value = {}
    provinceVal.value = {}
    cityVal.value = {}
    provinceOptions.value = []
    cityOptions.value = []
    addressForm.value.address = ""
  }
}

// 查询接口
const getCountriesArea = (index, id) => {
  loading.value = true
  getCountriesAreaApi({
    pid: id || undefined
  })
    .then(({ data }) => {
      if (index === 1) {
        countryOptions.value = data
      } else if (index === 2) {
        provinceOptions.value = data
        if (data.length === 0) {
          addressForm.value.province = ""
          addressForm.value.province_name = ""
          provinceVal.value = {}
          addressForm.value.city = ""
          addressForm.value.city_name = ""
          cityVal.value = {}
        }
      } else {
        cityOptions.value = data
        if (data.length === 0) {
          addressForm.value.city = ""
          addressForm.value.city_name = ""
          cityVal.value = {}
        }
      }
    })
    .finally(() => {
      loading.value = false
    })
}
/**---------------------- */
// 添加電郵
const emails_default = ref(0)

let emailType = false
let emailIndex = 0

const emailVisible = ref(false)
const emailForm = ref({
  id: 0,
  email: ""
})

const emailFormlRef = ref(null)
const emailRules = reactive({
  email: [
    { required: true, message: "請輸入電郵", trigger: "blur" },
    { type: "email", message: "請輸入正確電郵", trigger: ["blur", "change"] }
  ]
})

const addEmail = (formEl) => {
  formEl.validate((valid, fields) => {
    if (valid) {
      emailVisible.value = false
      const emails = ruleForm.value.emails
      if (emailType) {
        // 深拷贝
        const email = cloneDeep(emailForm.value)
        emails.push(email)
      } else {
        Object.assign(emails[emailIndex], emailForm.value)
      }
    } else {
      console.log("error submit!", fields)
    }
  })
}

const updateEmail = (item, index) => {
  emailVisible.value = true
  emailIndex = index
  if (item) {
    const email = cloneDeep(item)
    emailType = false
    emailForm.value = email
  } else {
    emailType = true
    emailForm.value.email = ""
  }
}

const emitEvents = defineEmits(["childEvent"])
// 提交
const submitForm = () => {
  if (ruleForm.value[idName + "_contact"] === "") {
    ElMessage.error("請輸入聯繫人")
    return
  }
  if (ruleForm.value.phones.length === 0) {
    ElMessage.error("請選中默認電話")
    return
  }
  // 默認 phone
  setDefaultProperty(ruleForm.value.phones, phones_default.value, "default")

  if (ruleForm.value.address.length === 0) {
    ElMessage.error("請選中默認地址")
    return
  }
  // 默認 address
  setDefaultProperty(ruleForm.value.address, address_default.value, "default")

  if (ruleForm.value.emails.length === 0) {
    ElMessage.error("請選中默認電郵")
    return
  }
  // 默認 email
  setDefaultProperty(ruleForm.value.emails, emails_default.value, "default")

  const api = idName === "factory" ? updateFactoryContactApi : updateClientContactApi
  api({
    address_json: JSON.stringify([ruleForm.value])
  }).then((data) => {
    if (data.code === 200) {
      ElMessage.success("操作成功")
      emitEvents("childEvent")
    }
  })
}

// 设置默认函数
const setDefaultProperty = (obj, defaultValue, targetKey) => {
  Object.keys(obj).forEach((key) => {
    obj[key][targetKey] = defaultValue === Number(key) ? 1 : 0
  })
}
</script>

<template>
  <div>
    <el-form :model="ruleForm" label-width="70px" label-position="left">
      <el-form-item label="聯繫人">
        <el-input v-model="ruleForm[idName + '_contact']" />
      </el-form-item>
      <!-- 電話 -->
      <div>
        <el-form-item label="電話">
          <div class="flex items-center" v-for="(domain, index) in ruleForm.phones" :key="domain.id">
            <el-radio-group v-model="phones_default">
              <el-radio :value="index" border>{{ domain.area }} - {{ domain.phone }}</el-radio>
            </el-radio-group>
            <el-button-group class="ml-1 mr-4 pt-2">
              <el-icon class="cursor-pointer" size="22px" color="#409eff" @click="updatePhone(domain, index)"
                ><Edit
              /></el-icon>
              <el-icon class="cursor-pointer" size="22px" color="#f56c6c" @click="removeDomain('phone', index)"
                ><Delete
              /></el-icon>
            </el-button-group>
          </div>
          <div class="mb-2">
            <el-button type="primary" :icon="CirclePlus" plain @click="updatePhone(0, 0)">添加</el-button>
          </div>
        </el-form-item>
      </div>
      <!-- 地址 -->
      <div class="">
        <el-form-item label="地址">
          <div class="flex items-center w-[100%]" v-for="(domain, index) in ruleForm.address" :key="domain.city">
            <el-radio-group v-model="address_default">
              <el-radio :value="index" border>
                {{ domain.country_name }} {{ domain.province_name }} {{ domain.city_name }} {{ domain.address }}
              </el-radio>
            </el-radio-group>
            <el-button-group class="ml-1 mr-4 pt-2">
              <el-icon class="cursor-pointer" size="22px" color="#409eff" @click="updateAddress(domain, index)"
                ><Edit
              /></el-icon>
              <el-icon class="cursor-pointer" size="22px" color="#f56c6c" @click="removeDomain('address', index)"
                ><Delete
              /></el-icon>
            </el-button-group>
          </div>
          <div class="mb-2">
            <el-button type="primary" :icon="CirclePlus" plain @click="updateAddress(0, 0)">添加</el-button>
          </div>
        </el-form-item>
      </div>
      <!-- 郵箱 -->
      <div class="">
        <el-form-item label="郵箱">
          <div class="flex items-center" v-for="(domain, index) in ruleForm.emails" :key="domain.email">
            <el-radio-group v-model="emails_default">
              <el-radio :value="index" border>{{ domain.email }}</el-radio>
            </el-radio-group>
            <el-button-group class="ml-1 mr-4 pt-2">
              <el-icon class="cursor-pointer" size="22px" color="#409eff" @click="updateEmail(domain, index)"
                ><Edit
              /></el-icon>
              <el-icon class="cursor-pointer" size="22px" color="#f56c6c" @click="removeDomain('email', index)"
                ><Delete
              /></el-icon>
            </el-button-group>
          </div>
          <div class="mb-2">
            <el-button type="primary" :icon="CirclePlus" plain @click="updateEmail(0, 0)">添加</el-button>
          </div>
        </el-form-item>
      </div>
      <div class="text-right">
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </el-form>

    <!-- phone -->
    <el-dialog v-model="phoneVisible" align-center title="電話" append-to-body width="500px">
      <div v-loading="loading">
        <el-form ref="phonesFormRef" :model="phonesForm" :rules="phoneRules">
          <el-form-item label="電話" prop="phone">
            <el-col :span="6" class="pr1">
              <el-select filterable v-model="phonesForm.area">
                <el-option v-for="item in codeArr" :key="item" :label="item" :value="item" />
              </el-select>
            </el-col>
            <el-col :span="18">
              <el-input v-model="phonesForm.phone" />
            </el-col>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="phoneVisible = false">關閉</el-button>
        <el-button type="primary" @click="addPhone(phonesFormRef)"> 確定 </el-button>
      </template>
    </el-dialog>

    <!-- addresss -->
    <el-dialog v-model="addressVisible" align-center title="地址" append-to-body>
      <div v-loading="loading">
        <el-form-item label="地區選擇">
          <el-col :span="8" class="pr1">
            <el-select value-key="id" filterable v-model="countryVal" @change="getOptions(1)">
              <el-option
                v-for="item in countryOptions"
                :key="item.id"
                :label="item.name"
                :value="{ id: item.id, name: item.name }"
              />
            </el-select>
          </el-col>
          <el-col :span="8" class="pr1" v-show="provinceOptions.length !== 0">
            <el-select value-key="id" v-model="provinceVal" @change="getOptions(2)">
              <el-option
                v-for="item in provinceOptions"
                :key="item.id"
                :label="item.name"
                :value="{ id: item.id, name: item.name }"
              />
            </el-select>
          </el-col>
          <el-col :span="8" v-show="cityOptions.length !== 0">
            <el-select value-key="id" v-model="cityVal" @change="getOptions(3)">
              <el-option
                v-for="item in cityOptions"
                :key="item.id"
                :label="item.name"
                :value="{ id: item.id, name: item.name }"
              />
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="詳細地址">
          <el-input v-model="addressForm.address" type="textarea" />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="addressVisible = false">關閉</el-button>
        <el-button type="primary" @click="addaddress"> 確定 </el-button>
      </template>
    </el-dialog>

    <!-- email -->
    <el-dialog v-model="emailVisible" align-center title="電郵" append-to-body width="500px">
      <div v-loading="loading">
        <el-form ref="emailFormlRef" :model="emailForm" :rules="emailRules">
          <el-form-item label="電郵" prop="email">
            <el-input v-model="emailForm.email" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="emailVisible = false">關閉</el-button>
        <el-button type="primary" @click="addEmail(emailFormlRef)"> 確定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue"
import { Delete } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"
import { useRoute } from "vue-router"
import ClientProduct from "./ClientProduct.vue"
// import { Dialog } from "@/components/Dialog"
import { updateClientListApi, viewClientShowApi } from "@/api/users"
import { useeDeliverTypeSelect, usePayMentSelect, useBrandSelect } from "@/hooks/useSelectOption"
import AddressList from "@/views/componrnts/address/AddressList.vue"
// import PrepayMents from "@/views/componrnts/prepayments/PrepayMents.vue"
import { validateNumberMin, validateNumberMinMax } from "@/utils/validate"
import { useFactorySelect } from "@/hooks/useFactorySelect"
import { useUserSelect } from "@/hooks/useUserSelect"
import { useUserStore } from "@/store/modules/user"

const { userinfo } = useUserStore()

defineOptions({
  name: "ClientItem"
})

const route = useRoute()

// 品牌
const { brandOptions } = useBrandSelect()

//工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

// 員工
const { loadUser, optionsUser, loadUserData } = useUserSelect()

const { eDeliverTypeOptions } = useeDeliverTypeSelect()

const { PayMentOptions } = usePayMentSelect()

// const dialogVisible = ref(false)

const loading = ref(false)
const ruleFormRef = ref()
const ruleForm = reactive({
  name: "",
  client_encod: "",
  credit: undefined,
  primitive_price: "",
  payment_terms_id: "",
  deliver_type: 1,
  commission_ratio: undefined,
  is_commission: 0,
  is_deliver_project: 1,
  is_check_deliver_project: 0,
  client_contact_id: null,
  client_auth_flow_join: [
    {
      key: 1,
      user_id: "",
      brand_id: "",
      factory_id: ""
    }
  ],
  inv_rise_one: "",
  inv_rise_two: "",
  inv_rise_three: "",
  beneficiary: "",
  bank_name: "",
  bank_account: "",
  bank_code: "",
  bank_address: ""
})

const rules = reactive({
  name: [{ required: true, message: "請輸入客戶名稱", trigger: "blur" }],
  payment_terms_id: [{ required: true, message: "請選擇付款條件", trigger: "blur" }],
  client_encod: [
    { required: true, message: "請輸入客戶編碼", trigger: "blur" },
    { pattern: /^[^\u4e00-\u9fa5]+$/, message: "不能含有漢字", trigger: "blur" }
  ],
  beneficiary: [{ required: true, message: "請輸入受益人", trigger: "blur" }],
  bank_name: [{ required: true, message: "請輸入銀行名稱", trigger: "blur" }],
  bank_account: [{ required: true, message: "請輸入銀行賬戶", trigger: "blur" }],
  bank_code: [{ required: true, message: "請輸入銀行代碼", trigger: "blur" }],
  bank_address: [{ required: true, message: "請輸入銀行地址", trigger: "blur" }]
})

// 移除
const removeDomain = (item) => {
  const index = ruleForm.client_auth_flow_join.indexOf(item)
  if (index !== -1) {
    ruleForm.client_auth_flow_join.splice(index, 1)
  }
}

// 追加
const addDomain = () => {
  ruleForm.client_auth_flow_join.push({
    key: Date.now(),
    user_id: "",
    brand_id: "",
    factory_id: ""
  })
}

/**获取数据 */
onMounted(() => {
  getClientShow()
})

// 基本信息
const isProduct = ref(null)
const isDeldo = ref(false)
const isClientName = ref("")
const getClientShow = () => {
  loading.value = true
  viewClientShowApi({
    id: route.query.id
  }).then((data) => {
    const datas = data.data
    datas.name = datas.client_name
    delete datas.client_name
    datas.deliver_type = parseInt(datas.deliver_type)

    // 員工
    const seenIds1 = new Set()
    const seenIds2 = new Set()
    datas.client_auth_flow_join.forEach((item) => {
      if (!seenIds1.has(item.user_id)) {
        optionsUser.value.push({
          id: item.user_id,
          username: item.user_name
        })
        seenIds1.add(item.user_id)
      }
      if (!seenIds2.has(item.factory_id)) {
        optionsFactory.value.push({
          id: item.factory_id,
          name: item.factory_name
        })
        seenIds2.add(item.factory_id)
      }
    })

    Object.assign(ruleForm, datas)
    loading.value = false

    isProduct.value = datas.client_contact_id
    isDeldo.value = datas.client_encod.toUpperCase() === "DELDO" ? true : false
    isClientName.value = datas.name
  })
}

// 提交客戶基本信息
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      updateClientListApi(ruleForm).then(() => {
        ElMessage.success("操作成功")
        getClientShow()
      })
    } else {
      console.log("error submit!", fields)
    }
  })
}

// 監聽
let isInit = false
const isSubmitForm = ref(true)
watch([ruleForm], () => {
  if (!isInit) {
    isInit = true
    return
  }
  isSubmitForm.value = false
})

const updataContact = (value) => {
  ruleForm.client_contact_id = value
}

// const handleEditPayment = (value) => {
//   ruleForm.advance_payment = value
// }
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">客戶基本信息</el-text>
          <el-button
            v-permission="['addClient']"
            type="primary"
            @click="submitForm(ruleFormRef)"
            :disabled="isSubmitForm"
            >保存</el-button
          >
        </div>
      </div>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" hide-required-asterisk>
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="客戶名稱" prop="name">
              <el-input v-model="ruleForm.name" placeholder="請輸入客戶名稱" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="客戶編碼" prop="client_encod">
              <el-input v-model="ruleForm.client_encod" placeholder="請輸入客戶名稱" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="付款條件" prop="payment_terms_id">
              <el-select v-model="ruleForm.payment_terms_id">
                <el-option v-for="item in PayMentOptions" :label="item.name" :value="item.id" :key="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="發貨類型">
              <el-select v-model="ruleForm.deliver_type">
                <el-option v-for="item in eDeliverTypeOptions" :label="item.name" :value="item.id" :key="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="信用額度">
              <el-input
                v-model="ruleForm.credit"
                type="number"
                @input="ruleForm.credit = validateNumberMin(ruleForm.credit)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="初始金額">
              <el-input
                v-model="ruleForm.primitive_price"
                type="number"
                @input="ruleForm.primitive_price = validateNumberMin(ruleForm.primitive_price)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="佣金比例">
              <el-input
                v-model="ruleForm.commission_ratio"
                type="number"
                @input="ruleForm.commission_ratio = validateNumberMinMax(ruleForm.commission_ratio)"
              >
                <template #append>%</template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="是否有佣金">
              <el-radio-group v-model="ruleForm.is_commission">
                <el-radio :value="0">否</el-radio>
                <el-radio :value="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :md="8" :lg="6">
            <el-form-item label="是否能創建發貨計劃">
              <el-radio-group v-model="ruleForm.is_deliver_project">
                <el-radio :value="0">否</el-radio>
                <el-radio :value="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :md="8" :lg="6">
            <el-form-item label="是否需要審批發貨計劃">
              <el-radio-group v-model="ruleForm.is_check_deliver_project">
                <el-radio :value="0">否</el-radio>
                <el-radio :value="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="6">
            <el-form-item label="預付款">
              <span class="color-red">{{ ruleForm.advance_payment || 0 }}</span>
              <Tickets
                v-permission="['clientAdvancePayment-1', 'clientAdvancePaymentList']"
                class="w6 h6 m-l-2 color-blue cursor-pointer"
                @click="dialogVisible = true"
              />
            </el-form-item>
          </el-col> -->
          <!-- 發票抬頭 -->
          <el-col :span="24">
            <div class="pb">
              <el-text tag="b">發票抬頭</el-text>
            </div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="發票1">
                  <el-input v-model="ruleForm.inv_rise_one" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="發票2">
                  <el-input v-model="ruleForm.inv_rise_two" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="發票3">
                  <el-input v-model="ruleForm.inv_rise_three" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
          <!-- 员工管理 -->
          <el-col :span="24" v-if="userinfo.role_name === '管理员'">
            <div class="flex justify-between pb">
              <el-text tag="b">管理員工</el-text>
              <el-button type="success" @click="addDomain">添加</el-button>
            </div>
            <el-row :gutter="10" v-for="(domain, index) in ruleForm.client_auth_flow_join" :key="domain.key">
              <el-col :span="8">
                <el-form-item
                  :label="`員工${index + 1}`"
                  :prop="`client_auth_flow_join[${index}].user_id`"
                  :rules="{
                    required: true,
                    message: '請選擇員工',
                    trigger: 'blur'
                  }"
                >
                  <el-select
                    v-model="domain.user_id"
                    filterable
                    remote
                    remote-show-suffix
                    :remote-method="loadUserData"
                    :loading="loadUser"
                  >
                    <el-option v-for="item in optionsUser" :key="item.id" :label="item.username" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  label="品牌"
                  :prop="`client_auth_flow_join[${index}].brand_id`"
                  :rules="{
                    required: true,
                    message: '請選擇品牌',
                    trigger: 'blur'
                  }"
                >
                  <el-select v-model="domain.brand_id">
                    <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item
                  label="工厂"
                  :prop="`client_auth_flow_join[${index}].factory_id`"
                  :rules="{
                    required: true,
                    message: '請選擇工厂',
                    trigger: 'blur'
                  }"
                >
                  <el-select
                    v-model="domain.factory_id"
                    filterable
                    remote
                    remote-show-suffix
                    :remote-method="loadFactoryData"
                    :loading="loadFactory"
                  >
                    <el-option v-for="item in optionsFactory" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" @click.prevent="removeDomain(domain)" :icon="Delete" plain />
              </el-col>
            </el-row>
          </el-col>
          <!-- 銀行信息 -->
          <el-col :span="24">
            <div class="py">
              <el-text tag="b">銀行信息</el-text>
            </div>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="受益人" prop="beneficiary">
                  <el-input v-model="ruleForm.beneficiary" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="銀行名稱" prop="bank_name">
                  <el-input v-model="ruleForm.bank_name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="銀行代碼" prop="bank_code">
                  <el-input v-model="ruleForm.bank_code" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="銀行賬號" prop="bank_account">
                  <el-input v-model="ruleForm.bank_account" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="銀行地址" prop="bank_address">
                  <el-input v-model="ruleForm.bank_address" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 聯繫人信息 -->
    <address-list
      @updataContact="updataContact"
      @getBasicInfo="getClientShow"
      :defaultId="ruleForm.client_contact_id"
      addressType="client"
    />

    <el-card shadow="never">
      <client-product :isProduct="isProduct" :isDeldo="isDeldo" :isClientName="isClientName" />
    </el-card>

    <!-- <Dialog v-model="dialogVisible" title="預付款">
      <prepay-ments isType="client" @handle-editPayment="handleEditPayment" :id="route.query.id" />
    </Dialog> -->
  </div>
</template>

<style scoped></style>

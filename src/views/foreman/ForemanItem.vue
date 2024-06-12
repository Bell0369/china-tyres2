<script setup>
import { ref, reactive, onMounted, watch } from "vue"
import { Tickets, Delete } from "@element-plus/icons-vue"
import ForemanProduct from "./ForemanProduct.vue"
import { useRoute } from "vue-router"
import { Dialog } from "@/components/Dialog"
import { useFactoryCodeSelect, useBrandSelect } from "@/hooks/useSelectOption"
import { getUserListApi, updateFactoryApi, getFactoryBasicInfoApi } from "@/api/users"
import { ElMessage } from "element-plus"
import AddressList from "@/views/componrnts/address/AddressList.vue"
import PrepayMents from "@/views/componrnts/prepayments/PrepayMents.vue"

defineOptions({
  name: "ForemanItem"
})

const route = useRoute()

// 工廠代碼
const factoryCodeOptions = useFactoryCodeSelect()

// 品牌
const { brandOptions } = useBrandSelect()

const loading = ref(false)

// 員工列表
const userLoading = ref(false)
const userOptions = ref([])
const remoteMethod = (query) => {
  userLoading.value = true
  getUserListApi({
    keyword: query || undefined
  })
    .then(({ data }) => {
      const list = data.data
      userOptions.value = list
    })
    .catch(() => {
      userOptions.value = []
    })
    .finally(() => {
      userLoading.value = false
    })
}

// 提交數據
const ruleFormRef = ref()
const ruleForm = reactive({
  name: "",
  factory_code: 1,
  factory_label_id: 1,
  factory_contact_id: null,
  factory_user: [
    {
      key: 1,
      user_id: "",
      brand_id: ""
    }
  ]
})

const rules = reactive({
  name: [{ required: true, message: "請輸入工廠名稱", trigger: "blur" }],
  factory_code: [{ required: true, message: "請選擇工廠代碼", trigger: "change" }]
})

// 移除
const removeDomain = (item) => {
  const index = ruleForm.factory_user.indexOf(item)
  if (index !== -1) {
    ruleForm.factory_user.splice(index, 1)
  }
}

// 追加
const addDomain = () => {
  ruleForm.factory_user.push({
    key: Date.now(),
    user_id: "",
    brand_id: ""
  })
}

const submitInfo = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      updateFactoryApi(ruleForm).then(() => {
        ElMessage.success("操作成功")
        getfactoryBasicInfo()
      })
    } else {
      console.log("error submit!", fields)
    }
  })
}

/**获取数据 */
onMounted(() => {
  getfactoryBasicInfo()
})

// 基本信息
const isProduct = ref(null)
const getfactoryBasicInfo = () => {
  loading.value = true
  getFactoryBasicInfoApi({
    id: route.query.id
  }).then(({ data }) => {
    ruleForm.factory_user = []
    userOptions.value = []

    data.users.forEach((item) => {
      ruleForm.factory_user.push({
        user_id: item.user_id,
        brand_id: item.brand_id
      })
      userOptions.value.push({
        id: item.user_id,
        username: item.username
      })
    })
    data.factory_code = data.factory_code_id + ""
    delete data.users
    delete data.factory_code_id
    Object.assign(ruleForm, data)

    loading.value = false

    isProduct.value = data.factory_contact_id
  })
}

// 預付款
const dialogVisible = ref(false)

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
  ruleForm.factory_contact_id = value
}

const handleEditPayment = (value) => {
  ruleForm.advance_payment = value
}
</script>

<template>
  <div class="app-container">
    <el-card v-loading="loading" shadow="never" class="search-wrapper">
      <div class="toolbar-wrapper">
        <div class="flex justify-between">
          <el-text tag="b" size="large">工廠基本信息</el-text>
          <el-button
            v-permission="['addFactory']"
            type="primary"
            @click="submitInfo(ruleFormRef)"
            :disabled="isSubmitForm"
            >保存</el-button
          >
        </div>
      </div>
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
        <el-row :gutter="20">
          <el-col :span="7">
            <el-form-item label="工廠名稱" prop="name">
              <el-input v-model="ruleForm.name" placeholder="請輸入工廠名稱" />
            </el-form-item>
          </el-col>
          <el-col :span="1" />
          <el-col :span="7">
            <el-form-item label="工廠代碼" prop="factory_code">
              <el-select v-model="ruleForm.factory_code">
                <el-option v-for="item in factoryCodeOptions" :label="item.name" :value="item.code" :key="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="1" />
          <el-col :span="6">
            <el-form-item label="預付款">
              <span class="color-red">{{ ruleForm.advance_payment || 0 }}</span>
              <Tickets
                v-permission="['factoryAdvancePayment', 'factoryAdvancePaymentList']"
                class="w6 h6 m-l-2 color-blue cursor-pointer"
                @click="dialogVisible = true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <div class="flex justify-between pb">
              <el-text tag="b">管理員工</el-text>
              <el-button type="success" @click="addDomain" plain>添加</el-button>
            </div>
            <el-row :gutter="10" v-for="(domain, index) in ruleForm.factory_user" :key="domain.key">
              <el-col :span="8">
                <el-form-item
                  :label="`員工${index + 1}`"
                  :prop="`factory_user[${index}].user_id`"
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
                    :remote-method="remoteMethod"
                    :loading="loading"
                  >
                    <el-option v-for="item in userOptions" :key="item.id" :label="item.username" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="品牌">
                  <el-select v-model="domain.brand_id">
                    <el-option v-for="item in brandOptions" :key="item.id" :label="item.name" :value="item.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="2">
                <el-button type="primary" @click.prevent="removeDomain(domain)" :icon="Delete" plain />
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 聯繫人信息 -->
    <AddressList
      @updataContact="updataContact"
      @getBasicInfo="getfactoryBasicInfo"
      :defaultId="ruleForm.factory_contact_id"
      addressType="factory"
    />

    <!-- 產品信息 -->
    <el-card shadow="never">
      <foreman-product :isProduct="isProduct" />
    </el-card>

    <Dialog v-model="dialogVisible" title="預付款">
      <prepay-ments isType="factory" @handle-editPayment="handleEditPayment" :id="route.query.id" />
    </Dialog>
  </div>
</template>

<style scoped></style>

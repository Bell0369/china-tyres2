<script setup>
import { reactive, ref, defineEmits, onMounted } from "vue"
import { Delete, Plus } from "@element-plus/icons-vue"
import { getUserDetailApi, editUserManagementRelationshipsApi } from "@/api/users"
import { ElMessage } from "element-plus"
import { useFactorySelect } from "@/hooks/useFactorySelect"
import { useClientSelect } from "@/hooks/useClientSelect"
import { useBrandSelect } from "@/hooks/useSelectOption"

defineOptions({
  name: "UserDetail"
})

// 客户
const { loadClient, optionsClient, loadClientData } = useClientSelect()

// 品牌
const { brandOptions } = useBrandSelect()

// 工厂
const { loadFactory, optionsFactory, loadFactoryData } = useFactorySelect()

const { rowId } = defineProps(["rowId"])

const loading = ref(true)

onMounted(() => {
  getUserDetailApi({
    id: rowId
  })
    .then(({ data }) => {
      // 管理客戶
      const seenIds1 = new Set()
      const seenIds2 = new Set()
      data.client_auth_flow_join.forEach((item) => {
        if (!seenIds1.has(item.client_id)) {
          optionsClient.value.push({
            id: item.client_id,
            client_code: item.client_name
          })
          seenIds1.add(item.client_id)
        }
        if (!seenIds2.has(item.factory_id)) {
          optionsFactory.value.push({
            id: item.factory_id,
            name: item.factory_name
          })
          seenIds2.add(item.factory_id)
        }
      })
      ruleForm.client_auth_flow_join = data.client_auth_flow_join

      // 管理工廠
      data.factory_user.forEach((item) => {
        if (!seenIds2.has(item.factory_id)) {
          optionsFactory.value.push({
            id: item.factory_id,
            name: item.factory_name
          })
          seenIds2.add(item.factory_id)
        }
      })
      ruleForm.factory_user = data.factory_user
    })
    .finally(() => {
      loading.value = false
    })
})

const ruleFormRef = ref()
const ruleFormRef2 = ref()
const ruleForm = reactive({
  user_id: rowId,
  client_auth_flow_join: [
    {
      key: 1,
      client_id: "",
      brand_id: "",
      factory_id: ""
    }
  ],
  factory_user: [
    {
      brand_id: "",
      factory_id: ""
    }
  ]
})

// 移除
const removeDomain = (item, type) => {
  if (type === 1) {
    const index = ruleForm.client_auth_flow_join.indexOf(item)
    if (index !== -1) {
      ruleForm.client_auth_flow_join.splice(index, 1)
    }
  } else {
    const index = ruleForm.factory_user.indexOf(item)
    if (index !== -1) {
      ruleForm.factory_user.splice(index, 1)
    }
  }
}

// 追加
const addDomain = (type) => {
  if (type === 1) {
    ruleForm.client_auth_flow_join.push({
      key: Date.now(),
      user_id: "",
      brand_id: "",
      factory_id: ""
    })
  } else {
    ruleForm.factory_user.push({
      key: Date.now(),
      brand_id: "",
      factory_id: ""
    })
  }
}

// 提交客戶基本信息
const submitForm = async (formEl, formEl2) => {
  if (!formEl || !formEl2) return

  try {
    const [valid1, valid2] = await Promise.all([
      new Promise((resolve) => formEl.validate(resolve)),
      new Promise((resolve) => formEl2.validate(resolve))
    ])

    if (!valid1) return
    if (!valid2) return

    loading.value = true

    const data = await editUserManagementRelationshipsApi(ruleForm)

    if (data.code === 200) {
      ElMessage.success("操作成功")
      emitEvents("userDetail")
    }
  } catch (error) {
    console.error("提交出错:", error)
  } finally {
    loading.value = false
  }
}

const emitEvents = defineEmits(["userDetail"])
</script>

<template>
  <div v-loading="loading">
    <!-- 客戶管理 -->
    <el-form ref="ruleFormRef" :model="ruleForm">
      <div>
        <div class="pb-2">
          <el-text tag="b" size="large">客戶管理</el-text>
        </div>
        <el-scrollbar max-height="300px">
          <el-row justify="space-between" v-for="(domain, index) in ruleForm.client_auth_flow_join" :key="domain.key">
            <el-col :span="8">
              <el-form-item
                :label="`${index + 1} 客戶`"
                :prop="`client_auth_flow_join[${index}].client_id`"
                :rules="{
                  required: true,
                  message: '請選擇客戶',
                  trigger: 'blur'
                }"
              >
                <el-select
                  v-model="domain.client_id"
                  filterable
                  remote
                  remote-show-suffix
                  :remote-method="loadClientData"
                  :loading="loadClient"
                >
                  <el-option v-for="item in optionsClient" :key="item.id" :label="item.client_code" :value="item.id" />
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
              <el-button type="primary" @click.prevent="removeDomain(domain, 1)" :icon="Delete" plain />
            </el-col>
          </el-row>
        </el-scrollbar>
      </div>
      <el-form-item>
        <el-button type="primary" @click="addDomain(1)" :icon="Plus" plain>添加客戶</el-button>
      </el-form-item>
    </el-form>
    <!-- 工廠管理 -->
    <el-form ref="ruleFormRef2" :model="ruleForm">
      <div>
        <div class="pb-2 pt" style="border-top: 1px dashed #67c23a">
          <el-text tag="b" size="large">工廠管理</el-text>
        </div>
        <el-scrollbar max-height="300px">
          <el-row justify="space-between" v-for="(domain, index) in ruleForm.factory_user" :key="domain.key">
            <el-col :span="7">
              <el-form-item
                :label="`${index + 1} 品牌`"
                :prop="`factory_user[${index}].brand_id`"
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
            <el-col :span="7">
              <el-form-item
                label="工厂"
                :prop="`factory_user[${index}].factory_id`"
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
              <el-button type="primary" @click.prevent="removeDomain(domain, 2)" :icon="Delete" plain />
            </el-col>
            <el-col :span="6" />
          </el-row>
        </el-scrollbar>
      </div>
      <el-form-item>
        <el-button type="primary" @click="addDomain(2)" :icon="Plus" plain>添加工廠</el-button>
      </el-form-item>
    </el-form>
    <div class="text-right">
      <el-button type="primary" @click="submitForm(ruleFormRef, ruleFormRef2)">提交</el-button>
    </div>
  </div>
</template>

<style scoped></style>

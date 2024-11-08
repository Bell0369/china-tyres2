<script setup>
import { ref, reactive } from "vue"
import { ElMessage } from "element-plus"
import { Delete } from "@element-plus/icons-vue"
import { useFactoryCodeSelect, useBrandSelect } from "@/hooks/useSelectOption"
import { updateFactoryApi } from "@/api/users"
import { useUserSelect } from "@/hooks/useUserSelect"
import { validateNumberMin } from "@/utils/validate"

defineOptions({
  name: "ForemanAdd"
})

// 工廠代碼
const factoryCodeOptions = useFactoryCodeSelect()

// 品牌
const { brandOptions } = useBrandSelect()

// 員工
const { loadUser, optionsUser, loadUserData } = useUserSelect()

// 提交數據
const ruleFormRef = ref()
const ruleForm = reactive({
  name: "",
  factory_code: "",
  factory_label_id: 1,
  primitive_price: "",
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

const emitEvents = defineEmits(["childEvent"])
const submitInfo = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      updateFactoryApi(ruleForm).then(() => {
        ElMessage.success("操作成功")
        emitEvents("childEvent")
      })
    } else {
      console.log("error submit!", fields)
    }
  })
}
</script>

<template>
  <div class="overflow-hidden">
    <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="工廠名稱" prop="name">
            <el-input v-model="ruleForm.name" placeholder="請輸入工廠名稱" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="工廠代碼" prop="factory_code">
            <el-select v-model="ruleForm.factory_code">
              <el-option v-for="item in factoryCodeOptions" :label="item.name" :value="item.code" :key="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="初始金額">
            <el-input
              v-model="ruleForm.primitive_price"
              type="number"
              @input="ruleForm.primitive_price = validateNumberMin(ruleForm.primitive_price)"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" class="b b-#ccc b-style-solid mb">
          <div class="flex justify-between py">
            <el-text tag="b">管理員工</el-text>
            <el-button type="success" @click="addDomain">添加</el-button>
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
                  :remote-method="loadUserData"
                  :loading="loadUser"
                >
                  <el-option v-for="item in optionsUser" :key="item.id" :label="item.username" :value="item.id" />
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
    <div class="text-right">
      <el-button type="primary" @click="submitInfo(ruleFormRef)">提交</el-button>
    </div>
  </div>
</template>

<style scoped></style>

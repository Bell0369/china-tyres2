<script setup>
import { reactive, ref, defineEmits, onMounted, watch } from "vue"
import { getUserItemApi, updateUserItemApi } from "@/api/users"
import { usePayMentSelect, useDepartmentSelect } from "@/hooks/useSelectOption"
import { ElMessage } from "element-plus"
// import { setRoles, setButtonAuthorities } from "@/utils/cache/local-storage"

defineOptions({
  name: "EditUser"
})

const { rowId, authAllTree } = defineProps(["rowId", "authAllTree"])

const loading = ref(true)

// 部門
const { roleOptions } = useDepartmentSelect()

// 區號
const { codeArr } = usePayMentSelect()

// 部門權限
const authority = reactive({})
watch(roleOptions, () => {
  roleOptions.value.map((item) => {
    authority[item.id] = item.permission_ids
  })
  if (rowId === 0) {
    setTimeout(() => {
      authority[1].forEach((item) => {
        treeRef.value.setChecked(item, true, false)
      })
      loading.value = false
    }, 300)
  }
})

const ruleFormRef = ref()
const ruleForm = reactive({
  username: "",
  account: "",
  password: "",
  area_code: "852",
  phone: null,
  email: "",
  sex: 0,
  status: 1,
  role_id: 1,
  remarks: ""
})

const rules = reactive({
  username: [{ required: true, message: "請輸入用戶名稱", trigger: "blur" }],
  account: [
    { required: true, message: "請輸入登錄賬號", trigger: "blur" },
    { pattern: /^[^\u4e00-\u9fa5]+$/, message: "不能含有漢字", trigger: "blur" }
  ],
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
  phone: [{ required: true, message: "請輸入電話", trigger: "blur" }],
  email: [
    { required: true, message: "請輸入郵箱", trigger: "blur" },
    { type: "email", message: "請輸入正確郵箱地址", trigger: ["blur", "change"] }
  ]
})

const treeRef = ref()
const defaultProps = {
  children: "item",
  label: "title"
}

const isPassword = ref("")
onMounted(() => {
  if (rowId > 0) {
    getUserItemApi({
      id: rowId
    })
      .then(({ data }) => {
        data.password = undefined
        Object.assign(ruleForm, data)
        setTimeout(() => {
          data.permission_ids.forEach((item) => {
            treeRef.value.setChecked(item, true, false)
          })
          loading.value = false
        }, 500)
      })
      .catch(() => {
        loading.value = false
      })
  } else {
    isPassword.value = "password"
  }
})

// 切換部門
const updateRoles = () => {
  // console.log(authority[ruleForm.role_id])
  treeRef.value.setCheckedKeys([], false)
  authority[ruleForm.role_id].forEach((item) => {
    treeRef.value.setChecked(item, true, false)
  })
}

const emitEvents = defineEmits(["childEvent"])
const submitForm = (formEl) => {
  if (!formEl) return
  formEl.validate((valid, fields) => {
    if (valid) {
      ruleForm.permission_ids = treeRef.value.getHalfCheckedKeys().concat(treeRef.value.getCheckedKeys())
      // console.log(ruleForm.permission_ids)
      // setRoles(ruleForm.permission_ids)
      // setButtonAuthorities(ruleForm.permission_ids)
      updateUserItemApi(ruleForm).then(() => {
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
  <el-form label-position="left" label-width="80px" ref="ruleFormRef" :model="ruleForm" :rules="rules">
    <div v-loading="loading" class="overflow-hidden">
      <el-row :gutter="10">
        <el-col :span="12">
          <el-form-item label="用戶名稱" prop="username">
            <el-input v-model="ruleForm.username" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="電話" prop="phone">
            <el-select v-model="ruleForm.area_code" style="width: 70px; margin-right: 5px">
              <el-option v-for="(item, index) in codeArr" :label="item" :value="item" :key="index" />
            </el-select>
            <el-input v-model="ruleForm.phone" style="width: calc(100% - 80px)" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="登錄賬號" prop="account">
            <el-input v-model="ruleForm.account" autocomplete="off" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="登錄密碼" :prop="isPassword">
            <el-input type="password" v-model="ruleForm.password" autocomplete="off" auto-complete="new-password" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Email" prop="email">
            <el-input v-model="ruleForm.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性別">
            <el-radio-group v-model="ruleForm.sex">
              <el-radio :value="0">保密</el-radio>
              <el-radio :value="1">男</el-radio>
              <el-radio :value="2">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="部門">
            <el-select v-model="ruleForm.role_id" @change="updateRoles">
              <el-option v-for="item in roleOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="賬號狀態">
            <el-switch v-model="ruleForm.status" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="權限分配">
            <el-tree ref="treeRef" :data="authAllTree" show-checkbox node-key="id" :props="defaultProps" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="備註">
            <el-input v-model="ruleForm.remarks" type="textarea" rows="4" />
          </el-form-item>
        </el-col>
      </el-row>
    </div>
    <div class="text-right" v-permission="['addUser']">
      <el-button type="primary" @click="submitForm(ruleFormRef)">提交</el-button>
    </div>
  </el-form>
</template>

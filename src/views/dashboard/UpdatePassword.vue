<script lang="ts" setup>
import { reactive, ref } from "vue"
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"
import { updatePasswordApi } from "@/api/login"
import { useUserStore } from "@/store/modules/user"

const router = useRouter()
const userStore = useUserStore()

const ruleFormRef = ref<FormInstance>()

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value !== ruleForm.password) {
    callback(new Error("密碼輸入不一致"))
  } else {
    callback()
  }
}

const ruleForm = reactive({
  password: "",
  new_password: ""
})

const rules = reactive<FormRules<typeof ruleForm>>({
  password: [{ required: true, message: "請輸入密碼", trigger: "blur" }],
  new_password: [
    { required: true, message: "請確認密碼", trigger: "blur" },
    { validator: validatePass2, trigger: "blur" }
  ]
})

const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate((valid) => {
    if (valid) {
      updatePasswordApi(ruleForm).then(() => {
        ElMessage.success("操作成功")
        setTimeout(() => {
          userStore.logout()
          router.push("/login")
        }, 1500)
      })
    } else {
      console.log("error submit!")
      return false
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<template>
  <div class="app-container">
    <el-card class="mb5">
      <div class="pb5">
        <div class="mb5">
          <el-text tag="b" size="large">修改密碼</el-text>
        </div>
        <el-form ref="ruleFormRef" :model="ruleForm" status-icon :rules="rules" label-width="auto" class="w-2xl">
          <el-form-item label="密碼" prop="password">
            <el-input v-model="ruleForm.password" type="password" autocomplete="off" />
          </el-form-item>
          <el-form-item label="確認密碼" prop="new_password">
            <el-input v-model="ruleForm.new_password" type="password" />
          </el-form-item>
          <el-form-item label=" " class="pt5">
            <el-button type="primary" @click="submitForm(ruleFormRef)"> 提交 </el-button>
            <el-button @click="resetForm(ruleFormRef)">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import { type FormInstance, type FormRules } from "element-plus"
import { User, Lock } from "@element-plus/icons-vue"
import { type LoginRequestData } from "@/api/login/types/login"
import Owl from "./components/Owl.vue"
import { useFocus } from "./hooks/useFocus"
import { setRememberMe, getRememberMe } from "@/utils/cache/local-storage"

const router = useRouter()

const { isFocus, handleBlur, handleFocus } = useFocus()

/** 登录表单元素的引用 */
const loginFormRef = ref<FormInstance | null>(null)

/** 登录按钮 Loading */
const loading = ref(false)

// 記住密碼
const remember = ref(true)

/** 登录表单数据 */
const loginFormData: LoginRequestData = reactive({
  account: "",
  password: ""
})
/** 登录表单校验规则 */
const loginFormRules: FormRules = {
  account: [{ required: true, message: "請輸入用戶名", trigger: "blur" }],
  password: [
    { required: true, message: "請輸入密碼", trigger: "blur" },
    { min: 4, max: 16, message: "長度在4到16個字符", trigger: "blur" }
  ]
}
/** 登录逻辑 */
const handleLogin = () => {
  loginFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      loading.value = true
      useUserStore()
        .login(loginFormData)
        .then(() => {
          // 初始時間
          const lastRequestTime = Date.now() + 50 * 60 * 1000
          localStorage.setItem("lastRequestTime", JSON.stringify(lastRequestTime))

          if (remember.value) {
            setRememberMe({
              remember: remember.value,
              loginFormData
            })
          } else {
            setRememberMe({
              remember: remember.value,
              loginFormData: {}
            })
          }

          router.push({ path: "/" })
        })
        .catch(() => {
          loginFormData.password = ""
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

onMounted(() => {
  const info = JSON.parse(getRememberMe())
  remember.value = info?.remember || null
  if (info?.remember) {
    Object.assign(loginFormData, info.loginFormData)
  }
})
</script>

<template>
  <div class="login-container">
    <Owl :close-eyes="isFocus" />
    <div class="login-card">
      <div class="title">
        <img src="@/assets/layouts/logo-text-2.jpg" />
      </div>
      <div class="content">
        <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
          <el-form-item prop="account">
            <el-input
              v-model.trim="loginFormData.account"
              placeholder="用戶名"
              type="text"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="密碼"
              type="password"
              :prefix-icon="Lock"
              size="large"
              show-password
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <el-form-item>
            <el-checkbox v-model="remember" label="記住密碼" />
          </el-form-item>
          <el-button :loading="loading" type="primary" size="large" @click.prevent="handleLogin">登 錄</el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100%;
  .theme-switch {
    position: fixed;
    top: 5%;
    right: 5%;
    cursor: pointer;
  }
  .login-card {
    width: 480px;
    max-width: 90%;
    border-radius: 20px;
    box-shadow: 0 0 10px #dcdfe6;
    background-color: var(--el-bg-color);
    overflow: hidden;
    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 150px;
      img {
        height: 100%;
      }
    }
    .content {
      padding: 20px 50px 50px 50px;
      :deep(.el-input-group__append) {
        padding: 0;
        overflow: hidden;
        .el-image {
          width: 100px;
          height: 40px;
          border-left: 0px;
          user-select: none;
          cursor: pointer;
          text-align: center;
        }
      }
      .el-button {
        width: 100%;
        margin-top: 10px;
      }
    }
  }
}
</style>

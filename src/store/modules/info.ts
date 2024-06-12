import { defineStore } from "pinia"

interface UserLoginType {
  loginInfo?: {
    account: string
    password: string
  }
}

export const useInfoStore = defineStore({
  id: "info",
  state: () => ({
    rememberMe: true,
    loginInfo: {}
  }),
  actions: {
    setRememberMe(rememberMe: boolean) {
      this.rememberMe = rememberMe
    },
    setLoginInfo(loginInfo: UserLoginType | undefined) {
      this.loginInfo = loginInfo
    }
  },
  getters: {
    getRememberMe(): boolean {
      return this.rememberMe
    },
    getLoginInfo(): UserLoginType | undefined {
      return this.loginInfo
    }
  }
})

import { ref } from "vue"
import store from "@/store"
import { defineStore } from "pinia"
import { useTagsViewStore } from "./tags-view"
import { useSettingsStore } from "./settings"
import { getToken, removeToken, setToken } from "@/utils/cache/cookies"
import { setRoles, getRoles, setButtonAuthorities } from "@/utils/cache/local-storage"
import { resetRouter } from "@/router"
import { loginApi, getUserInfoApi } from "@/api/login"
import { type LoginRequestData } from "@/api/login/types/login"
// import routeSettings from "@/config/route"

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(getToken() || "")
  const roles = ref<string[]>([])
  const userinfo = ref<object>({})

  const tagsViewStore = useTagsViewStore()
  const settingsStore = useSettingsStore()

  /** 登录 */
  const login = async ({ account, password }: LoginRequestData) => {
    const { data } = await loginApi({ account, password })
    setToken(data.token)
    token.value = data.token
    // 路由權限
    const authorities = data.permission.map((permission) => permission.authority)
    // 按鈕權限
    const secondLevelAuthorities = data.permission.flatMap((permission) =>
      permission.item ? permission.item.map((item) => item.authority) : []
    )
    setRoles(authorities.concat(secondLevelAuthorities))
    setButtonAuthorities(secondLevelAuthorities)
  }

  /** 获取用户详情 */
  const getInfo = async () => {
    const { data } = await getUserInfoApi()
    userinfo.value = data
    // 验证返回的 roles 是否为一个非空数组，否则塞入一个没有任何作用的默认角色，防止路由守卫逻辑进入无限循环
    // roles.value = data.roles?.length > 0 ? data.roles : routeSettings.defaultRoles
    roles.value = getRoles()
  }

  /** 模拟角色变化 */
  const changeRoles = async (role: string) => {
    const newToken = "token-" + role
    token.value = newToken
    setToken(newToken)
    // 用刷新页面代替重新登录
    window.location.reload()
  }
  /** 登出 */
  const logout = () => {
    removeToken()
    token.value = ""
    roles.value = []
    resetRouter()
    _resetTagsView()
  }
  /** 重置 Token */
  const resetToken = () => {
    removeToken()
    token.value = ""
    roles.value = []
  }
  /** 重置 Visited Views 和 Cached Views */
  const _resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews()
      tagsViewStore.delAllCachedViews()
    }
  }

  return { token, roles, userinfo, login, changeRoles, logout, resetToken, getInfo }
})

/** 在 setup 外使用 */
export function useUserStoreHook() {
  return useUserStore(store)
}

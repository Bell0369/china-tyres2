import { useTagsViewStore } from "@/store/modules/tags-view"

// 刷新緩存列表
export function handleActivated() {
  const isReplace = parseInt(sessionStorage.getItem("isReplace") || "0")
  if (isReplace) sessionStorage.setItem("isReplace", "0")
  return isReplace
}

// 關閉tab並跳轉
export function redirectTo(router, route, path) {
  const tagsViewStore = useTagsViewStore()
  tagsViewStore.delVisitedView(route)
  router.replace(path)
  sessionStorage.setItem("isReplace", "1")
}

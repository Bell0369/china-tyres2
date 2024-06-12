import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/checkLogin",
    method: "post",
    data
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<Login.UserInfoResponseData>({
    url: "user/userInfo",
    method: "get"
  })
}

/** 获取用户详情 */
export function getTokenApi() {
  return request<Login.LoginResponseData>({
    url: "user/refreshToken",
    method: "post"
  })
}

// 修改密碼
export function updatePasswordApi(data) {
  return request({
    url: "user/editPassword",
    method: "post",
    data
  })
}

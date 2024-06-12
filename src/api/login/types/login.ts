export interface LoginRequestData {
  account: string
  /** 密码 */
  password: string
}

interface Permission {
  id: number
  title: string
  authority: string
  item?: Permission[]
}

export type LoginResponseData = ApiResponseData<{
  token: string
  permission: Permission[]
}>

export type UserInfoResponseData = ApiResponseData<{ userinfo: object; roles: string[] }>

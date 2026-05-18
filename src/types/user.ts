export interface UserProfile {
  name: string
  roleLine: string
  regionLine: string
  avatarUrl?: string
  wechatNickname?: string
  miniProgramOpenId?: string
  staffId?: string
}

export interface SecuritySettings {
  maskPropertyContact: boolean
  maskCustomerPhone: boolean
  forbidLongPressCopy: boolean
  auditPublish: boolean
}

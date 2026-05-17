export interface UserProfile {
  name: string
  roleLine: string
  regionLine: string
}

export interface SecuritySettings {
  maskPropertyContact: boolean
  maskCustomerPhone: boolean
  forbidLongPressCopy: boolean
  auditPublish: boolean
}

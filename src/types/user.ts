export interface UserProfile {
  name: string
  roleLine: string
  regionLine: string
  avatarUrl?: string
  staffId?: string
  employeeNo?: string
}

export interface SecuritySettings {
  maskPropertyContact: boolean
  maskCustomerPhone: boolean
  forbidLongPressCopy: boolean
  auditPublish: boolean
}

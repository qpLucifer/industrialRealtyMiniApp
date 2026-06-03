export interface UserProfile {
  name: string
  roleLine: string
  regionLine: string
  avatarUrl?: string
  staffId?: string
  employeeNo?: string
  /** sale | rent | both — mini property list sector */
  propertySectorScope?: 'sale' | 'rent' | 'both'
  propertyListTabs?: { key: string; label: string; status: string }[]
}

export interface SecuritySettings {
  maskPropertyContact: boolean
  maskCustomerPhone: boolean
  forbidLongPressCopy: boolean
  auditPublish: boolean
}

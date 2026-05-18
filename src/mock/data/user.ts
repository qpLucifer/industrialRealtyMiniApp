/** Profile + settings mock */

export interface UserProfile {
  name: string
  roleLine: string
  regionLine: string
  avatarUrl?: string
  employeeNo?: string
  staffId?: string
}

export const mockUserProfile: UserProfile = {
  name: '陈思远',
  roleLine: '高级业务员',
  regionLine: '负责区域：黄埔区、增城区（不可跨区导出）',
  employeeNo: 'E-900218',
  staffId: 's1',
  avatarUrl: '',
}

export interface SecuritySettings {
  maskPropertyContact: boolean
  maskCustomerPhone: boolean
  forbidLongPressCopy: boolean
  auditPublish: boolean
}

export const mockSecuritySettings: SecuritySettings = {
  maskPropertyContact: true,
  maskCustomerPhone: true,
  forbidLongPressCopy: true,
  auditPublish: false,
}

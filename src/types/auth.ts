/** Mini-program login payload (matches industrial-realty-server miniProfileFromStaffRow + session fields). */

export interface MiniStaffProfile {
  name?: string
  staffId?: string
  employeeNo?: string
  department?: string
  title?: string
  roleLine?: string
  regionLine?: string
  avatarUrl?: string
}

export interface MiniLoginResult {
  token: string
  expiresAt: string
  expiresIn: number
  profile: MiniStaffProfile
}

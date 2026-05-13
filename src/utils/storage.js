const KEY_LOGGED_IN = 'ic_auth_logged_in'
const KEY_PROP_DETAIL_ID = 'ic_prop_detail_id'
const KEY_CUST_DETAIL_ID = 'ic_cust_detail_id'
const KEY_AUDIT_PUBLISH = 'ic_audit_publish_required'

export function setLoggedIn(v) {
  uni.setStorageSync(KEY_LOGGED_IN, !!v)
}

export function isLoggedIn() {
  return !!uni.getStorageSync(KEY_LOGGED_IN)
}

export function setPropertyDetailId(id) {
  uni.setStorageSync(KEY_PROP_DETAIL_ID, id || '')
}

export function getPropertyDetailId() {
  return uni.getStorageSync(KEY_PROP_DETAIL_ID) || 'P-8821'
}

export function setCustomerDetailId(id) {
  uni.setStorageSync(KEY_CUST_DETAIL_ID, id || '')
}

export function getCustomerDetailId() {
  return uni.getStorageSync(KEY_CUST_DETAIL_ID) || 'zhangchen'
}

export function setAuditPublishRequired(on) {
  uni.setStorageSync(KEY_AUDIT_PUBLISH, !!on)
}

export function getAuditPublishRequired() {
  const v = uni.getStorageSync(KEY_AUDIT_PUBLISH)
  if (v === '' || v === undefined || v === null) return true
  return !!v
}

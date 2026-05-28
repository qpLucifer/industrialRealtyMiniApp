/** Official mini-program brand name */
export const BRAND_NAME = '鹏基工业地产'

/** Tab page top-bar title prefix */
export const TAB_BRAND = BRAND_NAME

export function tabBrandTitle(pageName: string) {
  return `${TAB_BRAND} · ${pageName}`
}

/** Server-backed form picker: page size for search-as-you-type lists */
export const PICKER_SEARCH_PAGE_SIZE = 20

export type PickerSearchPage<T> = {
  list: T[]
  hasMore: boolean
}

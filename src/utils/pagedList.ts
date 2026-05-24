import { ref } from 'vue'

export const MINI_LIST_PAGE_SIZE = 10

export type PagedListMeta = {
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export type PagedListResponse<T> = PagedListMeta & { list: T[] }

export function usePagedList<T>(fetchPage: (page: number) => Promise<PagedListResponse<T>>) {
  const items = ref<T[]>([]) as { value: T[] }
  const page = ref(1)
  const total = ref(0)
  const hasMore = ref(false)
  const loading = ref(false)
  const loadingMore = ref(false)

  async function loadFirst() {
    loading.value = true
    try {
      const r = await fetchPage(1)
      items.value = r.list ?? []
      total.value = r.total ?? 0
      hasMore.value = Boolean(r.hasMore)
      page.value = 1
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loadingMore.value || loading.value) return
    loadingMore.value = true
    try {
      const next = page.value + 1
      const r = await fetchPage(next)
      items.value = [...items.value, ...(r.list ?? [])]
      total.value = r.total ?? 0
      hasMore.value = Boolean(r.hasMore)
      page.value = next
    } finally {
      loadingMore.value = false
    }
  }

  return { items, page, total, hasMore, loading, loadingMore, loadFirst, loadMore }
}

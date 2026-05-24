<script setup lang="ts" generic="T">
/**
 * Paginated list inside scroll-view (no fixed-height virtual windowing).
 * Mini-program lists load 10 rows per page; native scroll is sufficient and avoids
 * layout jumps from mismatched estimated row heights.
 */
const props = withDefaults(
  defineProps<{
    items: T[]
    loading?: boolean
    loadingMore?: boolean
    hasMore?: boolean
    emptyText?: string
    /** Extra class on page-scroll__inner (e.g. msg-page) */
    innerClass?: string
  }>(),
  {
    emptyText: '暂无数据',
    innerClass: '',
  },
)

const emit = defineEmits<{ loadMore: [] }>()

function rowKey(item: T, index: number) {
  const row = item as Record<string, unknown>
  const id = row.id ?? row.code ?? row.slug ?? row.messageId
  return id != null && String(id) !== '' ? String(id) : `row-${index}`
}

function onScrollToLower() {
  if (!props.hasMore || props.loadingMore || props.loading) return
  emit('loadMore')
}
</script>

<template>
  <scroll-view
    scroll-y
    :show-scrollbar="false"
    class="paged-scroll-list"
    :lower-threshold="120"
    @scrolltolower="onScrollToLower"
  >
    <view class="page-scroll__inner" :class="innerClass">
      <view v-if="loading && !items.length" class="paged-scroll-list__status">
        <slot name="loading"><text class="hint">加载中…</text></slot>
      </view>
      <view v-else-if="!items.length" class="paged-scroll-list__status">
        <slot name="empty"><text class="hint">{{ emptyText }}</text></slot>
      </view>
      <template v-else>
        <view v-for="(item, index) in items" :key="rowKey(item, index)" class="paged-scroll-list__item">
          <slot name="item" :item="item" :index="index" />
        </view>
      </template>
      <view v-if="loadingMore" class="paged-scroll-list__status">
        <text class="hint">加载更多…</text>
      </view>
      <view v-else-if="items.length && !hasMore" class="paged-scroll-list__status">
        <text class="hint muted">没有更多了</text>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.paged-scroll-list {
  flex: 1;
  min-height: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.paged-scroll-list__item {
  display: block;
}

.paged-scroll-list__status {
  padding: 32rpx 0;
  text-align: center;
}

.hint.muted {
  color: var(--muted, #94a3b8);
  font-size: 24rpx;
}
</style>

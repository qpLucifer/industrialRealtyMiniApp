<script setup lang="ts">
import { useTopBarInsetStyle } from '@/composables/useTopBarInsetStyle'

export type NavIconAction = {
  key: string
  icon: 'log' | 'add' | 'close' | 'more'
  ariaLabel?: string
}

const props = withDefaults(
  defineProps<{
    title: string
    showBack?: boolean
    backIcon?: 'back' | 'close'
    actions?: NavIconAction[]
  }>(),
  {
    showBack: true,
    backIcon: 'back',
    actions: () => [],
  },
)

const emit = defineEmits<{
  back: []
  action: [key: string]
}>()

const topBarInsetStyle = useTopBarInsetStyle()

function onAction(key: string) {
  emit('action', key)
}
</script>

<template>
  <view class="top-bar top-bar--nav" :style="topBarInsetStyle">
    <view class="top-bar__navrow">
      <view class="top-bar__nav-left">
        <view
          v-if="showBack"
          class="nav-icon-btn"
          role="button"
          :aria-label="backIcon === 'close' ? '关闭' : '返回'"
          @click="emit('back')"
        >
          <view :class="backIcon === 'close' ? 'ic-nav-close' : 'ic-nav-back'" />
        </view>
      </view>
      <view class="top-bar__nav-mid">{{ title }}</view>
      <view class="top-bar__nav-right">
        <view
          v-for="a in actions"
          :key="a.key"
          class="nav-icon-btn"
          role="button"
          :aria-label="a.ariaLabel || a.key"
          @click="onAction(a.key)"
        >
          <view v-if="a.icon === 'log'" class="ic-nav-log" />
          <view v-else-if="a.icon === 'add'" class="ic-nav-add" />
          <view v-else-if="a.icon === 'close'" class="ic-nav-close" />
          <view v-else class="ic-nav-more" />
        </view>
      </view>
    </view>
  </view>
</template>

<template>
  <view class="ic-chip" :class="['ic-chip--' + type, on ? 'ic-chip--on' : '']" @tap="$emit('tap')">
    <slot />
  </view>
</template>

<script setup>
defineProps({
  type: { type: String, default: 'plain' },
  on: { type: Boolean, default: false },
})
defineEmits(['tap'])
</script>

<style lang="scss">
@import '@/styles/theme.scss';

.ic-chip {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
  border: 1rpx solid $ic-border;
  color: $ic-cyan;
  background: #f1f5f9;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

.ic-chip--on {
  background: linear-gradient(135deg, #ccfbf1, #99f6e4);
  color: #134e4a;
  border-color: rgba(13, 148, 136, 0.45);
}

.ic-chip--ok {
  background: #d1fae5;
  color: #047857;
  border-color: rgba(16, 185, 129, 0.25);
}

.ic-chip--warn {
  background: #fef3c7;
  color: #b45309;
  border-color: rgba(245, 158, 11, 0.3);
}

.ic-chip--danger {
  background: #ffe4e6;
  color: #be123c;
  border-color: rgba(244, 63, 94, 0.25);
}

.ic-chip--neutral {
  background: #e2e8f0;
  color: #475569;
  border-color: rgba(100, 116, 139, 0.25);
}

.ic-chip--plain {
  background: #f1f5f9;
  color: $ic-cyan;
}
</style>

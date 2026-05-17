<script setup lang="ts">
/**
 * Tap target without WeChat native <button> ::after border.
 * Use for nav/actions; keep semantic classes: btn-primary | btn-secondary | btn-ghost.
 */
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'md' | 'sm'
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', size: 'md', disabled: false, block: false },
)

const emit = defineEmits<{ (e: 'tap'): void }>()

function onTap() {
  emit('tap')
}
</script>

<template>
  <view
    class="app-btn"
    :class="[
      variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost',
      size === 'sm' ? 'sm' : '',
      { 'app-btn--block': block, 'app-btn--disabled': disabled },
    ]"
    hover-class="app-btn--hover"
    @tap="disabled ? undefined : onTap()"
  >
    <slot />
  </view>
</template>

<style scoped>
.app-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.app-btn--block {
  display: flex;
  width: 100%;
}

.app-btn--disabled {
  opacity: 0.5;
  pointer-events: none;
}

.app-btn--hover {
  opacity: 0.92;
}
</style>

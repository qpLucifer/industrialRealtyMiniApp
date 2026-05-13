<script>
export default {
  onLaunch() {
    try {
      uni.hideTabBar({ animation: false })
    } catch (e) {
      /* non-tab environments */
    }
  },
  onShow() {},
}
</script>

<style lang="scss">
@import '@/styles/theme.scss';

page {
  background-color: $ic-bg-deep;
  color: $ic-text;
  font-size: 28rpx;
  box-sizing: border-box;
}

view,
text,
scroll-view {
  box-sizing: border-box;
}
</style>

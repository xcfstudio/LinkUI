<template>
  <!-- 全局布局外壳，百分百撑满视口 -->
  <div class="main-layout">
    <!-- 顶部导航栏：固定高度100px -->
    <header class="layout-header">
      <slot name="header">
        <!-- 默认顶部内容，可通过插槽自定义覆盖 -->
        <div class="header-content">Vue3 后台顶部导航栏</div>
      </slot>
    </header>

    <!-- 中间内容区域：自适应高度，核心区域 -->
    <main class="layout-main">
      <slot />
    </main>

    <!-- 底部Footer：固定高度100px -->
    <footer class="layout-footer">
      <slot name="footer">
        <!-- 默认底部内容，可通过插槽自定义覆盖 -->
        <div class="footer-content">Copyright © 2026 Vue3项目 版权所有</div>
      </slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 纯布局组件，无业务逻辑，预留插槽扩展
</script>

<style scoped lang="scss">
// 根布局重置，消除默认边距
.main-layout {
  width: 100%;
  min-height: 100vh; // 整体最小高度撑满浏览器视口
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// 顶部导航 - 固定高度100px，固定在顶部不随滚动
.layout-header {
  position: fixed; // 固定定位
  top: 0;
  left: 0;
  right: 0;
  z-index: 100; // 确保在其他元素之上
  height: 80px;
  flex-shrink: 0; // 禁止被压缩
  background: var(--bg-secondary-opacity-80);
  backdrop-filter: blur(12px); // 毛玻璃模糊效果
  -webkit-backdrop-filter: blur(12px); // Safari 兼容性
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.164);
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-sizing: border-box;
  z-index: 9999;

  // 响应式：移动端高度调整为60px
  @media screen and (max-width: 768px) {
    height: 60px;
    padding: 0 16px;
  }
}

// 中间内容区 - 自适应核心
.layout-main {
  flex: 1; // 自动占满剩余空间
  width: 100%;
  box-sizing: border-box;
  // padding: 20px;
  // padding-top: 100px; // 预留 header 高度空间，避免内容被遮挡
  background: #f5f7fa;
  background-image: url('/pic/bgimg.jpg'); // 使用示例图片
  background-size: cover; // 铺满容器且保持比例不变形
  background-position: center; // 居中显示
  background-repeat: no-repeat; // 不重复
  // 内容少时自适应剩余高度，内容多时自动撑开，无需手动设置高度
}

// 底部Footer - 固定高度100px
.layout-footer {
  height: 60px;
  flex-shrink: 0; // 禁止被压缩
  background: var(--bg-secondary-opacity-80);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.164);
  z-index: 9999;
  backdrop-filter: blur(22px); // 毛玻璃模糊效果
  -webkit-backdrop-filter: blur(22px); // Safari 兼容性
}

// 默认插槽内容样式
.header-content,
.footer-content {
  font-size: 16px;
  color: #333;
}
</style>

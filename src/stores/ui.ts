import { defineStore } from 'pinia'

/**
 * UI状态管理
 */
export const useUiStore = defineStore('ui', {
  state: () => ({
    // 是否折叠移动端导航栏
    isCollapseMobileMenu: true,
  }),
  actions: {
    // 切换移动端导航栏折叠状态
    toggleCollapseMobileMenu() {
      this.isCollapseMobileMenu = !this.isCollapseMobileMenu
    },
    // 关闭移动端导航栏
    closeMobileMenu() {
      this.isCollapseMobileMenu = true
    },
  },
})

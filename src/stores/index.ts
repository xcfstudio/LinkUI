import { createPinia } from 'pinia'

// 创建根实例
const pinia = createPinia()

export default pinia

// 统一导出所有store，页面引入更方便
// export * from './user'
export * from './ui'
export * from './proc'

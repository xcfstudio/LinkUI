<template>
  <MainLayout
    :data-theme="isDarkMode === '1' ? 'dark' : 'light'"
    :class="{ 'dark-theme': isDarkMode === '1' }"
  >
    <!-- 自定义顶部导航 -->
    <template #header>
      <HeaderContent :dark="isDarkMode" @switchDarkMode="switchDarkMode" />
    </template>

    <!-- 页面主体内容 -->
    <router-view />

    <!-- 自定义底部 -->
    <template #footer>
      <!-- copyright -->
      <FooterContent />
    </template>
  </MainLayout>
</template>

<style scoped></style>

<script setup lang="ts">
import FooterContent from './components/FooterContent.vue'
import MainLayout from './layouts/MainLayout.vue'
import HeaderContent from './components/HeaderContent.vue'
import { useProcStore } from '@/stores/index.ts'
import { useRouter } from 'vue-router' // 新增导入

import { onUnmounted, ref } from 'vue'
import { onMounted } from 'vue'
import { LMessage } from './components/index.ts'

let updateProcTimer: ReturnType<typeof setInterval> | null = null
let updateLanStationTimer: ReturnType<typeof setInterval> | null = null

const router = useRouter()

const procStore = useProcStore()
const procUpdateInterval = 2000

const isDarkMode = ref('0')
const switchDarkMode = () => {
  isDarkMode.value = isDarkMode.value === '0' ? '1' : '0'
  localStorage.setItem('isDarkMode', isDarkMode.value)
  updateBodyTheme()
}

const updateBodyTheme = () => {
  const body = document.body
  if (isDarkMode.value === '1') {
    body.setAttribute('data-theme', 'dark')
  } else {
    body.setAttribute('data-theme', 'light')
  }
}

onMounted(() => {
  isDarkMode.value = localStorage.getItem('isDarkMode') || '1'
  updateBodyTheme()

  // 登录状态检查
  procStore.updateLoginStatus()

  // 初始化设备信息
  procStore.updateProc()

  // 循环更新设备信息
  updateProcTimer = setInterval(async () => {
    await procStore.updateProc()

    if (procStore.proc.loginfo !== 'ok' && router.currentRoute.value.path !== '/login') {
      location.href = '#/login'
      LMessage({
        message: '登录过期，请重新登录',
        type: 'error',
        duration: 3000,
        closable: true,
      })
    }

    // 获取当前流量值
    const currentTx = procStore.proc.realtime_tx_bytes || 0
    const currentRx = procStore.proc.realtime_rx_bytes || 0

    // 计算网速（处理数值溢出重置的情况）
    if (currentTx >= procStore.lastTxBytes) {
      procStore.currentTxSpeed = (currentTx - procStore.lastTxBytes) / (procUpdateInterval / 1000)
    } else {
      procStore.currentTxSpeed = currentTx / (procUpdateInterval / 1000)
    }

    if (currentRx >= procStore.lastRxBytes) {
      procStore.currentRxSpeed = (currentRx - procStore.lastRxBytes) / (procUpdateInterval / 1000)
    } else {
      procStore.currentRxSpeed = currentRx / (procUpdateInterval / 1000)
    }

    // 更新上次值
    procStore.lastTxBytes = currentTx
    procStore.lastRxBytes = currentRx
  }, procUpdateInterval)

  // 初始化局域网有线终端列表
  procStore.updateLanStationList()

  // 循环更新局域网有线终端列表
  updateLanStationTimer = setInterval(() => {
    procStore.updateLanStationList()
  }, 10000)
})

// 组件卸载时清除所有定时器
onUnmounted(() => {
  if (updateProcTimer) {
    clearInterval(updateProcTimer)
    updateProcTimer = null
  }
  if (updateLanStationTimer) {
    clearInterval(updateLanStationTimer)
    updateLanStationTimer = null
  }
})
</script>

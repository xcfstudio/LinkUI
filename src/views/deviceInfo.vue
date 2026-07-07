<template>
  <div class="con glass-card">
    <div class="device-info-page">
      <!-- 顶部概览卡片 -->
      <div class="overview-cards">
        <!-- 外网连接状态 -->
        <div class="status-card">
          <div class="l">
            <div
              class="status-icon"
              style="cursor: pointer"
              @click="testMessage"
              :class="{
                connected: proc.ppp_status === 'ppp_connected',
                disconnected: proc.ppp_status !== 'ppp_connected',
              }"
            >
              <span class="iconfont">{{
                proc.ppp_status === 'ppp_connected' ? '&#xe772;' : '&#xe61b;'
              }}</span>
            </div>
            <div class="status-content">
              <span class="status-label">外网连接</span>
              <span
                class="status-value"
                :class="{
                  success: proc.ppp_status === 'ppp_connected',
                  danger: proc.ppp_status !== 'ppp_connected',
                }"
              >
                {{ proc.ppp_status === 'ppp_connected' ? '已连接' : '已断开' }}
              </span>
            </div>
          </div>
          <LSwitch
            v-model="networkEnabled"
            @change="handleNetworkToggle"
            :disabled="isNetworkLoading"
          />
        </div>

        <!-- 实时网速 -->
        <div class="speed-card">
          <div class="speed-icon">
            <span class="iconfont">&#xe60f;</span>
          </div>
          <div class="speed-content">
            <div class="speed-row">
              <span class="speed-label">上行</span>
              <span class="speed-value">{{ formatSpeed(currentTxSpeed) }}</span>
            </div>
            <div class="speed-row">
              <span class="speed-label">下行</span>
              <span class="speed-value">{{ formatSpeed(currentRxSpeed) }}</span>
            </div>
          </div>
        </div>

        <!-- 电池状态 -->
        <div class="battery-card">
          <div class="battery-icon" :class="{ charging: isCharging }">
            <!-- TODO:核实charging -->
            <span class="iconfont">{{
              proc.battery_charging === '1' || proc.battery_charging === 'discharging'
                ? '&#xe618;'
                : '&#xe779;'
            }}</span>
          </div>
          <div class="battery-box">
            <div class="battery-content">
              <span class="battery-label">{{
                proc.battery_charging === '1' || proc.battery_charging === 'discharging'
                  ? '充电中'
                  : '放电中'
              }}</span>
              <span class="battery-value">{{ batteryLevel }}%</span>
            </div>
            <div class="battery-bar">
              <div
                class="battery-fill"
                :style="{ width: batteryLevel + '%' }"
                :class="{
                  charging:
                    proc.battery_charging === 'charging' || proc.battery_charging === 'discharging',
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- 接入设备 -->
        <div class="device-count-card">
          <div class="count-icon">
            <span class="iconfont">&#xe619;</span>
          </div>
          <div class="count-content">
            <span class="count-label">接入设备</span>
            <span class="count-value"
              >无线 <span class="count">{{ proc.sta_count || '0' }}</span> 台；有线
              <span class="count">{{ lanStationList.length || '0' }}</span> 台</span
            >
          </div>
        </div>
      </div>

      <!-- SIM卡信息 -->
      <div class="info-section">
        <h2 class="section-title">
          <span class="iconfont">{{ simValid ? '&#xea66;' : '&#xe60b;' }}</span>
          SIM卡信息
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">SIM卡状态</span>
            <span class="info-value" :class="{ success: simValid, danger: !simValid }">
              {{ simValid ? '有效' : '无效' }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">运营商</span>
            <span class="info-value">{{ carrier }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">信号强度</span>
            <span class="info-value">{{ signalStrength }} dBm（{{ signalMark }}）</span>
          </div>
          <div class="info-item">
            <span class="info-label">ICCID</span>
            <span class="info-value">{{ proc.ziccid || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">IMEI</span>
            <span class="info-value">{{ imei }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">IMSI</span>
            <span class="info-value">{{ imsi }}</span>
          </div>
        </div>
      </div>

      <!-- WiFi信息 -->
      <div class="info-section">
        <h2 class="section-title">
          <span class="iconfont">&#xe602;</span>
          无线信息
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">WiFi名称</span>
            <span class="info-value">{{ wifiName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">LTE频段</span>
            <span class="info-value">{{ band }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最大连接数</span>
            <span class="info-value">{{ maxConnections }} 台</span>
          </div>
          <div class="info-item">
            <span class="info-label">WiFi功率</span>
            <span class="info-value">{{ wifiPower }}</span>
          </div>
        </div>
      </div>

      <!-- 网络信息 -->
      <div class="info-section">
        <h2 class="section-title">
          <span class="iconfont">&#xe76f;</span>
          网络信息
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">局域网域名</span>
            <span class="info-value">{{ lanDomain }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">LAN IP</span>
            <span class="info-value">{{ lanIp }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">WAN IP</span>
            <span class="info-value">{{ wanIp }}</span>
          </div>
        </div>
      </div>

      <!-- 设备版本信息 -->
      <div class="info-section">
        <h2 class="section-title">
          <span class="iconfont">&#xe60a;</span>
          版本信息
        </h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">软件版本</span>
            <span class="info-value">{{ softwareVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">硬件版本</span>
            <span class="info-value">{{ hardwareVersion }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getBasicInfo } from '@/api/basic.api'
import { onMounted, ref, computed, onUnmounted } from 'vue'
import { useProcStore } from '@/stores/proc'
import { LMessage, LSwitch } from '@/components'

const procStore = useProcStore()
const proc = computed(() => procStore.proc)
const lanStationList = computed(() => procStore.lanStationList)

// ui控制
const testMessage = () => {
  LMessage({
    message: '这是一条测试消息',
    type: 'error',
    duration: 3000,
    closable: true,
  })
}

// 状态数据
const isCharging = ref(false)
const batteryLevel = computed(
  () => proc.value.battery_vol_percent || (proc.value.battery_pers / 4) * 100 || '100',
)

// 网络开关状态
const networkEnabled = computed({
  get: () => proc.value.ppp_status === 'ppp_connected',
  set: (value: boolean) => {
    // 由 @change 事件处理实际切换逻辑
  },
})
const isNetworkLoading = ref(false)

// 网络切换处理
const handleNetworkToggle = async (enabled: boolean) => {
  isNetworkLoading.value = true
  try {
    // 模拟网络请求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (enabled) {
      // 开启网络
      await procStore.connectNetwork()
      LMessage({
        message: '网络已连接',
        type: 'success',
      })
    } else {
      // 关闭网络
      await procStore.disconnectNetwork()
      LMessage({
        message: '网络已断开',
        type: 'warning',
      })
    }
  } catch (error) {
    LMessage({
      message: '操作失败',
      type: 'error',
    })
  } finally {
    isNetworkLoading.value = false
  }
}

// 网速计算相关
const updateInterval = 2000 // 更新间隔(毫秒)
const lastTxBytes = ref(0)
const lastRxBytes = ref(0)
const currentTxSpeed = computed(() => procStore.currentTxSpeed)
const currentRxSpeed = computed(() => procStore.currentRxSpeed)

const simValid = computed(
  () =>
    proc.value.ziccid &&
    proc.value.ziccid !== '000000000000000' &&
    proc.value.modem_main_state !== 'modem_sim_undetected',
)
const carrier = computed(() => {
  if (proc.value.network_provider) {
    if (proc.value.network_provider === 'China Mobile') {
      return '中国移动'
    }
    if (proc.value.network_provider === 'China Unicom') {
      return '中国联通'
    }
    if (proc.value.network_provider === 'China Telecom') {
      return '中国电信'
    }
    if (proc.value.network_provider === 'China Broadnet') {
      return '中国广电'
    }
    return proc.value.network_provider || '-'
  }
  return '-'
})
const signalStrength = computed(() => proc.value.rssi || proc.value.lte_rsrp || '-')
const signalMark = computed(() => {
  const strength = signalStrength.value
  if (strength === '-' || strength === undefined) return '-'

  const rssi = parseInt(strength.toString().replace(' dBm', ''))
  if (isNaN(rssi)) return '-'

  if (rssi >= -50) return '极好'
  if (rssi >= -60) return '优秀'
  if (rssi >= -70) return '正常'
  if (rssi >= -80) return '偏弱'
  return '较差'
})
const imei = computed(() => proc.value.imei || '-')
const imsi = computed(() => proc.value.imsi || proc.value.sim_imsi || '-')
const wifiName = computed(() => proc.value.ssid || proc.value.SSID1 || '-')
const band = computed(() => 'B' + proc.value.lte_band || '-')
const maxConnections = computed(() => proc.value.MAX_Access_num || '-')
const wifiPower = computed(() => {
  if (proc.value.wifi_coverage === 'short_mode') {
    return '节能'
  }
  if (proc.value.wifi_coverage === 'medium_mode') {
    return '标准功率'
  }
  if (proc.value.wifi_coverage === 'long_mode') {
    return '大功率'
  }
  return '-'
})

const lanDomain = ref('m.home')
const lanIp = computed(() => proc.value.lan_ipaddr || '-')
const wanIp = computed(() => proc.value.wan_ipaddr || '-')
const softwareVersion = computed(() => proc.value.cr_version || '-')
const hardwareVersion = computed(() => proc.value.hw_version || '-')

// 格式化网速，自动切换单位
const formatSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond < 1024) {
    return `${bytesPerSecond.toFixed(0)} B/s`
  } else if (bytesPerSecond < 1024 * 1024) {
    return `${(bytesPerSecond / 1024).toFixed(1)} kb/s`
  } else {
    return `${(bytesPerSecond / 1024 / 1024).toFixed(2)} Mb/s`
  }
}

//初始化
onMounted(async () => {
  // 登录状态检查
  const res = (await getBasicInfo('loginfo')).data
  if (res.loginfo !== 'ok') {
    location.href = '#/login'
    LMessage({
      message: '登录过期，请重新登录',
      type: 'error',
      duration: 3000,
      closable: true,
    })
  }

  // lastTxBytes.value = procStore.proc.realtime_tx_bytes || 0
  // lastRxBytes.value = procStore.proc.realtime_rx_bytes || 0
})
</script>

<style scoped lang="scss">
// 页面容器
.con {
  width: 100%;
  background: var(--bg-secondary-opacity-80);
  display: flex;
  justify-content: center;
}

.device-info-page {
  max-width: 1200px;
  padding: 20px;
  padding-top: 100px;
  min-height: calc(100vh - 80px);
}

// 概览卡片组
.overview-cards {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

// 状态卡片
.status-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .l {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      transition: all 0.3s ease;

      &.connected {
        background: rgba(34, 197, 94, 0.1);
        color: var(--success);
      }

      &.disconnected {
        background: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
    }

    .status-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .status-label {
        font-size: 13px;
        color: var(--text-tertiary);
      }

      .status-value {
        font-size: 16px;
        font-weight: 600;

        &.success {
          color: var(--success);
        }

        &.danger {
          color: var(--danger);
        }
      }
    }
  }
}

// 网速卡片
.speed-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .speed-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(14, 165, 233, 0.1);
    color: var(--primary);
  }

  .speed-content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .speed-row {
      display: flex;
      align-items: center;
      gap: 12px;

      .speed-label {
        font-size: 13px;
        color: var(--text-tertiary);
        min-width: 32px;
      }

      .speed-value {
        font-size: 15px;
        font-weight: 500;
        color: var(--text-primary);
      }
    }
  }
}

// 电池卡片
.battery-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  // flex-direction: column;
  gap: 12px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .battery-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);

    &.charging {
      background: rgba(34, 197, 94, 0.1);
      color: var(--success);
      animation: pulse 2s ease-in-out infinite;
    }
  }

  .battery-box {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .battery-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .battery-label {
        font-size: 13px;
        color: var(--text-tertiary);
      }

      .battery-value {
        font-size: 18px;
        font-weight: 600;
        margin-left: 5px;
        color: var(--text-primary);
      }
    }

    .battery-bar {
      margin-top: 5px;
      height: 8px;
      background: var(--border-color);
      border-radius: 3px;
      overflow: hidden;

      .battery-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--success), var(--warning));
        border-radius: 3px;
        transition: width 0.5s ease;

        &.charging {
          background: linear-gradient(90deg, var(--success), var(--primary));
          animation: charge 1.5s ease-in-out infinite;
        }
      }
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.6;
  }
}

@keyframes charge {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

// 设备数量卡片
.device-count-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .count-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(139, 92, 246, 0.1);
    color: var(--accent-violet);
  }

  .count-content {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .count-label {
      font-size: 13px;
      color: var(--text-tertiary);
    }

    .count-value {
      font-size: 16px;
      font-weight: lighter;
      color: var(--text-primary);

      span.count {
        font-size: 18px;
        font-weight: 600;
        color: var(--text-primary);
      }
    }
  }
}

// 毛玻璃效果通用类
.glass-card {
  background: var(--bg-secondary);
  // backdrop-filter: blur(30px);
  // -webkit-backdrop-filter: blur(20px);
  // border-radius: 16px;
  // border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

// 信息区块
.info-section {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 20px 0;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);

    .iconfont {
      color: var(--primary);
      font-size: 18px;
    }
  }
}

// 信息网格
.info-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

// 信息项
.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 12px;

  .info-label {
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .info-value {
    font-size: 15px;
    font-weight: 500;
    color: var(--text-primary);
    word-break: break-all;
    white-space: normal;
    word-wrap: break-word;

    &.success {
      color: var(--success);
    }

    &.danger {
      color: var(--danger);
    }
  }
}

// 响应式调整
@media (max-width: 768px) {
  .device-info-page {
    padding: 16px;
    padding-top: 90px;
  }

  .overview-cards {
    gap: 12px;
  }

  .status-card,
  .speed-card,
  .battery-card,
  .device-count-card {
    padding: 16px;
  }

  .info-section {
    padding: 16px;
  }
}
</style>

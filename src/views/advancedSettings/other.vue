<template>
  <div class="other-page">
    <div class="module">
      <h2 class="module-title">重启与复位</h2>
      <div class="module-content">
        <p class="tips-text">当重启或复位路由器后，你需要重新登陆</p>
        <div class="action-bar">
          <LButton type="primary" @click="restartDevice">重启设备</LButton>
          <LButton type="danger" @click="showRestoreDialog = true">恢复出厂设置</LButton>
        </div>
      </div>
    </div>

    <div class="module">
      <h2 class="module-title">关机</h2>
      <p class="tips-text">此操作将关闭路由器，所有连接将被断开</p>
      <div class="module-content">
        <div class="action-bar">
          <LButton type="danger" @click="showShutdownDialog = true">关机</LButton>
        </div>
      </div>
    </div>

    <div class="module">
      <h2 class="module-title">快速开机设置</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">快速开机设置</label>
          <div class="radio-group">
            <LRadio v-model="fastBootEnabled" label="1" name="fastBootEnabled">启用</LRadio>
            <LRadio v-model="fastBootEnabled" label="0" name="fastBootEnabled">关闭</LRadio>
          </div>
        </div>
        <div class="action-bar">
          <LButton type="primary" @click="applyFastBoot">应用</LButton>
        </div>
      </div>
    </div>

    <div class="module">
      <h2 class="module-title">SNTP</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">本地当前时间</label>
          <LInput v-model="currentTime" disabled />
        </div>

        <div class="form-item">
          <label class="form-label">时间设置模式</label>
          <LSelect v-model="timeMode" :options="timeModeOptions" />
        </div>

        <div class="form-item">
          <label class="form-label">
            SNTP 服务器1
            <span class="required">*</span>
          </label>
          <LSelect v-model="sntpServer1" :options="sntpServerOptions" />
        </div>

        <div class="form-item">
          <label class="form-label">
            SNTP 服务器2
            <span class="required">*</span>
          </label>
          <LSelect v-model="sntpServer2" :options="sntpServerOptions" />
        </div>

        <div class="form-item">
          <label class="form-label">
            SNTP 服务器3
            <span class="required">*</span>
          </label>
          <LSelect v-model="sntpServer3" :options="sntpServerOptions" />
        </div>

        <div class="form-item">
          <label class="form-label">时区</label>
          <LSelect v-model="timezone" :options="timezoneOptions" />
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applySntp">应用</LButton>
        </div>
      </div>
    </div>

    <div class="module">
      <h2 class="module-title">SIM卡选择</h2>
      <div class="module-content">
        <div class="form-item">
          <LSelect v-model="simCard" :options="simCardOptions" />
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applySimCard">应用</LButton>
        </div>
      </div>
    </div>

    <LDialog
      v-model:visible="showRestoreDialog"
      title="恢复出厂设置"
      message="确定要恢复出厂设置吗？所有设置将被清除！"
      confirmText="确认恢复"
      cancelText="取消"
      @confirm="handleRestoreConfirm"
    />

    <LDialog
      v-model:visible="showShutdownDialog"
      title="关机"
      message="确定要关机吗？"
      confirmText="确认关机"
      cancelText="取消"
      @confirm="handleShutdownConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LRadio, LButton, LInput, LSelect, LMessage, LDialog } from '@/components'
import {
  getFastBootSettings,
  setFastBoot,
  getSntpSettings,
  setSntp,
  getSimSelect,
  setSimSelect,
  shutdownDevice as apiShutdownDevice,
  rebootDevice,
  restoreFactory as apiRestoreFactory,
  getBasicInfo,
} from '@/api/basic.api'

const fastBootEnabled = ref('0')
const currentTime = ref('')
const timeMode = ref('auto')
const sntpServer1 = ref('time-nw.nist.gov')
const sntpServer2 = ref('pool.ntp.org')
const sntpServer3 = ref('europe.pool.ntp.org')
const timezone = ref('CST-8')
const timezoneIndex = ref('0')
const dstEnabled = ref('0')
const simCard = ref('0')
const isLoading = ref(false)
const isRebooting = ref(false)
const showRestoreDialog = ref(false)
const showShutdownDialog = ref(false)

let timeInterval: ReturnType<typeof setInterval> | null = null
let pollInterval: ReturnType<typeof setInterval> | null = null

const timeModeOptions = [
  { label: '自动同步Sntp', value: 'auto' },
  { label: '手动设置', value: 'manual' },
]

const sntpServerOptions = [
  { label: 'time-nw.nist.gov', value: 'time-nw.nist.gov' },
  { label: 'pool.ntp.org', value: 'pool.ntp.org' },
  { label: 'europe.pool.ntp.org', value: 'europe.pool.ntp.org' },
  { label: 'asia.pool.ntp.org', value: 'asia.pool.ntp.org' },
  { label: 'time.windows.com', value: 'time.windows.com' },
  { label: 'ntp.aliyun.com', value: 'ntp.aliyun.com' },
]

const timezoneOptions = [
  { label: '(GMT+08:00) 北京，重庆，香港', value: 'CST-8' },
  { label: '(GMT+00:00) 伦敦', value: 'GMT' },
  { label: '(GMT-05:00) 纽约', value: 'EST+5' },
  { label: '(GMT+09:00) 东京', value: 'JST-9' },
  { label: '(GMT+05:30) 孟买', value: 'IST-5:30' },
]

const simCardOptions = [
  { label: 'SIM1', value: '1' },
  { label: 'SIM2', value: '2' },
  { label: '自动', value: '0' },
]

const updateCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const weekday = weekdays[now.getDay()]
  currentTime.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${weekday}`
}

const loadFastBootSettings = async () => {
  try {
    const response = await getFastBootSettings()
    fastBootEnabled.value = response.data.mgmt_quicken_power_on || '0'
  } catch (error) {
    console.error('加载快速开机设置失败:', error)
  }
}

const loadSntpSettings = async () => {
  try {
    const response = await getSntpSettings()
    timeMode.value = response.data.sntp_time_set_mode || 'auto'
    sntpServer1.value = response.data.sntp_server0 || 'time-nw.nist.gov'
    sntpServer2.value = response.data.sntp_server1 || 'pool.ntp.org'
    sntpServer3.value = response.data.sntp_server2 || 'europe.pool.ntp.org'
    timezone.value = response.data.sntp_timezone || 'CST-8'
    timezoneIndex.value = response.data.sntp_timezone_index || '0'
    dstEnabled.value = response.data.sntp_dst_enable || '0'
  } catch (error) {
    console.error('加载SNTP设置失败:', error)
  }
}

const loadSimSelect = async () => {
  try {
    const response = await getSimSelect()
    simCard.value = response.data.alk_sim_select || '0'
  } catch (error) {
    console.error('加载SIM卡选择失败:', error)
  }
}

const restartDevice = async () => {
  if (isRebooting.value) return

  isRebooting.value = true

  await rebootDevice().catch(() => {})
  LMessage.info('设备重启中，请稍候...', { duration: 40 * 1000 })

  pollInterval = setInterval(async () => {
    try {
      await getBasicInfo()
      LMessage.success('设备重启成功')
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
      isRebooting.value = false
      location.reload()
    } catch (error) {}
  }, 3000)
}

const handleRestoreConfirm = async () => {
  isLoading.value = true

  try {
    const response = await apiRestoreFactory()
    if (response.data.result === 'success') {
      LMessage.success('正在恢复出厂设置...')
      setTimeout(() => {
        location.reload()
      }, 5000)
    } else {
      LMessage.error('恢复出厂设置失败')
    }
  } catch (error) {
    LMessage.error('恢复出厂设置失败')
  } finally {
    isLoading.value = false
  }
}

const handleShutdownConfirm = async () => {
  isLoading.value = true

  try {
    const response = await apiShutdownDevice()
    if (response.data.result === 'success') {
      LMessage.success('设备正在关机...')
    } else {
      LMessage.error('关机失败')
    }
  } catch (error) {
    LMessage.error('关机失败')
  } finally {
    isLoading.value = false
  }
}

const applyFastBoot = async () => {
  isLoading.value = true

  try {
    const response = await setFastBoot(fastBootEnabled.value)
    if (response.data.result === 'success') {
      LMessage.success('快速开机设置已应用')
    } else {
      LMessage.error('设置失败')
    }
  } catch (error) {
    LMessage.error('设置失败')
  } finally {
    isLoading.value = false
  }
}

const applySntp = async () => {
  isLoading.value = true

  try {
    const now = new Date()
    const params = {
      manualsettime: timeMode.value,
      sntp_server1_ip: sntpServer1.value,
      sntp_server2_ip: sntpServer2.value,
      sntp_server3_ip: sntpServer3.value,
      sntp_other_server0: '',
      sntp_other_server1: '',
      sntp_other_server2: '',
      timezone: timezone.value,
      sntp_timezone_index: timezoneIndex.value,
      DaylightEnabled: dstEnabled.value,
      time_year: String(now.getFullYear()),
      time_month: String(now.getMonth() + 1),
      time_day: String(now.getDate()),
      time_hour: String(now.getHours()),
      time_minute: String(now.getMinutes()),
    }

    const response = await setSntp(params)
    if (response.data.result === 'success') {
      LMessage.success('SNTP设置已应用')
    } else {
      LMessage.error('设置失败')
    }
  } catch (error) {
    LMessage.error('设置失败')
  } finally {
    isLoading.value = false
  }
}

const applySimCard = async () => {
  isLoading.value = true

  try {
    const response = await setSimSelect(simCard.value)
    if (response.data.result === 'success') {
      LMessage.success('SIM卡设置已应用')
    } else {
      LMessage.error('设置失败')
    }
  } catch (error) {
    LMessage.error('设置失败')
  } finally {
    isLoading.value = false
  }
}

const loadAllSettings = async () => {
  await Promise.all([loadFastBootSettings(), loadSntpSettings(), loadSimSelect()])
}

onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
  loadAllSettings()
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  if (pollInterval) {
    clearInterval(pollInterval)
  }
})
</script>

<style lang="scss" scoped>
.other-page {
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.module {
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid var(--border-color, #e5e7eb);

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
}

.module-title {
  font-size: 16px;
  font-weight: bolder;
  color: var(--text-primary, #1f2937);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 16px;
  }
}

.module-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  font-weight: 500;
}

.required {
  color: var(--danger-500, #ef4444);
  margin-left: 4px;
}

.tips-text {
  font-size: 13px;
  color: var(--text-secondary, #6b7280);
  margin: 0 0 12px 0;
}

.radio-group {
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 8px;
}
</style>

<template>
  <div class="power-page">
    <div class="module">
      <h2 class="module-title">Wi-Fi 功率设置</h2>
      <div class="module-content">
        <div class="radio-group">
          <LRadio v-model="wifiPower" label="short_mode" name="wifiPower">小功率</LRadio>
          <LRadio v-model="wifiPower" label="medium_mode" name="wifiPower">中功率</LRadio>
          <LRadio v-model="wifiPower" label="long_mode" name="wifiPower">大功率</LRadio>
        </div>
        <div class="action-bar">
          <LButton type="primary" @click="applyWifiPower">应用</LButton>
        </div>
      </div>
    </div>

    <div class="module">
      <h2 class="module-title">定时休眠唤醒设置</h2>
      <div class="module-content">
        <div class="radio-group">
          <LRadio v-model="sleepWake" label="enabled" name="sleepWake">启用</LRadio>
          <LRadio v-model="sleepWake" label="disabled" name="sleepWake">关闭</LRadio>
        </div>

        <div v-if="sleepWake === 'enabled'" class="time-settings">
          <div class="time-row">
            <span class="time-label">定时唤醒时间</span>
            <div class="time-picker">
              <input type="number" v-model="wakeHour" min="0" max="23" class="time-input" />
              <span class="time-separator">:</span>
              <input type="number" v-model="wakeMinute" min="0" max="59" class="time-input" />
            </div>
          </div>
          <div class="time-row">
            <span class="time-label">定时休眠时间</span>
            <div class="time-picker">
              <input type="number" v-model="sleepHour" min="0" max="23" class="time-input" />
              <span class="time-separator">:</span>
              <input type="number" v-model="sleepMinute" min="0" max="59" class="time-input" />
            </div>
          </div>
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applySleepWake">应用</LButton>
        </div>
      </div>
    </div>

    <div class="module">
      <h2 class="module-title">Wi-Fi 休眠设置</h2>
      <div class="module-content">
        <div class="select-wrapper">
          <LSelect v-model="wifiSleep" :options="sleepOptions" placeholder="请选择休眠时间" />
        </div>
        <div class="action-bar">
          <LButton type="primary" @click="applyWifiSleep">应用</LButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LRadio, LSelect, LButton, LMessage } from '@/components'
import { useProcStore } from '@/stores/proc'
import { setWifiSleep, setSleepTime, setWifiPower } from '@/api/basic.api'

const procStore = useProcStore()

const wifiPower = ref('short_mode')
const sleepWake = ref('disabled')
const wifiSleep = ref('-1')

const wakeHour = ref('06')
const wakeMinute = ref('00')
const sleepHour = ref('22')
const sleepMinute = ref('00')

const sleepOptions = [
  { value: '-1', label: '从不休眠' },
  { value: '5', label: '5分钟' },
  { value: '10', label: '10分钟' },
  { value: '20', label: '20分钟' },
  { value: '30', label: '30分钟' },
  { value: '60', label: '1小时' },
  { value: '120', label: '2小时' },
]

const initData = () => {
  const proc = procStore.proc

  if (proc.wifi_coverage) {
    wifiPower.value = proc.wifi_coverage
  }

  if (proc.openEnable && proc.closeEnable) {
    sleepWake.value = proc.openEnable === '1' && proc.closeEnable === '1' ? 'enabled' : 'disabled'
  }

  if (proc.Sleep_interval) {
    wifiSleep.value = proc.Sleep_interval
  }

  if (proc.openTime) {
    const [hour, minute] = proc.openTime.split(':')
    wakeHour.value = hour || '06'
    wakeMinute.value = minute || '00'
  }

  if (proc.closeTime) {
    const [hour, minute] = proc.closeTime.split(':')
    sleepHour.value = hour || '22'
    sleepMinute.value = minute || '00'
  }
}

const applyWifiPower = async () => {
  try {
    const res = await setWifiPower(wifiPower.value)
    if (res.data.result === 'success') {
      procStore.proc.wifi_coverage = wifiPower.value
      LMessage.success('Wi-Fi功率设置成功')
    } else {
      LMessage.error('Wi-Fi功率设置失败')
    }
  } catch (error) {
    LMessage.error('Wi-Fi功率设置失败')
  }
}

const applySleepWake = async () => {
  const openEnable = sleepWake.value === 'enabled' ? '1' : '0'
  const closeEnable = sleepWake.value === 'enabled' ? '1' : '0'
  const openTime = `${String(wakeHour.value).padStart(2, '0')}:${String(wakeMinute.value).padStart(2, '0')}`
  const closeTime = `${String(sleepHour.value).padStart(2, '0')}:${String(sleepMinute.value).padStart(2, '0')}`

  try {
    const res = await setSleepTime(openEnable, closeEnable, openTime, closeTime)
    if (res.data.result === 'success') {
      procStore.proc.openEnable = openEnable
      procStore.proc.closeEnable = closeEnable
      procStore.proc.openTime = openTime
      procStore.proc.closeTime = closeTime
      LMessage.success('定时休眠唤醒设置成功')
    } else {
      LMessage.error('定时休眠唤醒设置失败')
    }
  } catch (error) {
    LMessage.error('定时休眠唤醒设置失败')
  }
}

const applyWifiSleep = async () => {
  try {
    const res = await setWifiSleep(wifiSleep.value)
    if (res.data.result === 'success') {
      procStore.proc.Sleep_interval = wifiSleep.value
      LMessage.success('Wi-Fi休眠设置成功')
    } else {
      LMessage.error('Wi-Fi休眠设置失败')
    }
  } catch (error) {
    LMessage.error('Wi-Fi休眠设置失败')
  }
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.power-page {
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
  gap: 16px;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.select-wrapper {
  width: 200px;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
}

.time-settings {
  background: var(--bg-card-secondary, #f5f7fa);
  border-radius: var(--radius-md, 8px);
  padding: 16px;
  margin-top: 8px;
}

.time-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.time-label {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
}

.time-picker {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input {
  width: 60px;
  height: 36px;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-sm, 4px);
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: var(--primary-500, #0ea5e9);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
}

.time-separator {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
}
</style>

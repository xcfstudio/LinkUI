<template>
  <div class="wifi-advanced-page">
    <div class="module">
      <h2 class="module-title">高级设置</h2>
      <div class="form-item">
        <label class="form-label">频段选择</label>
        <span class="read-only-value">{{ wifiBandText }}</span>
      </div>
      <div class="form-item">
        <label class="form-label">网络模式</label>
        <span class="read-only-value">802.11 b/g/n/ax</span>
      </div>
      <div class="form-item">
        <label class="form-label">频带宽度</label>
        <LSelect v-model="bandwidth" :options="bandwidthOptions" />
      </div>
      <div class="form-item">
        <label class="form-label">国家/地区 码</label>
        <LSelect v-model="countryCode" :options="countryOptions" />
      </div>
      <div class="form-item">
        <label class="form-label">信道</label>
        <LSelect v-model="channel" :options="channelOptions" />
      </div>
      <div class="action-bar">
        <LButton type="primary" @click="applySettings" :loading="loading">应用</LButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { LSelect, LButton, LMessage } from '@/components'
import { getWifiInfo, setWifiInfo } from '@/api/basic.api'

const loading = ref(false)
const wifiBand = ref('b')
const bandwidth = ref('20MHz/40MHz')
const countryCode = ref('CN')
const channel = ref('0')

const wifiBandText = computed(() => {
  return wifiBand.value === 'b' ? '2.4G' : '5.8G'
})

const bandwidthOptions = [
  { value: '20MHz', label: '20MHz' },
  { value: '20MHz/40MHz', label: '20MHz/40MHz' },
]

const countryOptions = [
  { value: 'CN', label: '中国' },
  { value: 'US', label: '美国' },
  { value: 'JP', label: '日本' },
  { value: 'EU', label: '欧洲' },
]

const channelOptions = [
  { value: '0', label: '自动' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
]

const bandwidthMap: Record<string, string> = {
  '20MHz': '0',
  '20MHz/40MHz': '1',
  '40MHz': '1',
}

const bandwidthReverseMap: Record<string, string> = {
  '0': '20MHz',
  '1': '20MHz/40MHz',
}

const countryCodeMap: Record<string, string> = {
  CN: 'CN',
  US: 'US',
  JP: 'JP',
  EU: 'EU',
}

const loadWifiInfo = async () => {
  try {
    const response = await getWifiInfo()

    if (!response) {
      console.error('响应为空')
      LMessage.error('加载WiFi信息失败：响应为空')
      return
    }

    let data: any = null

    if ('data' in response && response.data) {
      data = response.data
    } else if (response && typeof response === 'object' && !('status' in response)) {
      data = response
    }

    if (!data || typeof data !== 'object') {
      console.error('数据为空或格式不正确')
      LMessage.warning('WiFi信息加载异常，使用默认值')
      return
    }

    if (data.wifi_band) {
      wifiBand.value = data.wifi_band
    }

    if (data.wifi_11n_cap) {
      bandwidth.value = bandwidthReverseMap[data.wifi_11n_cap] || '20MHz/40MHz'
    }

    if (data.CountryCode) {
      countryCode.value = data.CountryCode
    }

    if (data.Channel) {
      channel.value = data.Channel
    }
  } catch (error) {
    console.error('=== 加载WiFi信息失败 ===')
    console.error('错误类型:', error instanceof Error ? error.name : typeof error)
    console.error('错误信息:', error instanceof Error ? error.message : error)
    LMessage.error('加载WiFi信息失败')
  }
}

const applySettings = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const params = {
      wifiMode: '6',
      countryCode: countryCode.value,
      MAX_Access_num: '8',
      m_MAX_Access_num: '24',
      wifi_band: wifiBand.value,
      selectedChannel: channel.value,
      abg_rate: '0',
      wifi_11n_cap: bandwidthMap[bandwidth.value] || '1',
    }

    const response = await setWifiInfo(params)

    const resultData = response.data || response

    if (resultData && (resultData.result === 'success' || resultData.result === '0')) {
      LMessage.success('高级设置已应用')
    } else {
      LMessage.error('设置失败，请重试')
    }
  } catch (error) {
    LMessage.error('设置失败，请重试')
    console.error('Failed to apply advanced settings:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWifiInfo()
})
</script>

<style lang="scss" scoped>
.wifi-advanced-page {
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
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  &:last-of-type {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.form-label {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
}

.read-only-value {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 16px;
}
</style>

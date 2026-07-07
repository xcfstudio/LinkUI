<template>
  <div class="wps-page">
    <div class="module">
      <h2 class="module-title">WPS</h2>
      <div class="form-item">
        <label class="form-label">SSID</label>
        <LSelect v-model="selectedSsid" :options="ssidOptions" />
      </div>
      <div class="form-item">
        <label class="form-label">WPS <span class="required">*</span></label>
        <div class="radio-options-block">
          <LRadio v-model="wpsMode" label="PIN" name="wpsMode">PIN</LRadio>
          <LInput
            v-if="wpsMode === 'PIN'"
            v-model="pinCode"
            placeholder="请输入PIN码"
            class="pin-input"
          />
        </div>
        <div class="radio-options-block">
          <LRadio v-model="wpsMode" label="PBC" name="wpsMode">PBC</LRadio>
        </div>
      </div>
      <div class="action-bar">
        <LButton type="primary" @click="applyWpsSettings" :loading="loading">应用</LButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LRadio, LSelect, LInput, LButton, LMessage } from '@/components'
import { getWifiInfo, setWps } from '@/api/basic.api'

const selectedSsid = ref('')
const wpsMode = ref('PIN')
const pinCode = ref('')
const loading = ref(false)
const ssidOptions = ref<{ value: string; label: string }[]>([])

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

    const options: { value: string; label: string }[] = []

    if (data.SSID1) {
      options.push({ value: data.SSID1, label: data.SSID1 })
    }

    if (data.m_SSID && data.m_ssid_enable === '1') {
      options.push({ value: data.m_SSID, label: data.m_SSID })
    }

    if (options.length === 0) {
      options.push({ value: 'XCF_MZ804_1', label: 'XCF_MZ804_1' })
    }

    ssidOptions.value = options
    selectedSsid.value = options[0]?.value || ''
  } catch (error) {
    console.error('=== 加载WiFi信息失败 ===')
    console.error('错误类型:', error instanceof Error ? error.name : typeof error)
    console.error('错误信息:', error instanceof Error ? error.message : error)
    LMessage.error('加载WiFi信息失败')

    ssidOptions.value = [{ value: 'XCF_MZ804_1', label: 'XCF_MZ804_1' }]
    selectedSsid.value = 'XCF_MZ804_1'
  }
}

const applyWpsSettings = async () => {
  if (loading.value) return

  if (!selectedSsid.value) {
    LMessage.warning('请选择SSID')
    return
  }

  if (wpsMode.value === 'PIN') {
    if (!pinCode.value) {
      LMessage.warning('请输入PIN码')
      return
    }
    if (pinCode.value.length !== 8) {
      LMessage.warning('PIN码必须为8位')
      return
    }
    if (!/^\d{8}$/.test(pinCode.value)) {
      LMessage.warning('PIN码必须为8位数字')
      return
    }
  }

  loading.value = true
  try {
    const params = {
      WPS_SSID: selectedSsid.value,
      wps_mode: wpsMode.value,
      wifi_wps_index: '1',
      wps_pin: wpsMode.value === 'PIN' ? pinCode.value : undefined,
    }
    const response = await setWps(params)

    const resultData = response.data || response

    if (resultData && (resultData.result === 'success' || resultData.result === '0')) {
      LMessage.success('WPS设置已应用')
    } else {
      LMessage.error('设置失败，请重试')
    }
  } catch (error) {
    LMessage.error('设置失败，请重试')
    console.error('Failed to apply WPS settings:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWifiInfo()
})
</script>

<style lang="scss" scoped>
.wps-page {
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
  margin-bottom: 20px;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  margin-bottom: 8px;

  .required {
    color: var(--danger, #ef4444);
  }
}

.radio-options-block {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.pin-input {
  width: 200px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 16px;
}
</style>
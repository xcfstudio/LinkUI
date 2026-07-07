<template>
  <div class="main-ssid-page">
    <div class="module">
      <div class="radio-group">
        <div class="radio-item">
          <span class="radio-label">Wi-Fi开关</span>
          <div class="radio-options">
            <LRadio v-model="wifiEnabled" label="enabled" name="wifiEnabled">启用</LRadio>
            <LRadio v-model="wifiEnabled" label="disabled" name="wifiEnabled">关闭</LRadio>
          </div>
        </div>
        <div class="radio-item" v-if="wifiEnabled === 'enabled'">
          <span class="radio-label">多重网络名称开关</span>
          <div class="radio-options">
            <LRadio v-model="multiSsidEnabled" label="enabled" name="multiSsidEnabled">启用</LRadio>
            <LRadio v-model="multiSsidEnabled" label="disabled" name="multiSsidEnabled"
              >关闭</LRadio
            >
          </div>
        </div>
      </div>
      <div class="action-bar">
        <LButton type="primary" @click="applyBasicSettings" :loading="basicLoading">应用</LButton>
      </div>
    </div>

    <div class="module">
      <h2 class="module-title">SSID</h2>
      <div class="form-item">
        <label class="form-label">网络名称(SSID) <span class="required">*</span></label>
        <LInput v-model="ssid" placeholder="请输入网络名称" />
      </div>
      <div class="form-item">
        <label class="form-label">安全模式</label>
        <LSelect v-model="securityMode" :options="securityOptions" />
      </div>
      <div class="form-item">
        <label class="form-label">密码 <span class="required">*</span></label>
        <div class="password-input-wrapper">
          <LInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入密码"
          />
          <label class="checkbox-label">
            <input type="checkbox" v-model="showPassword" />
            <span class="checkbox-text">显示密码</span>
          </label>
        </div>
        <div class="password-tip" v-if="securityMode !== 'OPEN'">
          提示：密码长度需为8-63个ASCII字符
        </div>
      </div>
      <div class="form-item">
        <label class="form-label">最大接入数</label>
        <LSelect v-model="maxClients" :options="maxClientsOptions" />
      </div>
      <div class="action-bar">
        <LButton type="primary" @click="applySsidSettings" :loading="ssidLoading">应用</LButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LRadio, LSelect, LInput, LButton, LMessage } from '@/components'
import { getWifiInfo, setWifiInfo, setMainSsid } from '@/api/basic.api'

const wifiEnabled = ref('enabled')
const multiSsidEnabled = ref('disabled')
const ssid = ref('')
const securityMode = ref('WPA2(AES)-PSK')
const password = ref('')
const showPassword = ref(false)
const maxClients = ref('32')
const basicLoading = ref(false)
const ssidLoading = ref(false)

const securityOptions = [
  { value: 'WPA2(AES)-PSK', label: 'WPA2(AES)-PSK' },
  { value: 'WPA/WPA2(AES)-PSK', label: 'WPA/WPA2(AES)-PSK' },
  { value: 'OPEN', label: 'OPEN' },
]

const maxClientsOptions = [
  { value: '8', label: '8' },
  { value: '16', label: '16' },
  { value: '32', label: '32' },
  { value: '64', label: '64' },
]

const securityModeMap: Record<string, string> = {
  'WPA2(AES)-PSK': 'WPA2PSK',
  'WPA/WPA2(AES)-PSK': 'WPA/WPA2PSK',
  OPEN: 'OPEN',
}

const authModeMap: Record<string, string> = {
  WPA2PSK: 'WPA2(AES)-PSK',
  'WPA/WPA2PSK': 'WPA/WPA2(AES)-PSK',
  OPEN: 'OPEN',
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
    wifiEnabled.value = data.wifi_cur_state === '1' ? 'enabled' : 'disabled'
    multiSsidEnabled.value = data.m_ssid_enable === '1' ? 'enabled' : 'disabled'
    ssid.value = data.SSID1 || 'XCF_MZ804_1'
    securityMode.value = authModeMap[data.AuthMode] || 'WPA2(AES)-PSK'
    maxClients.value = data.MAX_Access_num || '32'

    if (data.WPAPSK1_encode && data.WPAPSK1_encode !== 'MTIzNDU2Nzg5MA==') {
      try {
        password.value = atob(data.WPAPSK1_encode)
      } catch (decodeError) {
        console.warn('密码解码失败:', decodeError)
        password.value = '********'
      }
    } else {
      password.value = ''
    }
  } catch (error) {
    console.error('=== 加载WiFi信息失败 ===')
    console.error('错误类型:', error instanceof Error ? error.name : typeof error)
    console.error('错误信息:', error instanceof Error ? error.message : error)
    console.error('完整错误:', error)
    LMessage.error('加载WiFi信息失败')
  }
}

const applyBasicSettings = async () => {
  if (basicLoading.value) return

  basicLoading.value = true
  try {
    const wifiEnabledVal = wifiEnabled.value === 'enabled' ? '1' : '0'
    const mSsidEnabledVal = multiSsidEnabled.value === 'enabled' ? '1' : '0'

    const response = await setWifiInfo({
      wifiEnabled: wifiEnabledVal,
      m_ssid_enable: mSsidEnabledVal,
    })

    const resultData = response.data || response
    if (resultData && (resultData.result === 'success' || resultData.result === '0')) {
      LMessage.success('Wi-Fi基础设置已应用')
    } else {
      LMessage.error('设置失败，请重试')
    }
  } catch (error) {
    LMessage.error('设置失败，请重试')
    console.error('Failed to apply basic settings:', error)
  } finally {
    basicLoading.value = false
  }
}

const applySsidSettings = async () => {
  if (ssidLoading.value) return

  if (!ssid.value.trim()) {
    LMessage.warning('请输入网络名称')
    return
  }

  if (
    securityMode.value !== 'OPEN' &&
    password.value &&
    (password.value.length < 8 || password.value.length > 63)
  ) {
    LMessage.warning('密码长度需为8-63个ASCII字符')
    return
  }

  ssidLoading.value = true
  try {
    const encodedPassword =
      securityMode.value === 'OPEN' ? '' : password.value ? btoa(password.value) : ''

    const params = {
      ssid: ssid.value.trim(),
      MAX_Access_num: maxClients.value,
      security_mode: securityModeMap[securityMode.value] || 'WPA2PSK',
      cipher: '1',
      NoForwarding: '0',
      NoShow_qrcode_flag: '1',
      show_qrcode_flag: '0',
      security_shared_mode: '1',
      passsphrase: encodedPassword,
    }
    const response = await setMainSsid(params)
    const resultData = response.data || response
    if (resultData && (resultData.result === 'success' || resultData.result === '0')) {
      LMessage.success('SSID设置已应用')
    } else {
      LMessage.error('设置失败，请重试')
    }
  } catch (error) {
    LMessage.error('设置失败，请重试')
    console.error('Failed to apply SSID settings:', error)
  } finally {
    ssidLoading.value = false
  }
}

watch(wifiEnabled, (newVal) => {
  if (newVal === 'disabled') {
    showPassword.value = false
  }
})

onMounted(() => {
  loadWifiInfo()
})
</script>

<style lang="scss" scoped>
.main-ssid-page {
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

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.radio-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

.radio-label {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
}

.radio-options {
  display: flex;
  gap: 24px;
}

.form-item {
  margin-bottom: 16px;

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

.password-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.password-tip {
  font-size: 12px;
  color: var(--text-secondary, #6b7280);
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.checkbox-text {
  font-size: 14px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 16px;
}
</style>
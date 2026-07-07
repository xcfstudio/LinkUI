<template>
  <div class="dmz-page">
    <div class="module">
      <h2 class="module-title">DMZ设置</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">DMZ设置</label>
          <div class="radio-group">
            <LRadio v-model="dmzEnabled" label="1" name="dmzEnabled">启用</LRadio>
            <LRadio v-model="dmzEnabled" label="0" name="dmzEnabled">关闭</LRadio>
          </div>
        </div>

        <div v-if="dmzEnabled === '1'" class="form-item">
          <label class="form-label">
            IP 地址
            <span class="required">*</span>
          </label>
          <LInput v-model="dmzIp" placeholder="请输入DMZ主机IP地址" />
        </div>

        <div class="action-bar">
          <LButton type="primary" :loading="loading" @click="applyDmz">应用</LButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LRadio, LButton, LInput, LMessage } from '@/components'
import { getDmzSettings, setDmzSettings } from '@/api/basic.api'

const dmzEnabled = ref('0')
const dmzIp = ref('')
const loading = ref(false)

const fetchDmzSettings = async () => {
  try {
    const response = await getDmzSettings()
    dmzEnabled.value = response.data.DMZEnable || '0'
    dmzIp.value = response.data.DMZIPAddress || ''
  } catch (error) {
    LMessage.error('获取DMZ设置失败')
  }
}

const validateIp = (ip: string): boolean => {
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  return ipRegex.test(ip)
}

const applyDmz = async () => {
  if (dmzEnabled.value === '1') {
    if (!dmzIp.value.trim()) {
      LMessage.error('请输入DMZ主机IP地址')
      return
    }
    if (!validateIp(dmzIp.value)) {
      LMessage.error('请输入有效的IP地址')
      return
    }
  }

  loading.value = true
  try {
    const params: { DMZEnabled: string; DMZIPAddress?: string } = {
      DMZEnabled: dmzEnabled.value,
    }
    if (dmzEnabled.value === '1') {
      params.DMZIPAddress = dmzIp.value
    }
    const response = await setDmzSettings(params)
    if (response.data.result === 'success') {
      LMessage.success('DMZ设置已应用')
    } else {
      LMessage.error('DMZ设置失败')
    }
  } catch (error) {
    LMessage.error('DMZ设置失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDmzSettings()
})
</script>

<style lang="scss" scoped>
.dmz-page {
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
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 8px;
}
</style>
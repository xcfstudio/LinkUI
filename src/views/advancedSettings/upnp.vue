<template>
  <div class="upnp-page">
    <div class="module">
      <h2 class="module-title">UPnP设置</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">UPnP设置</label>
          <div class="radio-group">
            <LRadio v-model="upnpEnabled" label="1" name="upnpEnabled">启用</LRadio>
            <LRadio v-model="upnpEnabled" label="0" name="upnpEnabled">关闭</LRadio>
          </div>
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applyUpnp">应用</LButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LRadio, LButton, LMessage } from '@/components'
import { postProc } from '@/api/basic.api'
import request from '@/utils/request'

const upnpEnabled = ref('0')
const isLoading = ref(false)

const loadUpnpStatus = async () => {
  isLoading.value = true
  try {
    const res = await request.get('/reqproc/proc_get', {
      headers: {
        Pragma: 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
      },
      queryParams: {
        cmd: 'upnpEnabled',
        multi_data: '1',
        _: Date.now().toString(),
      },
    })

    upnpEnabled.value = res.data.upnpEnabled || '0'
  } catch (error) {
    console.error('加载UPnP状态失败:', error)
    LMessage.error('加载UPnP状态失败')
  } finally {
    isLoading.value = false
  }
}

const applyUpnp = async () => {
  isLoading.value = true
  try {
    const params: Record<string, string> = {
      upnp_setting_option: upnpEnabled.value,
    }

    const res = await postProc('UPNP_SETTING', params)

    if (res.data.result === 'success') {
      LMessage.success('UPnP设置已应用')
    } else {
      LMessage.error('设置失败')
    }
  } catch (error) {
    console.error('应用UPnP设置失败:', error)
    LMessage.error('应用UPnP设置失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUpnpStatus()
})
</script>

<style lang="scss" scoped>
.upnp-page {
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

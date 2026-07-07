<template>
  <div class="connect-mode-page">
    <div class="module">
      <h2 class="module-title">连接模式</h2>
      <div class="form-item">
        <label class="form-label">连接模式</label>
        <div class="radio-options">
          <LRadio v-model="connectMode" label="auto" name="connectMode">自动</LRadio>
          <LRadio v-model="connectMode" label="manual" name="connectMode">手动</LRadio>
        </div>
      </div>
      <div v-if="connectMode === 'auto'" class="form-item checkbox-item">
        <label class="checkbox-label">
          <input type="checkbox" v-model="roamingEnabled" />
          <span class="checkbox-text"
            >勾选此项，您可以在漫游状态下连接到网络，且可能会产生额外费用。</span
          >
        </label>
      </div>
      <div class="action-bar">
        <LButton type="primary" @click="applySettings">应用</LButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LRadio, LButton, LMessage } from '@/components'
import { getConnectionMode, setConnectionMode } from '@/api/basic.api'

const connectMode = ref('auto')
const roamingEnabled = ref(true)

const initData = async () => {
  try {
    const res = await getConnectionMode()
    if (res.data.connectionMode) {
      connectMode.value = res.data.connectionMode === 'auto_dial' ? 'auto' : 'manual'
    }
    if (res.data.autoConnectWhenRoaming) {
      roamingEnabled.value = res.data.autoConnectWhenRoaming === 'on'
    }
  } catch (error) {
    LMessage.error('获取连接模式失败')
  }
}

const applySettings = async () => {
  try {
    const params = {
      ConnectionMode: connectMode.value === 'auto' ? 'auto_dial' : 'manual_dial',
      roam_setting_option: roamingEnabled.value ? 'on' : 'off',
    }
    const res = await setConnectionMode(params)
    if (res.data.result === 'success') {
      LMessage.success('连接模式设置成功')
    } else {
      LMessage.error('连接模式设置失败')
    }
  } catch (error) {
    LMessage.error('连接模式设置失败')
  }
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.connect-mode-page {
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
  margin-bottom: 16px;

  &.checkbox-item {
    margin-top: 8px;
  }

  &:last-of-type {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  margin-bottom: 8px;
  display: block;
}

.radio-options {
  display: flex;
  gap: 40px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
  line-height: 1.5;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 16px;
}
</style>

<template>
  <div class="baseband-page">
    <div class="module">
      <h2 class="module-title">基带设置</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">修改IMEI</label>
          <div class="imei-input-wrapper">
            <LInput v-model="imei" placeholder="请输入IMEI号码" />
            <LButton type="primary" @click="applyImei" :loading="loading">应用</LButton>
          </div>
        </div>
      </div>
    </div>

    <div class="warning-section">
      <div class="warning-icon">⚠️</div>
      <div class="warning-content">
        <h3 class="warning-title">⚠️ 重要警告</h3>
        <p class="warning-text">
          修改IMEI可能涉及<span class="highlight">法律风险</span>，请谨慎操作！
        </p>
        <p class="warning-text">
          如果您现在使用的是<span class="highlight">物联网卡</span>且没有解绑权限，
          <span class="highlight">请勿修改IMEI</span>，否则将导致您的卡停机！
        </p>
        <p class="warning-text">
          修改IMEI可能违反运营商规定及相关法律法规，由此产生的一切后果由用户自行承担。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LInput, LButton, LMessage } from '@/components'
import { getImeiInfo, setImei } from '@/api/basic.api'

const imei = ref('')
const loading = ref(false)

const fetchImei = async () => {
  try {
    const response = await getImeiInfo()
    const data = response.data || response
    if (data && data.imei) {
      imei.value = data.imei
    }
  } catch (error) {
    console.error('获取IMEI信息失败:', error)
  }
}

const applyImei = async () => {
  if (!imei.value.trim()) {
    LMessage.error('请输入IMEI号码')
    return
  }

  if (!/^\d{15}$/.test(imei.value)) {
    LMessage.error('请输入有效的15位IMEI号码')
    return
  }

  loading.value = true

  try {
    const response = await setImei(imei.value)
    const data = response.data || response
    if (data && data.result === 'success') {
      LMessage.success('IMEI修改成功，重启后生效')
    } else {
      LMessage.error('IMEI修改失败')
    }
  } catch (error) {
    console.error('修改IMEI失败:', error)
    LMessage.error('IMEI修改失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchImei()
})
</script>

<style lang="scss" scoped>
.baseband-page {
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

.imei-input-wrapper {
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  :deep(.l-input) {
    flex: 1;
  }
}

.warning-section {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 2px solid var(--danger-400, #f87171);
  border-radius: var(--radius-lg, 12px);
  padding: 20px;
  display: flex;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 16px;
  }
}

.warning-icon {
  font-size: 48px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 36px;
  }
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--danger-600, #dc2626);
  margin: 0 0 12px 0;
}

.warning-text {
  font-size: 13px;
  color: var(--danger-700, #b91c1c);
  line-height: 1.8;
  margin: 0 0 8px 0;

  &:last-child {
    margin-bottom: 0;
  }

  .highlight {
    color: var(--danger-600, #dc2626);
    font-weight: 600;
  }
}
</style>

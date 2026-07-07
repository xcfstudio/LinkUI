<template>
  <div class="mac-filter-page">
    <div class="module">
      <h2 class="module-title">无线MAC过滤</h2>
      <div class="form-item">
        <label class="form-label">MAC过滤开关</label>
        <div class="radio-options">
          <LRadio v-model="filterEnabled" label="enabled" name="filterEnabled">启用</LRadio>
          <LRadio v-model="filterEnabled" label="disabled" name="filterEnabled">关闭</LRadio>
        </div>
      </div>
      <div class="form-item">
        <label class="form-label">过滤模式</label>
        <div class="radio-options">
          <LRadio v-model="filterMode" label="allow" name="filterMode">允许列表</LRadio>
          <LRadio v-model="filterMode" label="deny" name="filterMode">拒绝列表</LRadio>
        </div>
      </div>
      <div class="action-bar">
        <LButton type="primary" @click="applySettings" :loading="loading">应用</LButton>
      </div>
    </div>

    <div class="module">
      <div class="table-header">
        <h3 class="table-title">MAC地址列表</h3>
        <LButton type="primary" @click="showAddDialog = true">添加</LButton>
      </div>
      <LTable :columns="columns" :data="macList" />
    </div>

    <LDialog :visible="showAddDialog" title="添加MAC地址" @close="showAddDialog = false">
      <div class="dialog-content">
        <div class="form-item">
          <label class="form-label">MAC地址 <span class="required">*</span></label>
          <LInput v-model="newMac" placeholder="请输入MAC地址，如: AA:BB:CC:DD:EE:FF" />
        </div>
      </div>
      <template #footer>
        <LButton type="default" @click="showAddDialog = false">取消</LButton>
        <LButton type="primary" @click="addMac">确定</LButton>
      </template>
    </LDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, h } from 'vue'
import { LRadio, LButton, LDialog, LInput, LMessage, LTable } from '@/components'
import { getWifiInfo, setMacFilter } from '@/api/basic.api'

const loading = ref(false)
const filterEnabled = ref('disabled')
const filterMode = ref('allow')
const showAddDialog = ref(false)
const newMac = ref('')

const columns = [
  { prop: 'mac', label: 'MAC地址' },
  {
    prop: 'action',
    label: '操作',
    width: '100px',
    render: (row: Record<string, unknown>) => {
      return h(
        'button',
        {
          class: 'table-btn delete-btn',
          onClick: () => handleDelete({ mac: row.mac as string }),
        },
        '删除',
      )
    },
  },
]

const macList = ref<{ mac: string }[]>([])

const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

const loadMacFilterInfo = async () => {
  try {
    const response = await getWifiInfo()
    if (!response) {
      console.error('响应为空')
      LMessage.error('加载MAC过滤信息失败：响应为空')
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
      LMessage.warning('MAC过滤信息加载异常，使用默认值')
      return
    }

    if (data.ACL_mode) {
      filterEnabled.value = data.ACL_mode === '0' ? 'disabled' : 'enabled'
      filterMode.value = data.ACL_mode === '2' ? 'deny' : 'allow'
    }

    let macData = ''
    if (data.ACL_mode === '1' && data.wifi_mac_white_list) {
      macData = data.wifi_mac_white_list
    } else if (data.ACL_mode === '2' && data.wifi_mac_black_list) {
      macData = data.wifi_mac_black_list
    }

    if (macData) {
      const macs = macData.split(';').filter((m: string) => m.trim())
      macList.value = macs.map((mac: string) => ({ mac: mac.trim() }))
    } else {
      macList.value = []
    }
  } catch (error) {
    console.error('=== 加载MAC过滤信息失败 ===')
    console.error('错误类型:', error instanceof Error ? error.name : typeof error)
    console.error('错误信息:', error instanceof Error ? error.message : error)
    LMessage.error('加载MAC过滤信息失败')
  }
}

const applySettings = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const ACL_mode =
      filterEnabled.value === 'disabled' ? '0' : filterMode.value === 'allow' ? '1' : '2'

    let macListStr = ''
    if (ACL_mode !== '0' && macList.value.length > 0) {
      macListStr = macList.value.map((item) => item.mac).join(';')
    }

    const params: { ACL_mode: string; wifi_mac_white_list?: string; wifi_mac_black_list?: string } = {
      ACL_mode,
    }

    if (ACL_mode === '1') {
      params.wifi_mac_white_list = macListStr
    } else if (ACL_mode === '2') {
      params.wifi_mac_black_list = macListStr
    }

    const response = await setMacFilter(params)

    const resultData = response.data || response

    if (resultData && (resultData.result === 'success' || resultData.result === '0')) {
      LMessage.success('MAC过滤设置已应用')
    } else {
      LMessage.error('设置失败，请重试')
    }
  } catch (error) {
    LMessage.error('设置失败，请重试')
    console.error('Failed to apply MAC filter settings:', error)
  } finally {
    loading.value = false
  }
}

const addMac = () => {
  if (!newMac.value) {
    LMessage.warning('请输入MAC地址')
    return
  }

  if (!macPattern.test(newMac.value)) {
    LMessage.warning('请输入正确的MAC地址格式，如: AA:BB:CC:DD:EE:FF')
    return
  }

  const existingMac = macList.value.find(
    (item) => item.mac.toLowerCase() === newMac.value.toLowerCase(),
  )
  if (existingMac) {
    LMessage.warning('该MAC地址已存在')
    return
  }

  macList.value.push({ mac: newMac.value.toUpperCase() })

  newMac.value = ''
  showAddDialog.value = false
  LMessage.success('MAC地址添加成功')
}

const handleDelete = (row: { mac: string }) => {
  const index = macList.value.findIndex((item) => item.mac === row.mac)
  if (index > -1) {
    macList.value.splice(index, 1)
    LMessage.success('删除成功')
  }
}

watch(filterEnabled, (newVal) => {
  if (newVal === 'disabled') {
    macList.value = []
  }
})

onMounted(() => {
  loadMacFilterInfo()
})
</script>

<style lang="scss" scoped>
.mac-filter-page {
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

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
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

  .required {
    color: var(--danger, #ef4444);
  }
}

.radio-options {
  display: flex;
  gap: 24px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 16px;
}

:deep(.table-btn) {
  padding: 5px 14px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border: none !important;
  border-radius: var(--radius-md, 6px) !important;
  cursor: pointer !important;
  transition: all 0.25s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1.4 !important;
  background: transparent !important;
}

:deep(.table-btn.delete-btn) {
  background: linear-gradient(
    135deg,
    var(--danger-50, #fef2f2) 0%,
    var(--danger-100, #fee2e2) 100%
  ) !important;
  color: var(--danger, #ef4444) !important;
  border: 1px solid var(--danger-200, #fecaca) !important;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.08) !important;
}

:deep(.table-btn.delete-btn:hover) {
  background: linear-gradient(
    135deg,
    var(--danger-100, #fee2e2) 0%,
    var(--danger-200, #fecaca) 100%
  ) !important;
  border-color: var(--danger-300, #fca5a5) !important;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.12) !important;
  transform: translateY(-0.5px) !important;
}

:deep(.table-btn.delete-btn:active) {
  transform: translateY(0) !important;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.08) !important;
}

.dialog-content {
  padding: 16px 0;
}

.dialog-content .form-item {
  flex-direction: column;
  align-items: flex-start;
}
</style>
<template>
  <div class="network-search-page">
    <div class="module">
      <h2 class="module-title">找网方式</h2>
      <div class="form-item">
        <label class="form-label">找网方式</label>
        <div class="radio-options">
          <LRadio v-model="searchMode" label="auto" name="searchMode">自动</LRadio>
          <LSelect
            v-if="searchMode === 'auto'"
            v-model="autoOption"
            :options="autoOptions"
            class="auto-select"
          />
        </div>
        <div class="radio-options">
          <LRadio v-model="searchMode" label="manual" name="searchMode">手动</LRadio>
        </div>
      </div>
      <div class="action-bar">
        <LButton type="primary" v-if="searchMode === 'auto'" @click="applySettings">应用</LButton>
        <LButton
          type="primary"
          v-if="searchMode === 'manual'"
          :loading="isScanning"
          @click="searchNetwork"
          >搜索</LButton
        >
      </div>
    </div>

    <div class="module" v-if="searchMode === 'manual'">
      <h2 class="module-title">网络列表</h2>
      <LTable :columns="columns" :data="networkList" />
      <div class="action-bar">
        <LButton type="primary" :disabled="!selectedNetwork" @click="registerNetwork">注册</LButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { h } from 'vue'
import { LRadio, LSelect, LButton, LTable, LMessage } from '@/components'
import {
  getNetworkSearch,
  setNetworkSearch,
  scanNetwork,
  getScanStatus,
  getNetworkList,
  setNetwork,
} from '@/api/basic.api'

const searchMode = ref('auto')
const autoOption = ref('NETWORK_auto')
const selectedNetwork = ref('')
const networkList = ref<any[]>([])
const isScanning = ref(false)

const autoOptions = [
  { value: 'NETWORK_auto', label: '自动' },
  { value: 'Only_LTE', label: '仅4G' },
  { value: 'Only_WCDMA', label: '仅3G' },
]

const columns = [
  {
    prop: 'options',
    label: '选项',
    width: '60px',
    render: (row: any) => {
      return h('input', {
        type: 'radio',
        value: `${row.mccmnc},${row.rat},${row.subrat}`,
        checked: selectedNetwork.value === `${row.mccmnc},${row.rat},${row.subrat}`,
        onchange: (e: Event) => {
          selectedNetwork.value = (e.target as HTMLInputElement).value
        },
      })
    },
  },
  { prop: 'status', label: '网络状态', width: '100px' },
  { prop: 'operator', label: '运营商' },
  { prop: 'mccmnc', label: 'MCCMNC', width: '100px' },
  { prop: 'type', label: '网络类型', width: '100px' },
  { prop: 'standard', label: '制式', width: '100px' },
]

const initData = async () => {
  try {
    const res = await getNetworkSearch()
    if (res.data.net_select_mode) {
      searchMode.value = res.data.net_select_mode === 'auto_select' ? 'auto' : 'manual'
    }
    if (res.data.net_select) {
      autoOption.value = res.data.net_select
    }
  } catch (error) {
    LMessage.error('获取找网方式失败')
  }
}

const applySettings = async () => {
  try {
    const res = await setNetworkSearch(autoOption.value)
    if (res.data.result === 'success') {
      LMessage.success('找网方式设置成功')
    } else {
      LMessage.error('找网方式设置失败')
    }
  } catch (error) {
    LMessage.error('找网方式设置失败')
  }
}

const searchNetwork = async () => {
  isScanning.value = true
  try {
    await scanNetwork()
    await pollScanStatus()
  } catch (error) {
    LMessage.error('搜索网络失败')
  } finally {
    isScanning.value = false
  }
}

const pollScanStatus = async () => {
  return new Promise<void>((resolve) => {
    const interval = setInterval(async () => {
      try {
        const res = await getScanStatus()
        if (res.data.m_netselect_status === 'manual_selected') {
          clearInterval(interval)
          await loadNetworkList()
          resolve()
        }
      } catch (error) {
        clearInterval(interval)
        resolve()
      }
    }, 1000)
  })
}

const loadNetworkList = async () => {
  try {
    const res = await getNetworkList()
    networkList.value = parseNetworkList(res.data.m_netselect_contents)
    selectedNetwork.value = ''
  } catch (error) {
    LMessage.error('获取网络列表失败')
  }
}

const parseNetworkList = (content: string): any[] => {
  if (!content) return []
  return content
    .split(';')
    .map((item) => {
      const parts = item.split(',')
      const rat = parts[3] || '7'
      const subrat = parts[4] || '0'
      return {
        status: '未知',
        operator: parts[1] || '',
        mccmnc: parts[2] || '',
        rat,
        subrat,
        type: rat === '7' ? '4G' : '3G',
        standard: subrat === '0' ? 'TD-LTE' : 'FDD-LTE',
      }
    })
    .filter((item) => item.mccmnc)
}

const registerNetwork = async () => {
  if (!selectedNetwork.value) {
    LMessage.warning('请选择一个网络')
    return
  }
  try {
    const [NetworkNumber, Rat, nSubrat] = selectedNetwork.value.split(',')
    if (!NetworkNumber || !Rat || nSubrat === undefined) {
      LMessage.warning('网络信息不完整')
      return
    }
    const res = await setNetwork({ NetworkNumber, Rat, nSubrat })
    if (res.data.result === 'success') {
      LMessage.success('网络注册成功')
    } else {
      LMessage.error('网络注册失败')
    }
  } catch (error) {
    LMessage.error('网络注册失败')
  }
}

watch(searchMode, (newVal) => {
  if (newVal === 'auto' && !autoOption.value) {
    autoOption.value = 'NETWORK_auto'
  }
  if (newVal === 'manual') {
    selectedNetwork.value = ''
    networkList.value = []
  }
})

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.network-search-page {
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
  align-items: center;
  gap: 40px;
  margin-bottom: 12px;
}

.auto-select {
  width: 150px;
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 16px;
}
</style>
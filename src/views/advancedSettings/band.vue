<template>
  <div class="band-page">
    <div class="module">
      <h2 class="module-title">频段设置</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">小区ID</label>
          <LInput v-model="cellId" disabled />
        </div>

        <div class="form-item">
          <label class="form-label">驻网频段</label>
          <LInput v-model="currentBandText" disabled />
        </div>

        <div class="form-item">
          <label class="form-label">设置频段</label>
          <LSelect v-model="bandSetting" :options="bandOptions" />
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applyBand">应用</LButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { LInput, LSelect, LButton, LMessage } from '@/components'
import { postProc } from '@/api/basic.api'
import request from '@/utils/request'

const cellId = ref('0')
const currentBand = ref('')
const bandSetting = ref('auto')

const bandOptions = [
  { label: '自动', value: 'auto' },
  { label: 'FDD-LTE Band 1', value: '1' },
  { label: 'FDD-LTE Band 3', value: '3' },
  { label: 'FDD-LTE Band 5', value: '5' },
  { label: 'FDD-LTE Band 8', value: '8' },
  { label: 'TDD-LTE Band 38', value: '38' },
  { label: 'TDD-LTE Band 39', value: '39' },
  { label: 'TDD-LTE Band 40', value: '40' },
  { label: 'TDD-LTE Band 41', value: '41' },
]

const bandValueMap: Record<string, string> = {
  '1': 'FDD-LTE Band 1',
  '3': 'FDD-LTE Band 3',
  '5': 'FDD-LTE Band 5',
  '8': 'FDD-LTE Band 8',
  '38': 'TDD-LTE Band 38',
  '39': 'TDD-LTE Band 39',
  '40': 'TDD-LTE Band 40',
  '41': 'TDD-LTE Band 41',
}

const bandToWorkLteBand: Record<string, string> = {
  auto: '149,0,0,0,224,1,0,0',
  '1': '1,0,0,0,0,0,0,0',
  '3': '4,0,0,0,0,0,0,0',
  '5': '16,0,0,0,0,0,0,0',
  '8': '128,0,0,0,0,0,0,0',
  '38': '0,0,0,0,32,0,0,0',
  '39': '0,0,0,0,64,0,0,0',
  '40': '0,0,0,0,128,0,0,0',
  '41': '0,0,0,0,0,1,0,0',
}

const currentBandText = computed(() => {
  if (!currentBand.value || currentBand.value === '0') {
    return '未连接'
  }
  return bandValueMap[currentBand.value] || `Band ${currentBand.value}`
})

const initData = async () => {
  try {
    const res = await request.get('/reqproc/proc_get', {
      headers: {
        Pragma: 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
      },
      queryParams: {
        cmd: 'lte_band,cell_id,ping_google',
        multi_data: '1',
        _: Date.now().toString(),
      },
    })
    if (res.data.lte_band !== undefined) {
      currentBand.value = res.data.lte_band
    }
    if (res.data.cell_id !== undefined) {
      cellId.value = res.data.cell_id
    }
  } catch (error) {
    LMessage.error('获取频段信息失败')
  }
}

const applyBand = async () => {
  try {
    const workLteBand = bandToWorkLteBand[bandSetting.value] || '0,0,0,0,0,0,0,0'

    const res = await postProc('SET_FREQ_BAND', {
      work_lte_band: workLteBand,
      ping_google: 'no',
    })

    if (res.data.result === 'success') {
      LMessage.success('频段设置成功')
      await initData()
    } else {
      LMessage.error('频段设置失败')
    }
  } catch (error) {
    LMessage.error('频段设置失败')
  }
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.band-page {
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

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 8px;
}
</style>

<template>
  <div class="port-mapping-page">
    <div class="module">
      <h2 class="module-title">端口映射</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">端口映射设置</label>
          <div class="radio-group">
            <LRadio v-model="portMappingEnabled" label="1" name="portMappingEnabled">启用</LRadio>
            <LRadio v-model="portMappingEnabled" label="0" name="portMappingEnabled">关闭</LRadio>
          </div>
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applyPortMapping">应用</LButton>
        </div>
      </div>
    </div>

    <div v-if="portMappingEnabled === '1'" class="module">
      <h2 class="module-title">端口映射设置</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">
            源端口
            <span class="required">*</span>
          </label>
          <div class="input-with-hint">
            <LInput v-model="sourcePort" placeholder="请输入源端口" />
            <span class="hint">(1-65000)</span>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">
            目的 IP 地址
            <span class="required">*</span>
          </label>
          <div class="input-with-hint">
            <LInput v-model="destIp" placeholder="请输入目的IP地址" />
            <span class="hint">(例如：192.168.0.101)</span>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">
            目的端口
            <span class="required">*</span>
          </label>
          <div class="input-with-hint">
            <LInput v-model="destPort" placeholder="请输入目的端口" />
            <span class="hint">(1-65000)</span>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">协议</label>
          <LSelect v-model="protocol" :options="protocolOptions" />
        </div>

        <div class="form-item">
          <label class="form-label">
            注释
            <span class="required">*</span>
          </label>
          <LInput v-model="comment" placeholder="请输入注释" />
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="addMappingRule">应用</LButton>
        </div>
      </div>
    </div>

    <div v-if="portMappingEnabled === '1'" class="module">
      <h2 class="module-title">当前映射规则</h2>
      <div class="module-content">
        <div class="table-wrapper">
          <div v-if="isLoading" class="loading-overlay">
            <span class="loading-text">加载中...</span>
          </div>
          <LTable v-show="!isLoading" :columns="mappingColumns" :data="mappingRules" bordered />
          <div v-if="!isLoading && mappingRules.length === 0" class="empty-state">
            <span class="empty-text">暂无映射规则</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { LRadio, LButton, LInput, LSelect, LTable, LMessage } from '@/components'
import { postProc } from '@/api/basic.api'
import request from '@/utils/request'

const portMappingEnabled = ref('0')
const sourcePort = ref('')
const destIp = ref('')
const destPort = ref('')
const protocol = ref('tcp_udp')
const comment = ref('')
const isLoading = ref(false)

const protocolOptions = [
  { label: 'TCP+UDP', value: 'tcp_udp' },
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
]

const protocolMap: Record<string, string> = {
  tcp: '1',
  udp: '2',
  tcp_udp: '3',
}

const protocolReverseMap: Record<string, string> = {
  '1': 'TCP',
  '2': 'UDP',
  '3': 'TCP/UDP',
}

const mappingColumns = [
  { prop: 'sourcePort', label: '源端口', align: 'left' as const },
  { prop: 'destIp', label: '目的IP地址', align: 'left' as const },
  { prop: 'destPort', label: '目的端口', align: 'left' as const },
  { prop: 'protocol', label: '协议', align: 'left' as const },
  { prop: 'comment', label: '注释', align: 'left' as const },
  {
    prop: 'operation',
    label: '操作',
    align: 'center' as const,
    width: '80px',
    render: (_row: Record<string, unknown>, index: number) =>
      h(
        'button',
        {
          class: 'delete-btn',
          onClick: () => deleteMappingRule(index),
        },
        '删除',
      ),
  },
]

interface MappingRule {
  id: number
  sourcePort: string
  destIp: string
  destPort: string
  protocol: string
  comment: string
}

const mappingRules = reactive<MappingRule[]>([])

const parseRuleString = (ruleStr: string, index: number): MappingRule | null => {
  if (!ruleStr || ruleStr.trim() === '') return null

  const parts = ruleStr.split(',')
  if (parts.length < 5) return null

  return {
    id: index,
    sourcePort: parts[1] || '',
    destIp: parts[0] || '',
    destPort: parts[2] || '',
    protocol: parts[3] ? protocolReverseMap[parts[3]] || 'TCP/UDP' : 'TCP/UDP',
    comment: parts[4] || '',
  }
}

const loadMappingRules = async () => {
  isLoading.value = true
  try {
    const cmd = [
      'PortMapEnable',
      ...Array.from({ length: 10 }, (_, i) => `PortMapRules_${i}`),
    ].join(',')

    const res = await request.get('/reqproc/proc_get', {
      headers: {
        Pragma: 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
      },
      queryParams: {
        cmd,
        multi_data: '1',
        _: Date.now().toString(),
      },
    })

    portMappingEnabled.value = res.data.PortMapEnable || '0'

    mappingRules.splice(0, mappingRules.length)

    for (let i = 0; i < 10; i++) {
      const rule = parseRuleString(res.data[`PortMapRules_${i}`] || '', i)
      if (rule) {
        mappingRules.push(rule)
      }
    }
  } catch (error) {
    console.error('加载映射规则失败:', error)
    LMessage.error('加载映射规则失败')
  } finally {
    isLoading.value = false
  }
}

const applyPortMapping = async () => {
  isLoading.value = true
  try {
    const params = {
      portMapEnabled: portMappingEnabled.value,
    }

    const res = await postProc('ADD_PORT_MAP', params)

    if (res.data.result === 'success') {
      LMessage.success('端口映射设置已应用')
      await loadMappingRules()
    } else {
      LMessage.error('设置失败')
    }
  } catch (error) {
    console.error('应用端口映射设置失败:', error)
    LMessage.error('应用端口映射设置失败')
  } finally {
    isLoading.value = false
  }
}

const addMappingRule = async () => {
  if (!sourcePort.value.trim()) {
    LMessage.error('请输入源端口')
    return
  }

  if (!destIp.value.trim()) {
    LMessage.error('请输入目的IP地址')
    return
  }

  if (!destPort.value.trim()) {
    LMessage.error('请输入目的端口')
    return
  }

  if (!comment.value.trim()) {
    LMessage.error('请输入注释')
    return
  }

  isLoading.value = true
  try {
    const params: Record<string, string> = {
      portMapEnabled: '1',
      fromPort: sourcePort.value,
      ip_address: destIp.value,
      toPort: destPort.value,
      protocol: protocol.value === 'tcp_udp' ? 'TCP&UDP' : protocol.value.toUpperCase(),
      comment: comment.value,
    }

    const res = await postProc('ADD_PORT_MAP', params)

    if (res.data.result === 'success') {
      LMessage.success('映射规则已添加')

      sourcePort.value = ''
      destIp.value = ''
      destPort.value = ''
      protocol.value = 'tcp_udp'
      comment.value = ''

      await loadMappingRules()
    } else {
      LMessage.error('添加规则失败')
    }
  } catch (error) {
    console.error('添加映射规则失败:', error)
    LMessage.error('添加映射规则失败')
  } finally {
    isLoading.value = false
  }
}

const deleteMappingRule = async (index: number) => {
  const rule = mappingRules[index]
  if (!rule) return

  isLoading.value = true
  try {
    const params: Record<string, string> = {
      delete_id: `${rule.id};`,
    }

    const res = await postProc('DEL_PORT_MAP', params)

    if (res.data.result === 'success') {
      mappingRules.splice(index, 1)
      LMessage.success('映射规则已删除')
    } else {
      LMessage.error('删除规则失败')
    }
  } catch (error) {
    console.error('删除映射规则失败:', error)
    LMessage.error('删除映射规则失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadMappingRules()
})
</script>

<style lang="scss" scoped>
.port-mapping-page {
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

.input-with-hint {
  display: flex;
  align-items: center;
  gap: 12px;

  .hint {
    font-size: 12px;
    color: var(--text-placeholder, #9ca3af);
    white-space: nowrap;
  }
}

.table-wrapper {
  margin-top: 12px;
  position: relative;
  min-height: 100px;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.empty-text {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

:deep(.l-table) {
  --table-header-bg: var(--bg-card-secondary, #f5f7fa);
  --table-row-hover-bg: rgba(var(--primary-500), 0.05);
}

:deep(.l-table__td--center) {
  .delete-btn {
    padding: 4px 10px;
    font-size: 12px;
    font-weight: 500;
    color: var(--danger-500, #ef4444);
    background: transparent;
    border: 1px solid var(--danger-400, #f87171);
    border-radius: var(--radius-sm, 4px);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--danger-50, #fef2f2);
    }
  }
}
</style>
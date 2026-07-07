<template>
  <div class="port-filter-page">
    <div class="module">
      <h2 class="module-title">端口过滤</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">MAC/IP/端口过滤</label>
          <div class="radio-group">
            <LRadio v-model="portFilterEnabled" label="1" name="portFilterEnabled">启用</LRadio>
            <LRadio v-model="portFilterEnabled" label="0" name="portFilterEnabled">关闭</LRadio>
          </div>
        </div>

        <div v-if="portFilterEnabled === '1'" class="form-item">
          <label class="form-label">默认策略</label>
          <div class="radio-group">
            <LRadio v-model="defaultPolicy" label="allow" name="defaultPolicy">放行</LRadio>
            <LRadio v-model="defaultPolicy" label="deny" name="defaultPolicy">丢弃</LRadio>
          </div>
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applyPortFilter">应用</LButton>
        </div>
      </div>
    </div>

    <div v-if="portFilterEnabled === '1'" class="module">
      <h2 class="module-title">MAC/IP/端口过滤设置</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">IP设置</label>
          <div class="radio-group">
            <LRadio v-model="ipType" label="ipv4" name="ipType">IPv4</LRadio>
            <LRadio v-model="ipType" label="ipv6" name="ipType">IPv6</LRadio>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">MAC 地址</label>
          <LInput v-model="macAddress" placeholder="例如：00:1E:90:FF:FF:FF" />
        </div>

        <div class="form-item">
          <label class="form-label">源 IP 地址</label>
          <LInput v-model="sourceIp" placeholder="请输入源IP地址" />
        </div>

        <div class="form-item">
          <label class="form-label">目的 IP 地址</label>
          <LInput v-model="destinationIp" placeholder="请输入目的IP地址" />
        </div>

        <div class="form-item">
          <label class="form-label">源端口范围</label>
          <div class="port-range">
            <LInput v-model="sourcePortStart" placeholder="起始端口" class="port-input" />
            <span class="range-separator">-</span>
            <LInput v-model="sourcePortEnd" placeholder="结束端口" class="port-input" />
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">目的端口范围</label>
          <div class="port-range">
            <LInput v-model="destPortStart" placeholder="起始端口" class="port-input" />
            <span class="range-separator">-</span>
            <LInput v-model="destPortEnd" placeholder="结束端口" class="port-input" />
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">协议</label>
          <LSelect v-model="protocol" :options="protocolOptions" />
        </div>

        <div class="form-item">
          <label class="form-label">操作</label>
          <div class="radio-group">
            <LRadio v-model="defaultPolicy" label="allow" name="action">放行</LRadio>
            <LRadio v-model="defaultPolicy" label="deny" name="action">丢弃</LRadio>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">
            注释
            <span class="required">*</span>
          </label>
          <LInput v-model="comment" placeholder="请输入注释" />
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="addFilterRule">应用</LButton>
        </div>
      </div>
    </div>

    <div v-if="portFilterEnabled === '1'" class="module">
      <h2 class="module-title">系统当前 MAC/IP/端口过滤规则</h2>
      <div class="module-content">
        <div class="table-wrapper">
          <div v-if="isLoading" class="loading-overlay">
            <span class="loading-text">加载中...</span>
          </div>
          <LTable v-show="!isLoading" :columns="filterColumns" :data="filterRules" bordered />
          <div v-if="!isLoading && filterRules.length === 0" class="empty-state">
            <span class="empty-text">暂无过滤规则</span>
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

const portFilterEnabled = ref('0')
const defaultPolicy = ref('allow')
const ipType = ref('ipv4')
const macAddress = ref('')
const sourceIp = ref('')
const destinationIp = ref('')
const sourcePortStart = ref('')
const sourcePortEnd = ref('')
const destPortStart = ref('')
const destPortEnd = ref('')
const protocol = ref('all')
const comment = ref('')
const isLoading = ref(false)

const protocolOptions = [
  { label: '全部', value: 'all' },
  { label: 'TCP', value: 'tcp' },
  { label: 'UDP', value: 'udp' },
  { label: 'ICMP', value: 'icmp' },
]

const filterColumns = [
  { prop: 'macAddress', label: 'MAC地址', align: 'left' as const },
  { prop: 'ipType', label: 'IP类型', align: 'left' as const },
  { prop: 'sourceIp', label: '源IP地址', align: 'left' as const },
  { prop: 'destinationIp', label: '目的IP地址', align: 'left' as const },
  { prop: 'protocol', label: '协议', align: 'left' as const },
  { prop: 'sourcePort', label: '源端口范围', align: 'left' as const },
  { prop: 'destPort', label: '目的端口范围', align: 'left' as const },
  { prop: 'action', label: '操作', align: 'left' as const },
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
          onClick: () => deleteFilterRule(index),
        },
        '删除',
      ),
  },
]

interface FilterRule {
  id: number
  macAddress: string
  ipType: string
  sourceIp: string
  destinationIp: string
  protocol: string
  sourcePort: string
  destPort: string
  action: string
  comment: string
  isIpv6: boolean
}

const filterRules = reactive<FilterRule[]>([])

const parseRuleString = (ruleStr: string, isIpv6: boolean): FilterRule | null => {
  if (!ruleStr || ruleStr.trim() === '') return null

  const parts = ruleStr.split(',')
  if (parts.length < 12) return null

  return {
    id: parseInt(parts[11] || '0') || 0,
    macAddress: parts[11] || '',
    ipType: isIpv6 ? 'IPv6' : 'IPv4',
    sourceIp: parts[0] || '',
    destinationIp: parts[4] || '',
    protocol:
      parts[9] === '1' ? 'TCP' : parts[9] === '2' ? 'UDP' : parts[9] === '3' ? 'ICMP' : '全部',
    sourcePort: `${parts[2] || '-'}-${parts[3] || '-'}`,
    destPort: `${parts[6] || '-'}-${parts[7] || '-'}`,
    action: parts[8] === '1' ? '放行' : '丢弃',
    comment: parts[10] || '',
    isIpv6,
  }
}

const loadFilterRules = async () => {
  isLoading.value = true
  try {
    const cmd = [
      'IPPortFilterEnable',
      'DefaultFirewallPolicy',
      ...Array.from({ length: 10 }, (_, i) => `IPPortFilterRules_${i}`),
      ...Array.from({ length: 10 }, (_, i) => `IPPortFilterRulesv6_${i}`),
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

    portFilterEnabled.value = res.data.IPPortFilterEnable || '0'
    defaultPolicy.value = res.data.DefaultFirewallPolicy === '0' ? 'allow' : 'deny'

    filterRules.splice(0, filterRules.length)

    for (let i = 0; i < 10; i++) {
      const rule = parseRuleString(res.data[`IPPortFilterRules_${i}`] || '', false)
      if (rule) {
        rule.id = i
        filterRules.push(rule)
      }
    }

    for (let i = 0; i < 10; i++) {
      const rule = parseRuleString(res.data[`IPPortFilterRulesv6_${i}`] || '', true)
      if (rule) {
        rule.id = i
        filterRules.push(rule)
      }
    }
  } catch (error) {
    console.error('加载过滤规则失败:', error)
    LMessage.error('加载过滤规则失败')
  } finally {
    isLoading.value = false
  }
}

const applyPortFilter = async () => {
  isLoading.value = true
  try {
    const params = {
      portFilterEnabled: portFilterEnabled.value,
      defaultFirewallPolicy: defaultPolicy.value === 'allow' ? '0' : '1',
    }

    const res = await postProc('BASIC_SETTING', params)

    if (res.data.result === 'success') {
      LMessage.success('端口过滤设置已应用')
    } else {
      LMessage.error('设置失败')
    }
  } catch (error) {
    console.error('应用端口过滤设置失败:', error)
    LMessage.error('应用端口过滤设置失败')
  } finally {
    isLoading.value = false
  }
}

const addFilterRule = async () => {
  if (!comment.value.trim()) {
    LMessage.error('请输入注释')
    return
  }

  isLoading.value = true
  try {
    const protocolMap: Record<string, string> = {
      all: '0',
      tcp: '1',
      udp: '2',
      icmp: '3',
    }

    const params: Record<string, string> = {
      ip_version: ipType.value,
      mac_address: macAddress.value,
      sip_address: sourceIp.value,
      dip_address: destinationIp.value,
      sFromPort: sourcePortStart.value || '0',
      sToPort: sourcePortEnd.value || '65535',
      dFromPort: destPortStart.value || '0',
      dToPort: destPortEnd.value || '65535',
      action: defaultPolicy.value === 'allow' ? 'Accept' : 'Deny',
      protocol: protocolMap[protocol.value] || '0',
      comment: comment.value,
    }

    const res = await postProc('ADD_IP_PORT_FILETER_V4V6', params)

    if (res.data.result === 'success') {
      LMessage.success('过滤规则已添加')

      macAddress.value = ''
      sourceIp.value = ''
      destinationIp.value = ''
      sourcePortStart.value = ''
      sourcePortEnd.value = ''
      destPortStart.value = ''
      destPortEnd.value = ''
      protocol.value = 'all'
      comment.value = ''

      await loadFilterRules()
    } else {
      LMessage.error('添加规则失败')
    }
  } catch (error) {
    console.error('添加过滤规则失败:', error)
    LMessage.error('添加过滤规则失败')
  } finally {
    isLoading.value = false
  }
}

const deleteFilterRule = async (index: number) => {
  const rule = filterRules[index]
  if (!rule) return

  isLoading.value = true
  try {
    const params: Record<string, string> = {}

    if (rule.isIpv6) {
      params.delete_id_v6 = `${rule.id};`
      params.delete_id = ''
    } else {
      params.delete_id = `${rule.id};`
      params.delete_id_v6 = ''
    }

    const res = await postProc('DEL_IP_PORT_FILETER_V4V6', params)

    if (res.data.result === 'success') {
      filterRules.splice(index, 1)
      LMessage.success('过滤规则已删除')
    } else {
      LMessage.error('删除规则失败')
    }
  } catch (error) {
    console.error('删除过滤规则失败:', error)
    LMessage.error('删除过滤规则失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadFilterRules()
})
</script>

<style lang="scss" scoped>
.port-filter-page {
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

.port-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.port-input {
  flex: 1;
  max-width: calc(50% - 12px);
}

.range-separator {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
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
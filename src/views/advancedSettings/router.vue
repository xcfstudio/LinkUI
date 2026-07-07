<template>
  <div class="router-page">
    <div class="module">
      <h2 class="module-title">路由</h2>
      <div class="module-content">
        <div class="form-item">
          <label class="form-label">
            IP 地址
            <span class="required">*</span>
          </label>
          <input type="text" v-model="ipAddress" class="form-input" placeholder="请输入IP地址" />
        </div>

        <div class="form-item">
          <label class="form-label">
            子网掩码
            <span class="required">*</span>
          </label>
          <input type="text" v-model="subnetMask" class="form-input" placeholder="请输入子网掩码" />
        </div>

        <div class="form-item">
          <label class="form-label">DHCP服务</label>
          <div class="radio-group">
            <LRadio v-model="dhcpEnabled" label="1" name="dhcpEnabled">启用</LRadio>
            <LRadio v-model="dhcpEnabled" label="0" name="dhcpEnabled">关闭</LRadio>
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">
            DHCP IP池
            <span class="required">*</span>
          </label>
          <div class="ip-pool">
            <input
              type="text"
              v-model="dhcpStart"
              class="form-input pool-input"
              placeholder="起始IP"
            />
            <span class="pool-separator">-</span>
            <input
              type="text"
              v-model="dhcpEnd"
              class="form-input pool-input"
              placeholder="结束IP"
            />
          </div>
        </div>

        <div class="form-item">
          <label class="form-label">
            DHCP租期
            <span class="required">*</span>
          </label>
          <div class="lease-duration">
            <input
              type="number"
              v-model="leaseTime"
              class="form-input lease-input"
              placeholder="租期"
              min="1"
            />
            <span class="lease-unit">小时</span>
          </div>
        </div>

        <div class="action-bar">
          <LButton type="primary" @click="applyRouterSettings">应用</LButton>
        </div>
      </div>
    </div>
  </div>

  <LDialog
    v-model:visible="showConfirmDialog"
    title="确认路由设置"
    message="应用路由设置将导致设备重启，重启过程可能需要1-2分钟，请确认是否继续？"
    @confirm="confirmRouterSettings"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { LRadio, LButton, LMessage, LDialog } from '@/components'
import { useProcStore } from '@/stores/proc'
import { setDhcpSettings } from '@/api/basic.api'

const procStore = useProcStore()

const ipAddress = computed({
  get: () => procStore.routerInfo?.lan_ipaddr || '192.168.100.1',
  set: (val) => {
    if (!procStore.routerInfo) procStore.routerInfo = {}
    procStore.routerInfo.lan_ipaddr = val
  },
})
const subnetMask = computed({
  get: () => procStore.routerInfo?.lan_netmask || '255.255.255.0',
  set: (val) => {
    if (!procStore.routerInfo) procStore.routerInfo = {}
    procStore.routerInfo.lan_netmask = val
  },
})
const dhcpEnabled = computed({
  get: () => procStore.routerInfo?.dhcpEnabled || '1',
  set: (val) => {
    if (!procStore.routerInfo) procStore.routerInfo = {}
    procStore.routerInfo.dhcpEnabled = val
  },
})
const dhcpStart = computed({
  get: () => procStore.routerInfo?.dhcpStart || '192.168.100.100',
  set: (val) => {
    if (!procStore.routerInfo) procStore.routerInfo = {}
    procStore.routerInfo.dhcpStart = val
  },
})
const dhcpEnd = computed({
  get: () => procStore.routerInfo?.dhcpEnd || '192.168.100.200',
  set: (val) => {
    if (!procStore.routerInfo) procStore.routerInfo = {}
    procStore.routerInfo.dhcpEnd = val
  },
})
const leaseTime = computed({
  get: () => procStore.routerInfo?.dhcpLease_hour || '24',
  set: (val) => {
    if (!procStore.routerInfo) procStore.routerInfo = {}
    procStore.routerInfo.dhcpLease_hour = val
  },
})

const showConfirmDialog = ref(false)

const initData = async () => {
  await procStore.updateRouterInfo()
}

const validateIp = (ip: string): boolean => {
  const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/
  return ipRegex.test(ip)
}

const applyRouterSettings = () => {
  if (!validateIp(ipAddress.value)) {
    LMessage.error('请输入有效的IP地址')
    return
  }

  if (!validateIp(subnetMask.value)) {
    LMessage.error('请输入有效的子网掩码')
    return
  }

  if (!validateIp(dhcpStart.value)) {
    LMessage.error('请输入有效的起始IP地址')
    return
  }

  if (!validateIp(dhcpEnd.value)) {
    LMessage.error('请输入有效的结束IP地址')
    return
  }

  if (!leaseTime.value || parseInt(leaseTime.value) < 1) {
    LMessage.error('请输入有效的租期')
    return
  }

  showConfirmDialog.value = true
}

const confirmRouterSettings = async () => {
  try {
    const res = await setDhcpSettings(
      ipAddress.value,
      subnetMask.value,
      dhcpEnabled.value,
      dhcpStart.value,
      dhcpEnd.value,
      leaseTime.value,
    )

    if (res.data.result === 'success') {
      LMessage.success('路由设置成功')

      procStore.proc.lan_ipaddr = ipAddress.value
      procStore.proc.lan_netmask = subnetMask.value
      procStore.proc.dhcpEnabled = dhcpEnabled.value
      procStore.proc.dhcpStart = dhcpStart.value
      procStore.proc.dhcpEnd = dhcpEnd.value
      procStore.proc.dhcpLease_hour = leaseTime.value
    } else {
      LMessage.error('路由设置失败')
    }
  } catch (error) {
    LMessage.error('路由设置失败')
  }
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.router-page {
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

.form-input {
  height: 40px;
  padding: 0 12px;
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  background: var(--bg-primary, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: var(--primary-500, #0ea5e9);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  &::placeholder {
    color: var(--text-placeholder, #9ca3af);
  }
}

.radio-group {
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
}

.ip-pool {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
}

.pool-input {
  flex: 1;
  min-width: 0;
  max-width: calc(50% - 18px);
}

.pool-separator {
  font-size: 16px;
  color: var(--text-secondary, #6b7280);
  font-weight: 500;
}

.lease-duration {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 200px;
}

.lease-input {
  width: 100px;
}

.lease-unit {
  height: 40px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  background: var(--bg-card-secondary, #f5f7fa);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 8px;
}
</style>

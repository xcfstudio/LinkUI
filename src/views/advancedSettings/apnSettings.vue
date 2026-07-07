<template>
  <div class="apn-settings-page">
    <div class="module">
      <h2 class="module-title">APN设置</h2>

      <div class="form-row">
        <div class="form-item">
          <label class="form-label">模式</label>
          <div class="radio-options">
            <LRadio v-model="apnMode" label="auto" name="mode">自动</LRadio>
            <LRadio v-model="apnMode" label="manual" name="mode">手动</LRadio>
          </div>
        </div>
      </div>

      <div class="form-row" v-show="apnMode === 'manual'">
        <div class="form-item">
          <label class="form-label">配置文件</label>
          <div class="select-wrapper">
            <LSelect v-model="profile" :options="profileOptions" />
            <LButton type="primary" size="sm" @click="addProfile">新增</LButton>
          </div>
        </div>
      </div>

      <div class="form-row" v-show="apnMode === 'manual'">
        <div class="form-item">
          <label class="form-label">PDP类型</label>
          <LSelect v-model="pdpType" :options="pdpTypeOptions" />
        </div>
      </div>

      <div class="form-row" v-show="apnMode === 'manual'">
        <div class="form-item">
          <label class="form-label">配置文件名称 <span class="required">*</span></label>
          <LInput v-model="profileName" placeholder="请输入配置文件名称" />
        </div>
      </div>

      <div class="form-row" v-show="apnMode === 'manual'">
        <div class="form-item">
          <label class="form-label">APN <span class="required">*</span></label>
          <LInput v-model="apn" placeholder="请输入APN" />
        </div>
      </div>

      <div class="form-row" v-show="apnMode === 'manual'">
        <div class="form-item">
          <label class="form-label">鉴权方式</label>
          <LSelect v-model="authType" :options="authTypeOptions" />
        </div>
      </div>

      <div class="form-row" v-show="apnMode === 'manual' && authType !== 'none'">
        <div class="form-item">
          <label class="form-label">用户名</label>
          <LInput v-model="username" placeholder="请输入用户名" />
        </div>
      </div>

      <div class="form-row" v-show="apnMode === 'manual' && authType !== 'none'">
        <div class="form-item">
          <label class="form-label">密码</label>
          <div class="password-wrapper">
            <LInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
            />
            <label class="checkbox-label">
              <input type="checkbox" v-model="showPassword" />
              <span class="checkbox-text">显示密码</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-item">
          <label class="form-label">拨号号码</label>
          <span class="read-only-value">{{ dialNumber }}</span>
        </div>
      </div>

      <div class="action-bar">
        <LButton type="primary" @click="saveSettings">保存设置</LButton>
        <LButton type="default" @click="setAsDefault" v-show="apnMode === 'manual'"
          >设为默认</LButton
        >
      </div>
    </div>

    <LDialog
      v-model:visible="showAddDialog"
      title="新增APN配置"
      :show-footer="true"
      @confirm="confirmAddProfile"
      @cancel="showAddDialog = false"
    >
      <div class="dialog-content">
        <div class="dialog-form-item">
          <label class="dialog-form-label">配置文件名称 <span class="required">*</span></label>
          <LInput v-model="newProfileName" placeholder="请输入配置文件名称" />
        </div>

        <div class="dialog-form-item">
          <label class="dialog-form-label">APN <span class="required">*</span></label>
          <LInput v-model="newApn" placeholder="请输入APN" />
        </div>

        <div class="dialog-form-item">
          <label class="dialog-form-label">PDP类型</label>
          <LSelect v-model="newPdpType" :options="pdpTypeOptions" />
        </div>

        <div class="dialog-form-item">
          <label class="dialog-form-label">鉴权方式</label>
          <LSelect v-model="newAuthType" :options="authTypeOptions" />
        </div>

        <div class="dialog-form-item" v-show="newAuthType !== 'none'">
          <label class="dialog-form-label">用户名</label>
          <LInput v-model="newUsername" placeholder="请输入用户名" />
        </div>

        <div class="dialog-form-item" v-show="newAuthType !== 'none'">
          <label class="dialog-form-label">密码</label>
          <LInput v-model="newPassword" type="password" placeholder="请输入密码" />
        </div>
      </div>
    </LDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LRadio, LSelect, LInput, LButton, LMessage, LDialog } from '@/components'
import request from '@/utils/request'
import { setDefaultApn } from '@/api/basic.api'

const jsonHeaders = {
  Pragma: 'no-cache',
  'X-Requested-With': 'XMLHttpRequest',
}

const apnMode = ref('auto')
const profile = ref('')
const pdpType = ref('IP')
const profileName = ref('')
const apn = ref('')
const authType = ref('none')
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const dialNumber = ref('')

const profileOptions = ref<{ value: string; label: string }[]>([])
const apnConfigs = ref<
  Record<
    string,
    { apn: string; dial: string; auth: string; user: string; pass: string; pdp: string }
  >
>({})

const showAddDialog = ref(false)
const newProfileName = ref('')
const newApn = ref('')
const newPdpType = ref('IP')
const newAuthType = ref('none')
const newUsername = ref('')
const newPassword = ref('')

const pdpTypeOptions = [
  { value: 'IP', label: 'IPv4' },
  { value: 'IPv6', label: 'IPv6' },
  { value: 'IPv4v6', label: 'IPv4v6' },
]

const authTypeOptions = [
  { value: 'none', label: 'NONE' },
  { value: 'PAP', label: 'PAP' },
  { value: 'CHAP', label: 'CHAP' },
  { value: 'PAP/CHAP', label: 'PAP/CHAP' },
]

const parseApnConfig = (
  configStr: string,
): {
  name: string
  apn: string
  dial: string
  auth: string
  user: string
  pass: string
  pdp: string
} | null => {
  if (!configStr) return null
  const parts = configStr.split('($)')
  return {
    name: parts[0] || '',
    apn: parts[1] || '',
    dial: parts[3] || '',
    auth: (parts[4] || '').toLocaleLowerCase(),
    user: parts[5] || '',
    pass: parts[6] || '',
    pdp: parts[7] || 'IP',
  }
}

const initData = async () => {
  try {
    const cmd =
      'APN_configtmp0,APN_configtmp1,APN_configtmp2,APN_configtmp3,APN_configtmp4,APN_configtmp5,APN_configtmp6,APN_configtmp7,APN_configtmp8,APN_configtmp9,APN_configtmp10,APN_configtmp11,APN_configtmp12,APN_configtmp13,APN_configtmp14,APN_configtmp15,APN_configtmp16,APN_configtmp17,APN_configtmp18,APN_configtmp19,m_profile_name,profile_name,wan_dial,pdp_type,pdp_select,index,Current_index,apn_mode,wan_apn,ppp_auth_mode,ppp_username,ppp_passtmp,apn_num_preset'

    const res = await request.get('/reqproc/proc_get', {
      headers: jsonHeaders,
      queryParams: {
        cmd,
        multi_data: '1',
        _: Date.now().toString(),
      },
    })

    const data = res.data

    apnMode.value = data.apn_mode || 'auto'
    dialNumber.value = data.wan_dial || '*99#'

    if (apnMode.value === 'manual') {
      pdpType.value = data.pdp_type || 'IP'
      apn.value = data.wan_apn || ''
      authType.value = (data.ppp_auth_mode || 'none').toLocaleLowerCase()
      username.value = data.ppp_username || ''
      password.value = data.ppp_passtmp || ''
      profileName.value = data.profile_name || data.m_profile_name || ''
    }

    const profiles: { value: string; label: string }[] = []
    const configs: Record<
      string,
      { apn: string; dial: string; auth: string; user: string; pass: string; pdp: string }
    > = {}

    for (let i = 0; i < 20; i++) {
      const config = data[`APN_configtmp${i}`]
      if (config && config.trim()) {
        const parsed = parseApnConfig(config)
        if (parsed && parsed.name) {
          profiles.push({ value: parsed.name, label: parsed.name })
          configs[parsed.name] = {
            apn: parsed.apn,
            dial: parsed.dial,
            auth: parsed.auth,
            user: parsed.user,
            pass: parsed.pass,
            pdp: parsed.pdp,
          }
        }
      }
    }

    if (profiles.length === 0) {
      profiles.push({ value: 'Default', label: 'Default' })
    }
    profileOptions.value = profiles
    apnConfigs.value = configs

    if (profileName.value && profiles.some((p) => p.value === profileName.value)) {
    profile.value = profileName.value
  } else if (profiles.length > 0 && profiles[0]) {
    profile.value = profiles[0].value
  }
  } catch (error) {
    console.error('Failed to fetch APN settings:', error)
    LMessage.error('获取APN设置失败')
  }
}

watch(profile, (newVal) => {
  if (newVal) {
    profileName.value = newVal
    const config = apnConfigs.value[newVal]
    if (config) {
      apn.value = config.apn
      pdpType.value = config.pdp || 'IP'
      authType.value = config.auth || 'none'
      username.value = config.user
      password.value = config.pass
      dialNumber.value = config.dial || '*99#'
    }
  }
})

const addProfile = () => {
  newProfileName.value = ''
  newApn.value = ''
  newPdpType.value = 'IP'
  newAuthType.value = 'none'
  newUsername.value = ''
  newPassword.value = ''
  showAddDialog.value = true
}

const confirmAddProfile = async () => {
  if (!newProfileName.value.trim()) {
    LMessage.error('请输入配置文件名称')
    return
  }
  if (!newApn.value.trim()) {
    LMessage.error('请输入APN')
    return
  }

  try {
    const params: Record<string, string> = {
      goformId: 'APN_PROC_EX',
      apn_action: 'save',
      apn_mode: 'manual',
      profile_name: newProfileName.value,
      wan_dial: '*99#',
      pdp_type: newPdpType.value,
      pdp_select: 'auto',
      index: '2',
      wan_apn: newApn.value,
      ppp_auth_mode: newAuthType.value.toUpperCase(),
      ppp_username: newUsername.value,
      ppp_passtmp: newPassword.value,
    }

    const res = await request.post(
      '/reqproc/proc_post',
      Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&'),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Pragma: 'no-cache',
          'X-Requested-With': 'XMLHttpRequest',
        },
      },
    )

    if (res.data.result === 'success') {
      LMessage.success('新增APN配置成功')
      showAddDialog.value = false
      await initData()
    } else {
      LMessage.error('新增APN配置失败')
    }
  } catch (error) {
    console.error('Failed to add APN profile:', error)
    LMessage.error('新增APN配置失败')
  }
}

const saveSettings = async () => {
  if (apnMode.value === 'manual') {
    if (!apn.value.trim()) {
      LMessage.error('请输入APN')
      return
    }
    if (!profileName.value.trim()) {
      LMessage.error('请输入配置文件名称')
      return
    }
  }

  try {
    let data: string
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Pragma: 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
    }

    if (apnMode.value === 'auto') {
      data = 'goformId=APN_PROC_EX&apn_mode=auto'
    } else {
      const params: Record<string, string> = {
        goformId: 'APN_PROC_EX',
        apn_action: 'save',
        apn_mode: apnMode.value,
        profile_name: profileName.value,
        wan_dial: '*99#',
        pdp_type: pdpType.value,
        pdp_select: 'auto',
        index: '2',
        wan_apn: apn.value,
        ppp_auth_mode: authType.value.toUpperCase(),
        ppp_username: username.value,
        ppp_passtmp: password.value,
      }
      data = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&')
    }

    const res = await request.post('/reqproc/proc_post', data, { headers })

    if (res.data.result === 'success') {
      LMessage.success('APN设置保存成功')
      await initData()
    } else {
      LMessage.error('APN设置保存失败')
    }
  } catch (error) {
    console.error('Failed to save APN settings:', error)
    LMessage.error('APN设置保存失败')
  }
}

const setAsDefault = async () => {
  try {
    const res = await setDefaultApn()

    if (res.data.result === 'success') {
      LMessage.success('已设为默认APN')
    } else {
      LMessage.error('设置默认APN失败')
    }
  } catch (error) {
    console.error('Failed to set default APN:', error)
    LMessage.error('设置默认APN失败')
  }
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.apn-settings-page {
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

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

.form-item {
  flex: 1;
}

.form-label {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  margin-bottom: 8px;
  display: block;

  .required {
    color: var(--danger, #ef4444);
  }
}

.read-only-value {
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}

.radio-options {
  display: flex;
  gap: 40px;
}

.select-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 300px;

  @media (max-width: 768px) {
    width: 100%;
  }
}

.password-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 300px;

  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
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
}

.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  margin-top: 16px;
}

.dialog-content {
  padding: 8px 0;
}

.dialog-form-item {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.dialog-form-label {
  font-size: 14px;
  color: var(--text-primary, #1f2937);
  margin-bottom: 8px;
  display: block;

  .required {
    color: var(--danger, #ef4444);
  }
}
</style>
import request from '@/utils/request'

const commonHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Pragma: 'no-cache',
  'X-Requested-With': 'XMLHttpRequest',
}

const jsonHeaders = {
  Pragma: 'no-cache',
  'X-Requested-With': 'XMLHttpRequest',
}

const PROC_POST_URL = '/reqproc/proc_post'

export const postProc = <T = any>(goformId: string, params?: Record<string, string | undefined>) => {
  let data = `goformId=${goformId}`
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        data += `&${key}=${value}`
      }
    })
  }
  return request.post<T>(PROC_POST_URL, data, { headers: commonHeaders })
}

// 登录接口
interface LoginResponse {
  result: string
}

export const login = (password: string) => {
  return postProc<LoginResponse>('LOGIN', { password: btoa(password) })
}

// 登录失败接口
interface LoginFailResponse {
  psw_fail_num_str: string
  login_lock_time: string
}

export const getLoginFailInfo = () => {
  return request.get<LoginFailResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      multi_data: '1',
      cmd: 'psw_fail_num_str,login_lock_time',
      _: Date.now().toString(),
    },
  })
}

// 退出登录接口
interface LogoutResponse {
  result: string
}

export const logout = () => {
  return postProc<LogoutResponse>('LOGOUT')
}

// 基本信息接口
interface BasicInfoResponse {
  lan_station_list: any[]
  modem_main_state: string
  pin_status: string
  blc_wan_mode: string
  blc_wan_auto_mode: string
  loginfo: string
  fota_new_version_state: string
  fota_current_upgrade_state: string
  fota_upgrade_selector: string
  network_provider: string
  is_mandatory: string
  sta_count: string
  m_sta_count: string
  [key: string]: any
}

export const getBasicInfo = async (cmd?: string, no_multi_data?: boolean) => {
  const defaultCmd =
    'modem_main_state,pin_status,blc_wan_mode,blc_wan_auto_mode,loginfo,fota_new_version_state,fota_current_upgrade_state,fota_upgrade_selector,network_provider,is_mandatory,sta_count,m_sta_count'
  const queryParams: Record<string, string> = {
    cmd: cmd || defaultCmd,
    _: Date.now().toString(),
  }
  if (!no_multi_data) {
    queryParams.multi_data = '1'
  }
  return await request.get<BasicInfoResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams,
  })
}

// 断开网络接口
interface DisconnectResponse {
  result: string
}

export const disconnect = () => {
  return postProc<DisconnectResponse>('DISCONNECT_NETWORK')
}

// 连接网络接口
interface ConnectResponse {
  result: string
}

export const connect = () => {
  return postProc<ConnectResponse>('CONNECT_NETWORK')
}

// 设置WiFi休眠时间接口
interface SetWifiSleepResponse {
  result: string
}

export const setWifiSleep = (sleepTime: string) => {
  return postProc<SetWifiSleepResponse>('SET_WIFI_SLEEP_INFO', { sysIdleTimeToSleep: sleepTime })
}

// 设置定时休眠唤醒接口
// 原始表单数据参考：
// openEnable 1
// closeEnable 1
// openTime 06:00
// closeTime 22:00
// 若openEnable为0、closeEnable为0，则openTime无效，closeTime无效
interface SetSleepTimeResponse {
  result: string
}

export const setSleepTime = (
  openEnable: string,
  closeEnable: string,
  openTime: string,
  closeTime: string,
) => {
  const params: Record<string, string> = { openEnable, closeEnable }
  if (openEnable !== '0' || closeEnable !== '0') {
    params.openTime = openTime
    params.closeTime = closeTime
  }
  return postProc<SetSleepTimeResponse>('SAVE_TSW', params)
}

// 设置WiFi功率接口
interface SetWifiPowerResponse {
  result: string
}

export const setWifiPower = (powerMode: string) => {
  return postProc<SetWifiPowerResponse>('SET_WIFI_COVERAGE', { wifi_coverage: powerMode })
}

// 设置DHCP路由接口
interface SetDhcpResponse {
  result: string
}

export const setDhcpSettings = (
  lanIp: string,
  lanNetmask: string,
  dhcpEnabled: string,
  dhcpStart: string,
  dhcpEnd: string,
  dhcpLease: string,
) => {
  const params: Record<string, string> = {
    lanIp,
    lanNetmask,
    lanDhcpType: dhcpEnabled === '1' ? 'SERVER' : 'CLIENT',
    dhcpStart,
    dhcpEnd,
    dhcpLease,
    dhcp_reboot_flag: '1',
  }
  return postProc<SetDhcpResponse>('DHCP_SETTING', params)
}

// 设置WiFi信息
// 表单数据参考：
// goformId SET_WIFI_INFO
// wifiEnabled 0/1
// m_ssid_enable 0/1
// wifiMode 6
// countryCode CN
// MAX_Access_num 8
// m_MAX_Access_num 24
// wifi_band b/a
// selectedChannel 0/1/2/.../11
// abg_rate 0
// wifi_11n_cap 0/1
interface SetWifiInfoResponse {
  result: string
}

interface SetWifiInfoParams extends Record<string, string | undefined> {
  wifiEnabled?: string
  m_ssid_enable?: string
  wifiMode?: string
  countryCode?: string
  MAX_Access_num?: string
  m_MAX_Access_num?: string
  wifi_band?: string
  selectedChannel?: string
  abg_rate?: string
  wifi_11n_cap?: string
}

/**
 * 设置WiFi信息
 * @param params WiFi参数
 */
export const setWifiInfo = (params: SetWifiInfoParams) => {
  return postProc<SetWifiInfoResponse>('SET_WIFI_INFO', params)
}

// 主SSID设置接口
// 表单数据参考：
// goformId SET_WIFI_SSID1_SETTINGS
// ssid XCF_MZ804_1
// MAX_Access_num 32
// security_mode WPA2PSK
// cipher 1
// NoForwarding 0
// NoShow_qrcode_flag 0
// show_qrcode_flag 0
// security_shared_mode 1
// passsphrase WENGMTEMTEw
interface SetMainSsidResponse {
  result: string
}

interface SetMainSsidParams {
  ssid: string
  MAX_Access_num: string
  security_mode: string
  cipher: string
  NoForwarding: string
  NoShow_qrcode_flag: string
  show_qrcode_flag: string
  security_shared_mode: string
  passsphrase: string
  [key: string]: string
}

/**
 * 设置主SSID
 * @param params 主SSID参数
 */
export const setMainSsid = (params: SetMainSsidParams) => {
  return postProc<SetMainSsidResponse>('SET_WIFI_SSID1_SETTINGS', params)
}

// 副SSID设置接口
// 表单数据参考：
// goformId SET_WIFI_SSID2_SETTINGS
// m_ssid XCF_MZ804_2
// m_MAX_Access_num 16
// m_AuthMode WPA2PSK
// m_cipher 1
// m_NoForwarding 0
// m_show_qrcode_flag 0
// m_security_shared_mode 1
// m_passsphrase WENGMTEMTEw
interface SetSubSsidResponse {
  result: string
}

interface SetSubSsidParams {
  m_ssid: string
  m_MAX_Access_num: string
  m_AuthMode: string
  m_cipher: string
  m_NoForwarding: string
  m_show_qrcode_flag: string
  m_security_shared_mode: string
  m_passsphrase: string
  [key: string]: string
}

/**
 * 设置副SSID
 * @param params 副SSID参数
 */
export const setSubSsid = (params: SetSubSsidParams) => {
  return postProc<SetSubSsidResponse>('SET_WIFI_SSID2_SETTINGS', params)
}

// 查询WiFi信息
interface GetWifiInfoResponse {
  m_ssid_enable: string // 副SSID启用状态
  wifi_cur_state: string // WiFi当前状态
  NoForwarding: string // 主SSID是否禁止转发
  m_NoForwarding: string // 副SSID是否禁止转发
  WPAPSK1_encode: string // 主SSID加密密码(base64)
  m_WPAPSK1_encode: string // 副SSID加密密码(base64)
  MAX_Station_num: string // 最大连接数
  SSID1: string // 主SSID名称
  AuthMode: string // 主SSID认证模式
  HideSSID: string // 主SSID是否隐藏
  MAX_Access_num: string // 主SSID最大访问数
  show_qrcode_flag: string // 主SSID是否显示二维码
  EncrypType: string // 主SSID加密类型
  Key1Str1: string // 主SSID密钥1(WEP模式)
  Key2Str1: string // 主SSID密钥2(WEP模式)
  Key3Str1: string // 主SSID密钥3(WEP模式)
  Key4Str1: string // 主SSID密钥4(WEP模式)
  DefaultKeyID: string // 主SSID默认密钥ID
  m_SSID: string // 副SSID名称
  m_AuthMode: string // 副SSID认证模式
  m_HideSSID: string // 副SSID是否隐藏
  m_MAX_Access_num: string // 副SSID最大访问数
  m_EncrypType: string // 副SSID加密类型
  m_show_qrcode_flag: string // 副SSID是否显示二维码
  m_DefaultKeyID: string // 副SSID默认密钥ID
  m_Key1Str1: string // 副SSID密钥1(WEP模式)
  m_Key2Str1: string // 副SSID密钥2(WEP模式)
  m_Key3Str1: string // 副SSID密钥3(WEP模式)
  m_Key4Str1: string // 副SSID密钥4(WEP模式)
  rotationFlag: string // 轮换标志
  wifi_sta_connection: string // WiFi连接状态
  wifi_band: string // 频段 b=2.4G, a=5.8G
  CountryCode: string // 国家/地区码 CN=中国
  wifi_11n_cap: string // 频带宽度 0=20MHz, 1=20MHz/40MHz
  Channel: string // 信道 0=auto, 1-11=对应信道
  ACL_mode: string // MAC过滤模式 0=无规则, 1=白名单, 2=黑名单
  wifi_mac_black_list: string // MAC黑名单列表，分号分隔
  wifi_hostname_black_list: string // 主机名黑名单列表，分号分隔
  user_ip_addr: string // 用户IP地址
  client_mac_address: string // 客户端MAC地址
  wifi_mac_white_list: string // MAC白名单列表，分号分隔
}

/**
 * 查询WiFi信息
 */
export const getWifiInfo = () => {
  const cmd =
    'm_ssid_enable,wifi_cur_state,NoForwarding,m_NoForwarding,WPAPSK1_encode,m_WPAPSK1_encode,MAX_Station_num,SSID1,AuthMode,HideSSID,MAX_Access_num,show_qrcode_flag,EncrypType,Key1Str1,Key2Str1,Key3Str1,Key4Str1,DefaultKeyID,m_SSID,m_AuthMode,m_HideSSID,m_MAX_Access_num,m_EncrypType,m_show_qrcode_flag,m_DefaultKeyID,m_Key1Str1,m_Key2Str1,m_Key3Str1,m_Key4Str1,rotationFlag,wifi_sta_connection,wifi_band,CountryCode,wifi_11n_cap,Channel,ACL_mode,wifi_mac_black_list,wifi_hostname_black_list,user_ip_addr,client_mac_address,wifi_mac_white_list'
  return request.get<GetWifiInfoResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd,
      multi_data: '1',
      _: Date.now().toString(),
    },
  })
}

// WPS设置接口
// 表单数据参考：
// goformId WIFI_WPS_SET
// WPS_SSID SSID名称
// wps_mode PIN/PBC
// wifi_wps_index 1
// wifi_wps_pin_index PIN码索引（当模式为PIN时）
// wps_pin PIN码（当模式为PIN时）
interface SetWpsResponse {
  result: string
}

interface SetWpsParams extends Record<string, string | undefined> {
  WPS_SSID: string
  wps_mode: string
  wifi_wps_index: string
  wifi_wps_pin_index?: string
  wps_pin?: string
}

/**
 * 设置WPS
 * @param params WPS参数
 */
export const setWps = (params: SetWpsParams) => {
  return postProc<SetWpsResponse>('WIFI_WPS_SET', params)
}

// MAC过滤设置接口
// 表单数据参考：
// goformId WIFI_MAC_FILTER
// ACL_mode 0/1/2 (0=无规则, 1=白名单, 2=黑名单)
// wifi_mac_white_list MAC地址列表，用分号分隔
// wifi_mac_black_list MAC地址列表，用分号分隔
interface SetMacFilterResponse {
  result: string
}

interface SetMacFilterParams extends Record<string, string | undefined> {
  ACL_mode: string
  wifi_mac_white_list?: string
  wifi_mac_black_list?: string
}

/**
 * 设置MAC过滤
 * @param params MAC过滤参数
 */
export const setMacFilter = (params: SetMacFilterParams) => {
  return postProc<SetMacFilterResponse>('WIFI_MAC_FILTER', params)
}

// 连接模式查询接口
// 查询字段：ConnectionMode
// 返回数据示例：{"connectionMode":"auto_dial","autoConnectWhenRoaming":"on"}
interface GetConnectionModeResponse {
  connectionMode: string // auto_dial 或 manual_dial
  autoConnectWhenRoaming: string // on 或 off
}

/**
 * 查询连接模式
 */
export const getConnectionMode = () => {
  return request.get<GetConnectionModeResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'ConnectionMode',
      // multi_data: '1',
      _: Date.now().toString(),
    },
  })
}

// 连接模式设置接口
// 表单数据参考：
// goformId SET_CONNECTION_MODE
// ConnectionMode auto_dial/manual_dial
// roam_setting_option on/off
interface SetConnectionModeResponse {
  result: string
}

interface SetConnectionModeParams extends Record<string, string | undefined> {
  ConnectionMode: string
  roam_setting_option: string
}

/**
 * 设置连接模式
 * @param params 连接模式参数
 */ // 设置连接模式
export const setConnectionMode = (params: SetConnectionModeParams) => {
  return postProc<SetConnectionModeResponse>('SET_CONNECTION_MODE', params)
}

// 找网方式查询接口
// 查询字段：net_select_mode, net_select
// 返回数据示例：{"net_select":"Only_LTE","net_select_mode":"auto_select"}
interface GetNetworkSearchResponse {
  net_select_mode: string // auto_select 或 manual_select
  net_select: string // NETWORK_auto, Only_LTE, Only_WCDMA
}

/**
 * 查询找网方式
 */
export const getNetworkSearch = () => {
  return request.get<GetNetworkSearchResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'net_select_mode,net_select',
      multi_data: '1',
      _: Date.now().toString(),
    },
  })
}

// 找网方式设置接口
// 表单数据参考：
// goformId SET_BEARER_PREFERENCE
// BearerPreference NETWORK_auto/Only_LTE/Only_WCDMA
interface SetNetworkSearchResponse {
  result: string
}

/**
 * 设置找网方式
 * @param bearerPreference 网络模式：NETWORK_auto, Only_LTE, Only_WCDMA
 */
export const setNetworkSearch = (bearerPreference: string) => {
  return postProc<SetNetworkSearchResponse>('SET_BEARER_PREFERENCE', {
    BearerPreference: bearerPreference,
  })
}

// 搜索网络指令接口
interface ScanNetworkResponse {
  result: string
}

/**
 * 发送搜索网络指令
 */
export const scanNetwork = () => {
  return postProc<ScanNetworkResponse>('SCAN_NETWORK')
}

// 搜索状态查询接口
interface GetScanStatusResponse {
  m_netselect_status: string // manual_selecting 或 manual_selected
}

/**
 * 查询搜索状态
 */
export const getScanStatus = () => {
  return request.get<GetScanStatusResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'm_netselect_status',
      _: Date.now().toString(),
    },
  })
}

// 搜索结果查询接口
interface GetNetworkListResponse {
  m_netselect_contents: string // 格式: "0,CMCC,46000,7,0;0,,46015,7,0;..."
}

/**
 * 查询搜索结果列表
 */
export const getNetworkList = () => {
  return request.get<GetNetworkListResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'm_netselect_contents',
      _: Date.now().toString(),
    },
  })
}

// 注册网络接口
interface SetNetworkResponse {
  result: string
}

interface SetNetworkParams extends Record<string, string | undefined> {
  NetworkNumber: string // MCCMNC
  Rat: string // 网络类型
  nSubrat: string // 制式
}

/**
 * 注册网络
 * @param params 网络参数
 */
export const setNetwork = (params: SetNetworkParams) => {
  return postProc<SetNetworkResponse>('SET_NETWORK', params)
}

// 设置默认APN接口
interface SetDefaultApnResponse {
  result: string
}

/**
 * 设置默认APN
 */
export const setDefaultApn = () => {
  return postProc<SetDefaultApnResponse>('APN_PROC_EX', {
    apn_mode: 'manual',
    apn_action: 'set_default',
    set_default_flag: '1',
    pdp_type: 'IP',
    index: '0',
  })
}

// DMZ设置查询接口
interface GetDmzResponse {
  DMZEnable: string // 0=关闭, 1=启用
  DMZIPAddress: string // DMZ主机IP地址
}

/**
 * 查询DMZ设置
 */
export const getDmzSettings = () => {
  return request.get<GetDmzResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'DMZEnable,DMZIPAddress',
      multi_data: '1',
      _: Date.now().toString(),
    },
  })
}

// DMZ设置提交接口
interface SetDmzResponse {
  result: string
}

interface SetDmzParams extends Record<string, string | undefined> {
  DMZEnabled: string // 0=关闭, 1=启用
  DMZIPAddress?: string // DMZ主机IP地址
}

/**
 * 设置DMZ
 * @param params DMZ参数
 */
export const setDmzSettings = (params: SetDmzParams) => {
  return postProc<SetDmzResponse>('DMZ_SETTING', params)
}

// IMEI查询接口
interface GetImeiResponse {
  imei: string
  time_to_live: string
}

/**
 * 查询IMEI信息
 */
export const getImeiInfo = () => {
  return request.get<GetImeiResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'imei,time_to_live',
      multi_data: '1',
      _: Date.now().toString(),
    },
  })
}

// IMEI设置接口
interface SetImeiResponse {
  result: string
}

/**
 * 设置IMEI
 * @param imeiString IMEI号码
 */
export const setImei = (imeiString: string) => {
  return postProc<SetImeiResponse>('ALK_WRITE_IMEI', { imei_string: imeiString })
}

// 快速开机设置查询接口
interface GetFastBootResponse {
  mgmt_quicken_power_on: string
  need_hard_reboot: string
  need_sim_pin: string
}

/**
 * 查询快速开机设置
 */
export const getFastBootSettings = () => {
  return request.get<GetFastBootResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'mgmt_quicken_power_on,need_hard_reboot,need_sim_pin',
      multi_data: '1',
      _: Date.now().toString(),
    },
  })
}

// 快速开机设置提交接口
interface SetFastBootResponse {
  result: string
}

/**
 * 设置快速开机
 * @param enabled 是否启用快速开机
 */
export const setFastBoot = (enabled: string) => {
  return postProc<SetFastBootResponse>('MGMT_CONTROL_POWER_ON_SPEED', {
    mgmt_quicken_power_on: enabled,
  })
}

// SNTP设置查询接口
interface GetSntpResponse {
  sntp_year: string
  sntp_month: string
  sntp_day: string
  sntp_hour: string
  sntp_minute: string
  sntp_second: string
  sntp_time_set_mode: string
  sntp_static_server0: string
  sntp_static_server1: string
  sntp_static_server2: string
  sntp_server0: string
  sntp_server1: string
  sntp_server2: string
  sntp_server3: string
  sntp_server4: string
  sntp_server5: string
  sntp_server6: string
  sntp_server7: string
  sntp_server8: string
  sntp_server9: string
  sntp_other_server0: string
  sntp_other_server1: string
  sntp_other_server2: string
  sntp_timezone: string
  sntp_timezone_index: string
  sntp_dst_enable: string
  ppp_status: string
  sntp_process_result: string
  rj45_state: string
}

/**
 * 查询SNTP设置
 */
export const getSntpSettings = () => {
  const cmd =
    'sntp_year,sntp_month,sntp_day,sntp_hour,sntp_minute,sntp_second,sntp_time_set_mode,sntp_static_server0,sntp_static_server1,sntp_static_server2,sntp_server0,sntp_server1,sntp_server2,sntp_server3,sntp_server4,sntp_server5,sntp_server6,sntp_server7,sntp_server8,sntp_server9,sntp_other_server0,sntp_other_server1,sntp_other_server2,sntp_timezone,sntp_timezone_index,sntp_dst_enable,ppp_status,sntp_process_result,rj45_state'
  return request.get<GetSntpResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd,
      multi_data: '1',
      _: Date.now().toString(),
    },
  })
}

// SNTP设置提交接口
interface SetSntpResponse {
  result: string
}

interface SetSntpParams extends Record<string, string | undefined> {
  manualsettime: string
  sntp_server1_ip: string
  sntp_server2_ip: string
  sntp_server3_ip: string
  sntp_other_server0?: string
  sntp_other_server1?: string
  sntp_other_server2?: string
  timezone: string
  sntp_timezone_index: string
  DaylightEnabled: string
  time_year?: string
  time_month?: string
  time_day?: string
  time_hour?: string
  time_minute?: string
}

/**
 * 设置SNTP
 * @param params SNTP参数
 */
export const setSntp = (params: SetSntpParams) => {
  return postProc<SetSntpResponse>('SNTP', params)
}

// SIM卡选择查询接口
interface GetSimSelectResponse {
  alk_sim_select: string
}

/**
 * 查询SIM卡选择
 */
export const getSimSelect = () => {
  return request.get<GetSimSelectResponse>('/reqproc/proc_get', {
    headers: jsonHeaders,
    queryParams: {
      cmd: 'alk_sim_select',
      _: Date.now().toString(),
    },
  })
}

// SIM卡选择提交接口
interface SetSimSelectResponse {
  result: string
}

/**
 * 设置SIM卡选择
 * @param simSelect SIM卡选择值
 */
export const setSimSelect = (simSelect: string) => {
  return postProc<SetSimSelectResponse>('ALK_SIM_SELECT', { sim_select: simSelect })
}

// 关机接口
interface ShutdownResponse {
  result: string
}

/**
 * 关机
 */
export const shutdownDevice = () => {
  return postProc<ShutdownResponse>('TURN_OFF_DEVICE')
}

// 重启接口（不返回响应）
export const rebootDevice = () => {
  return request.post('/reqproc/proc_post', 'goformId=REBOOT_DEVICE', { headers: commonHeaders })
}

// 恢复出厂设置接口
interface RestoreFactoryResponse {
  result: string
}

/**
 * 恢复出厂设置
 */
export const restoreFactory = () => {
  return postProc<RestoreFactoryResponse>('RESTORE_FACTORY_SETTINGS')
}

// 修改密码接口
interface ChangePasswordResponse {
  result: string
}

/**
 * 修改密码
 * @param oldPassword 旧密码（需base64编码）
 * @param newPassword 新密码（需base64编码）
 */
export const changePassword = (oldPassword: string, newPassword: string) => {
  return postProc<ChangePasswordResponse>('CHANGE_PASSWORD', {
    oldPassword,
    newPassword,
  })
}
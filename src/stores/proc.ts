import { getBasicInfo, connect, disconnect } from '@/api/basic.api'
import { defineStore } from 'pinia'

// 设备信息命令列表
const cmdList = [
  {
    name: 'loginfo',
    active: true,
    desc: '登录状态',
  },
  {
    name: 'ppp_status',
    active: true,
    desc: 'ppp状态',
    egValue: 'ppp_disconnected',
  },
  {
    name: 'realtime_rx_bytes',
    active: true,
    desc: '实时接收字节数',
  },
  {
    name: 'realtime_tx_bytes',
    active: true,
    desc: '实时发送字节数',
  },
  {
    name: 'battery_charging',
    active: true,
    desc: '电池充电状态 1:充电中',
  },
  {
    name: 'battery_vol_percent',
    active: true,
    desc: '电池电压百分比，不是所有机型都有此功能',
  },
  {
    name: 'battery_pers',
    active: true,
    desc: '电池格数，满电4格',
  },
  {
    name: 'sta_count',
    active: true,
    desc: '终端接入数量',
  },
  {
    name: 'ziccid',
    active: true,
    desc: 'ZICCID，可用于判断sim卡是否插入',
  },
  {
    name: 'network_provider',
    active: true,
    desc: '运营商名称',
  },
  {
    name: 'rssi',
    active: true,
    desc: '信号强度',
  },
  {
    name: 'lte_rsrp',
    active: true,
    desc: 'LTE RSRP',
  },
  {
    name: 'imei',
    active: true,
    desc: 'IMEI',
  },
  {
    name: 'imsi',
    active: true,
    desc: 'IMSI',
  },
  {
    name: 'sim_imsi',
    active: true,
    desc: 'SIM卡IMSI',
  },
  {
    name: 'modem_main_state',
    active: true,
    desc: 'sim卡无效时示例值：modem_sim_undetected',
  },
  {
    name: 'ssid',
    active: true,
    desc: 'WiFi名称',
  },
  {
    name: 'SSID1',
    active: true,
    desc: 'WiFi名称1',
  },
  {
    name: 'lte_band',
    active: true,
    desc: 'LTE频段',
  },
  {
    name: 'MAX_Access_num',
    active: true,
    desc: '最大连接数',
  },
  {
    name: 'wifi_coverage',
    active: true,
    desc: 'WiFi覆盖范围(功率)，short_mode，medium_mode，long_mode',
  },
  {
    name: 'lan_ipaddr',
    active: true,
    desc: '局域网IP地址',
  },
  {
    name: 'wan_ipaddr',
    active: true,
    desc: 'WAN IP地址',
  },
  {
    name: 'cr_version',
    active: true,
    desc: '软件版本',
  },
  {
    name: 'hw_version',
    active: true,
    desc: '硬件版本',
  },
  // ----------定时休眠唤醒设置------------
  // openEnable,closeEnable,openTime,closeTime
  {
    name: 'openEnable',
    active: true,
    desc: '是否开启定时休眠唤醒',
  },
  {
    name: 'closeEnable',
    active: true,
    desc: '是否开启定时休眠唤醒',
  },
  {
    name: 'openTime',
    active: true,
    desc: '定时休眠唤醒时间',
  },
  {
    name: 'closeTime',
    active: true,
    desc: '定时休眠唤醒时间',
  },
  // -------------------------
  // wifi休眠设置
  {
    name: 'Sleep_interval',
    active: true,
    desc: 'WiFi休眠时间',
  },
]

/**
 * 设备信息状态管理
 */
export const useProcStore = defineStore('proc', {
  state: () => ({
    // 设备信息,声明为any
    proc: {} as any,
    loginfo: '',
    lanStationList: [] as any[],
    lastTxBytes: 0, // 上次发送字节数
    lastRxBytes: 0, // 上次接收字节数
    currentTxSpeed: 0, // 当前发送速度
    currentRxSpeed: 0, // 当前接收速度

    routerInfo: {} as any,
  }),
  actions: {
    // 更新设备信息
    async updateProc(info?: any) {
      // this.proc = info
      const cmd = cmdList
        .filter((item) => item.active)
        .map((item) => item.name)
        .join(',')
      const res = await getBasicInfo(cmd)
      this.proc = res.data
    },
    // 更新登录状态
    async updateLoginStatus() {
      // this.loginStatus = status
      const res = await getBasicInfo('loginfo')
      this.loginfo = res.data.loginfo
    },
    // 更新局域网有线终端列表
    async updateLanStationList() {
      const res = await getBasicInfo('lan_station_list', true)
      this.lanStationList = res.data.lan_station_list || []
    },
    async connectNetwork() {
      const res = await connect()
      if (res.data.result === 'success') {
        this.proc.ppp_status = 'ppp_connected'
      }
    },
    async disconnectNetwork() {
      const res = await disconnect()
      if (res.data.result === 'success') {
        this.proc.ppp_status = 'ppp_disconnected'
      }
    },

    // 更新路由信息
    async updateRouterInfo() {
      const res = await getBasicInfo(
        'lan_ipaddr,lan_netmask,mac_address,dhcpEnabled,dhcpStart,dhcpEnd,dhcpLease_hour',
      )
      this.routerInfo = res.data
    },
  },
})

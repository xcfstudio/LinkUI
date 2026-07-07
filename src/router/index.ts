import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('@/views/login.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login.vue'),
    },
    {
      path: '/deviceInfo',
      name: 'deviceInfo',
      component: () => import('@/views/deviceInfo.vue'),
    },
    {
      path: '/advancedSettings',
      name: 'advancedSettings',
      component: () => import('@/views/advancedSettings/index.vue'),
      children: [
        {
          path: '/advancedSettings/',
          redirect: '/advancedSettings/mainSsid',
        },
        {
          path: '/advancedSettings/mainSsid',
          name: 'mainSsid',
          component: () => import('@/views/advancedSettings/mainSsid.vue'),
        },
        {
          path: '/advancedSettings/subSsid',
          name: 'subSsid',
          component: () => import('@/views/advancedSettings/subSsid.vue'),
        },
        {
          path: '/advancedSettings/wps',
          name: 'wps',
          component: () => import('@/views/advancedSettings/wps.vue'),
        },
        {
          path: '/advancedSettings/wifiAdvanced',
          name: 'wifiAdvanced',
          component: () => import('@/views/advancedSettings/wifiAdvanced.vue'),
        },
        {
          path: '/advancedSettings/macFilter',
          name: 'macFilter',
          component: () => import('@/views/advancedSettings/macFilter.vue'),
        },
        {
          path: '/advancedSettings/connectMode',
          name: 'connectMode',
          component: () => import('@/views/advancedSettings/connectMode.vue'),
        },
        {
          path: '/advancedSettings/networkSearch',
          name: 'networkSearch',
          component: () => import('@/views/advancedSettings/networkSearch.vue'),
        },
        {
          path: '/advancedSettings/apnSettings',
          name: 'apnSettings',
          component: () => import('@/views/advancedSettings/apnSettings.vue'),
        },
        {
          path: '/advancedSettings/power',
          name: 'power',
          component: () => import('@/views/advancedSettings/power.vue'),
        },
        {
          path: '/advancedSettings/router',
          name: 'router',
          component: () => import('@/views/advancedSettings/router.vue'),
        },
        {
          path: '/advancedSettings/portFilter',
          name: 'portFilter',
          component: () => import('@/views/advancedSettings/portFilter.vue'),
        },
        {
          path: '/advancedSettings/portMapping',
          name: 'portMapping',
          component: () => import('@/views/advancedSettings/portMapping.vue'),
        },
        {
          path: '/advancedSettings/virtualServer',
          name: 'virtualServer',
          component: () => import('@/views/advancedSettings/virtualServer.vue'),
        },
        {
          path: '/advancedSettings/urlFilter',
          name: 'urlFilter',
          component: () => import('@/views/advancedSettings/urlFilter.vue'),
        },
        {
          path: '/advancedSettings/upnp',
          name: 'upnp',
          component: () => import('@/views/advancedSettings/upnp.vue'),
        },
        {
          path: '/advancedSettings/dmz',
          name: 'dmz',
          component: () => import('@/views/advancedSettings/dmz.vue'),
        },
        {
          path: '/advancedSettings/band',
          name: 'band',
          component: () => import('@/views/advancedSettings/band.vue'),
        },
        {
          path: '/advancedSettings/baseband',
          name: 'baseband',
          component: () => import('@/views/advancedSettings/baseband.vue'),
        },
        {
          path: '/advancedSettings/other',
          name: 'other',
          component: () => import('@/views/advancedSettings/other.vue'),
        },
      ],
    },
  ],
})

export default router

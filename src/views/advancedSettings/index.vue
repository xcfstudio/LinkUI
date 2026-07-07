<template>
  <div class="con">
    <div class="advanced-settings">
      <aside class="sidebar" :class="{ 'drawer-open': isDrawerOpen }">
        <div class="drawer-mask" v-if="isDrawerOpen" @click="toggleDrawer"></div>
        <div class="drawer-content">
          <nav class="nav-list">
            <li v-for="item in menuList" :key="item.path || item.name" class="menu-item">
              <span
                class="nav-item"
                :class="{
                  'has-child': item.child && item.child.length > 0,
                  active: isMenuActive(item.path) || isSubMenuActive(item),
                }"
                @click="handleMenuClick(item)"
              >
                <span class="icon"><i class="iconfont" v-html="item.icon"></i></span>
                <span class="menu-text">{{ item.name }}</span>
                <span v-if="item.child && item.child.length > 0" class="expand-icon">
                  <i class="iconfont" :class="{ expanded: expandedMenus.includes(item.name) }"
                    >&#xe653;</i
                  >
                </span>
              </span>
              <ul
                v-if="item.child && item.child.length > 0"
                class="sub-menu"
                :class="{ show: expandedMenus.includes(item.name) }"
              >
                <li v-for="subItem in item.child" :key="subItem.path" class="sub-item">
                  <span
                    class="sub-nav-item"
                    :class="{ active: isMenuActive(subItem.path) }"
                    @click="handleSubMenuClick(subItem)"
                    >{{ subItem.name }}</span
                  >
                </li>
              </ul>
            </li>
          </nav>
        </div>
      </aside>
      <main class="content">
        <router-view></router-view>
      </main>
    </div>
    <button class="drawer-toggle" @click="toggleDrawer">
      <i class="iconfont">{{ isDrawerOpen ? '&#xe835;' : '&#xe834;' }}</i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const expandedMenus = ref<string[]>([])
const isDrawerOpen = ref(true)

const toggleDrawer = () => {
  isDrawerOpen.value = !isDrawerOpen.value
}

const handleMenuClick = (item: any) => {
  if (item.child && item.child.length > 0) {
    const index = expandedMenus.value.indexOf(item.name)
    if (index > -1) {
      expandedMenus.value.splice(index, 1)
    } else {
      expandedMenus.value.push(item.name)
    }
  } else if (item.path) {
    router.push(item.path)
    isDrawerOpen.value = false
  }
}

const handleSubMenuClick = (subItem: any) => {
  if (subItem.path) {
    router.push(subItem.path)
    isDrawerOpen.value = false
  }
}

const isMenuActive = (path: string) => {
  return route.path === path
}

const isSubMenuActive = (item: { child?: { path: string }[] }) => {
  if (item.child && item.child.length > 0) {
    return item.child.some((subItem: { path: string }) => route.path === subItem.path)
  }
  return false
}

onMounted(() => {
  menuList.forEach((item) => {
    if (isSubMenuActive(item)) {
      expandedMenus.value.push(item.name)
    }
  })
})

// 上级路由
const parentPath = '/advancedSettings'

const menuList = [
  {
    name: 'WIFI设置',
    path: '',
    icon: '&#xe76c;',
    child: [
      {
        name: '主SSID',
        path: `${parentPath}/mainSsid`,
      },
      {
        name: '副SSID',
        path: `${parentPath}/subSsid`,
      },
      {
        name: 'WPS',
        path: `${parentPath}/wps`,
      },
      {
        name: '高级设置',
        path: `${parentPath}/wifiAdvanced`,
      },
      {
        name: '无线mac过滤',
        path: `${parentPath}/macFilter`,
      },
    ],
  },
  {
    name: 'LTE设置',
    path: '',
    icon: '&#xe885;',
    child: [
      {
        name: '连接模式',
        path: `${parentPath}/connectMode`,
      },
      {
        name: '找网方式',
        path: `${parentPath}/networkSearch`,
      },
      {
        name: 'APN设置',
        path: `${parentPath}/apnSettings`,
      },
    ],
  },
  {
    name: '电源管理',
    path: `${parentPath}/power`,
    icon: '&#xea32;',
  },
  {
    name: '路由设置',
    path: `${parentPath}/router`,
    icon: '&#xe832;',
  },
  {
    name: '防火墙设置',
    path: '',
    icon: '&#xe6b9;',
    child: [
      {
        name: '端口过滤',
        path: `${parentPath}/portFilter`,
      },
      {
        name: '端口映射',
        path: `${parentPath}/portMapping`,
      },
      {
        name: '端口转发',
        path: `${parentPath}/virtualServer`,
      },
      {
        name: 'URL过滤',
        path: `${parentPath}/urlFilter`,
      },
      {
        name: 'UPnP设置',
        path: `${parentPath}/upnp`,
      },
      {
        name: 'DMZ设置',
        path: `${parentPath}/dmz`,
      },
    ],
  },
  {
    name: '频段设置',
    path: `${parentPath}/band`,
    icon: '&#xe6c2;',
  },
  {
    name: '基带设置',
    path: `${parentPath}/baseband`,
    icon: '&#xe652;',
  },
  {
    name: '其他设置',
    path: `${parentPath}/other`,
    icon: '&#xe692;',
  },
]
</script>

<style scoped lang="scss">
.con {
  width: 100%;
  min-height: 80vh;
  background-color: var(--bg-secondary);

  .advanced-settings {
    display: flex;
    height: calc(100vh - 60px);
    padding-top: 60px;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-xl, 16px) var(--radius-xl, 16px) 0 0;
    box-shadow: var(--shadow-lg);
    overflow: hidden;

    .sidebar {
      position: relative;
      padding-top: 20px;
      flex-shrink: 0;
      width: 220px;
      background-color: var(--bg-secondary);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
      z-index: 10;

      .drawer-mask {
        display: none;
      }

      .drawer-content {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
          display: none;
        }
      }

      .nav-list {
        padding: 16px 0;
        margin: 0;
        list-style: none;
        flex: 1;

        .menu-item {
          margin-bottom: 4px;

          .nav-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px 12px 24px;
            font-size: 15px;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.25s ease;
            border-left: 3px solid transparent;

            .icon {
              display: flex;
              align-items: center;
              margin-right: 10px;
              font-size: 16px;
              color: var(--text-tertiary);
              transition: color 0.5s ease;

              i {
                font-size: 20px;
              }
            }

            .menu-text {
              flex: 1;
            }

            .expand-icon {
              font-size: 14px;
              color: var(--text-tertiary);
              transition: all 0.3s linear;
              transform: rotate(-90deg);

              i.expanded {
                transform: rotate(0deg);
              }
            }

            &.has-child:hover {
              background-color: rgba(var(--primary-500), 0.08);
              color: var(--primary-600);
              border-left-color: var(--primary-400);

              .icon,
              .expand-icon {
                color: var(--primary-500);
              }
            }

            &:not(.has-child):hover {
              background-color: rgba(var(--primary-500), 0.08);
              color: var(--primary-600);
              border-left-color: var(--primary-400);

              .icon {
                color: var(--primary-500);
              }
            }

            &.active {
              background-color: rgba(var(--primary-500), 0.1);
              color: var(--primary-600);
              border-left-color: var(--primary-500);

              .icon,
              .expand-icon {
                color: var(--primary-500);
              }
            }
          }

          .sub-menu {
            margin: 0;
            padding: 0;
            list-style: none;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transform: translateY(-10px);
            transition:
              max-height 0.3s linear,
              opacity 0.3s linear,
              transform 0.3s linear;
            background-color: rgba(0, 0, 0, 0.02);

            &.show {
              max-height: 300px;
              opacity: 1;
              transform: translateY(0);
            }

            .sub-item {
              .sub-nav-item {
                display: block;
                padding: 10px 16px 10px 56px;
                font-size: 14px;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.3s linear;

                &:hover {
                  background-color: rgba(var(--primary-500), 0.1);
                  color: var(--primary-600);
                }

                &.active {
                  background-color: rgba(var(--primary-500), 0.15);
                  color: var(--primary-600);
                  font-weight: 500;
                }
              }
            }
          }
        }
      }
    }

    .content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
      background-color: var(--bg-card-secondary);
    }
  }

  .drawer-toggle {
    display: none;
  }

  @media (max-width: 768px) {
    .advanced-settings {
      border-radius: 0;
      height: calc(100vh - 60px);

      .sidebar {
        position: fixed;
        top: 60px;
        left: 0;
        height: calc(100vh - 60px);
        width: 190px;
        transform: translateX(-100%);
        box-shadow: var(--shadow-lg);
        z-index: 100;

        &.drawer-open {
          transform: translateX(0);

          .drawer-mask {
            display: block;
            position: fixed;
            top: 0;
            left: 260px;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: -1;
          }
        }

        .drawer-content {
          height: 100%;
          overflow-y: auto;
        }
      }

      .content {
        padding: 16px;
      }
    }

    .drawer-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      bottom: 84px;
      right: 24px;
      width: 56px;
      height: 56px;
      background-color: var(--primary-500);
      color: #ffffff;
      border: none;
      border-radius: 50%;
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      z-index: 9999;
      transition: all 0.3s ease;

      i {
        font-size: 24px;
      }

      &:hover {
        background-color: var(--primary-600);
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}
</style>
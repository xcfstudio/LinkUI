<template>
  <div class="url-filter-page">
    <div class="module">
      <h2 class="module-title">URL过滤设置</h2>
      <div class="module-content">
        <div class="url-input-row">
          <div class="form-item url-input-item">
            <label class="form-label">
              URL
              <span class="required">*</span>
            </label>
            <LInput v-model="urlInput" placeholder="请输入URL" />
          </div>
          <div class="url-action-wrapper">
            <LButton type="primary" @click="addUrlFilter">应用</LButton>
          </div>
        </div>

        <div class="table-wrapper">
          <div v-if="isLoading" class="loading-overlay">
            <span class="loading-text">加载中...</span>
          </div>
          <LTable v-show="!isLoading" :columns="urlColumns" :data="urlFilterList" bordered />
          <div v-if="!isLoading && urlFilterList.length === 0" class="empty-state">
            <span class="empty-text">暂无URL过滤规则</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h, onMounted } from 'vue'
import { LButton, LInput, LTable, LMessage } from '@/components'
import { postProc } from '@/api/basic.api'
import request from '@/utils/request'

const urlInput = ref('')
const isLoading = ref(false)

const urlColumns = [
  { prop: 'url', label: 'URL', align: 'left' as const },
  {
    prop: 'action',
    label: '操作',
    align: 'center' as const,
    width: '80px',
    render: (_row: Record<string, unknown>, index: number) =>
      h(
        'button',
        {
          class: 'delete-btn',
          onClick: () => deleteUrlFilter(index),
        },
        '删除',
      ),
  },
]

interface UrlFilterItem {
  id: number
  url: string
  action: string
}

const urlFilterList = reactive<UrlFilterItem[]>([])

const loadUrlFilters = async () => {
  isLoading.value = true
  try {
    const res = await request.get('/reqproc/proc_get', {
      headers: {
        Pragma: 'no-cache',
        'X-Requested-With': 'XMLHttpRequest',
      },
      queryParams: {
        cmd: 'websURLFilters',
        _: Date.now().toString(),
      },
    })

    urlFilterList.splice(0, urlFilterList.length)

    const filters = res.data.websURLFilters || ''
    if (filters) {
      const urlArray = filters.split(';').filter((url: string) => url.trim())
      urlArray.forEach((url: string, index: number) => {
        urlFilterList.push({
          id: index,
          url: url.trim(),
          action: '',
        })
      })
    }
  } catch (error) {
    console.error('加载URL过滤规则失败:', error)
    LMessage.error('加载URL过滤规则失败')
  } finally {
    isLoading.value = false
  }
}

const addUrlFilter = async () => {
  if (!urlInput.value.trim()) {
    LMessage.error('请输入URL')
    return
  }

  isLoading.value = true
  try {
    const params: Record<string, string> = {
      addURLFilter: urlInput.value.trim(),
    }

    const res = await postProc('URL_FILTER_ADD', params)

    if (res.data.result === 'success') {
      LMessage.success('URL过滤规则已添加')
      urlInput.value = ''
      await loadUrlFilters()
    } else {
      LMessage.error('添加失败')
    }
  } catch (error) {
    console.error('添加URL过滤规则失败:', error)
    LMessage.error('添加URL过滤规则失败')
  } finally {
    isLoading.value = false
  }
}

const deleteUrlFilter = async (index: number) => {
  const item = urlFilterList[index]
  if (!item) return

  isLoading.value = true
  try {
    const params: Record<string, string> = {
      url_filter_delete_id: `${item.id};`,
    }

    const res = await postProc('URL_FILTER_DELETE', params)

    if (res.data.result === 'success') {
      urlFilterList.splice(index, 1)
      LMessage.success('URL过滤规则已删除')
    } else {
      LMessage.error('删除失败')
    }
  } catch (error) {
    console.error('删除URL过滤规则失败:', error)
    LMessage.error('删除URL过滤规则失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUrlFilters()
})
</script>

<style lang="scss" scoped>
.url-filter-page {
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

.url-input-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
}

.url-input-item {
  flex: 1;
}

.url-action-wrapper {
  @media (max-width: 768px) {
    width: 100%;
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
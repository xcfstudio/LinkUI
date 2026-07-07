<script setup lang="ts">
import { computed } from 'vue'

interface Column {
  prop: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (row: Record<string, unknown>, index: number) => unknown
}

interface Props {
  columns: Column[]
  data: Record<string, unknown>[]
  bordered?: boolean
  striped?: boolean
  hoverable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  bordered: true,
  striped: true,
  hoverable: true,
})

const tableClass = computed(() => ({
  'l-table': true,
  'l-table--bordered': props.bordered,
  'l-table--striped': props.striped,
  'l-table--hoverable': props.hoverable,
}))
</script>

<template>
  <div class="l-table-wrapper">
    <table :class="tableClass">
      <thead>
        <tr style="height: 45px; color: var(--text-primary)">
          <th
            v-for="column in columns"
            :key="column.prop"
            :style="{ width: column.width, padding: '5px 16px' }"
            :class="{
              'l-table__th--left': column.align === 'left',
              'l-table__th--center': column.align === 'center',
              'l-table__th--right': column.align === 'right',
            }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="data.length === 0" class="l-table__empty-row">
          <td :colspan="columns.length" class="l-table__empty-cell">暂无数据</td>
        </tr>
        <tr
          v-else
          v-for="(row, rowIndex) in data"
          :key="rowIndex"
          :class="{ 'l-table__row--striped': striped && rowIndex % 2 === 1 }"
          style="height: 45px; color: var(--text-secondary)"
        >
          <td
            v-for="column in columns"
            :key="column.prop"
            :class="{
              'l-table__td--left': column.align === 'left',
              'l-table__td--center': column.align === 'center',
              'l-table__td--right': column.align === 'right',
            }"
            :style="{ padding: '5px 16px' }"
          >
            <template v-if="column.render">
              <component :is="column.render(row, rowIndex)" />
            </template>
            <template v-else>
              {{ row[column.prop] }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.l-table-wrapper {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}

.l-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.l-table--bordered {
  border: 1px solid var(--border-color);
}

.l-table thead {
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-card) 100%);
}

.l-table__th {
  padding: 20px 16px;
  text-align: left;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
  border-bottom: 2px solid var(--border-color);
  white-space: nowrap;

  &--left {
    text-align: left;
  }

  &--center {
    text-align: center;
  }

  &--right {
    text-align: right;
  }
}

.l-table__td {
  padding: 22px 16px;
  color: var(--text-primary);
  font-size: 14px;
  border-bottom: 1px solid var(--border-color);
  white-space: nowrap;

  &--left {
    text-align: left;
  }

  &--center {
    text-align: center;
  }

  &--right {
    text-align: right;
  }
}

.l-table__row {
  transition: all 0.25s ease;
  border-radius: var(--radius-sm);
  margin: 4px 0;

  &--striped {
    background-color: var(--bg-secondary);
  }
}

.l-table--hoverable .l-table__row:hover {
  background-color: var(--primary-50);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.l-table tbody tr:last-child td {
  border-bottom: none;
}

.l-table thead th:first-child {
  border-radius: var(--radius-md) 0 0 0;
}

.l-table thead th:last-child {
  border-radius: 0 var(--radius-md) 0 0;
}

.l-table tbody tr:last-child td:first-child {
  border-radius: 0 0 0 var(--radius-md);
}

.l-table tbody tr:last-child td:last-child {
  border-radius: 0 0 var(--radius-md) 0;
}

.l-table__empty-row {
  height: 50px;
}

.l-table__empty-cell {
  text-align: center;
  color: var(--text-primary);
  font-size: 14px;
  padding: 20px;
}
</style>

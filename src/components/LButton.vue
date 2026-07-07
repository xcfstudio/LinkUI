<template>
  <button :class="buttonClass" :disabled="disabled || loading" @click="handleClick">
    <span v-if="loading" class="l-btn-loading">
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
      <span class="loading-dot"></span>
    </span>
    <span v-else-if="icon" class="l-btn-icon">{{ icon }}</span>
    <span class="l-btn-text"><slot></slot></span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'primary' | 'plain' | 'warning' | 'danger' | 'success' | 'info' | 'default'
  size?: 'lg' | 'md' | 'sm'
  icon?: string
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'md',
  icon: '',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const buttonClass = computed(() => [
  'l-btn',
  `l-btn--${props.type}`,
  `l-btn--${props.size}`,
  {
    'l-btn--disabled': props.disabled || props.loading,
    'l-btn--loading': props.loading,
  },
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style lang="scss" scoped>
/**
 * LButton 样式 - 精简版按钮组件
 * 适配嵌入式系统极小存储空间需求
 */

.l-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  font-weight: 500;
  white-space: nowrap;
  -webkit-appearance: none;
  appearance: none;
  box-sizing: border-box;
  line-height: 1.4;
  min-width: 45px;

  // 尺寸大小
  &--lg {
    padding: 10px 20px;
    font-size: 14px;
    gap: 8px;
    min-width: 80px;
  }

  &--md {
    padding: 8px 16px;
    font-size: 13px;
    gap: 6px;
    min-width: 70px;
  }

  &--sm {
    padding: 100px 12px;
    font-size: 12px;
    gap: 4px;
    min-width: 60px;
  }

  // 默认样式
  &--default {
    background: #f5f5f5;
    color: #666;
    &:hover:not(:disabled) {
      background: #e8e8e8;
    }
    &:active:not(:disabled) {
      background: #dcdcdc;
    }
  }

  // 主按钮
  &--primary {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    }
    &:active:not(:disabled) {
      box-shadow: 0 1px 4px rgba(14, 165, 233, 0.3);
    }
  }

  // 朴素按钮
  &--plain {
    background: transparent;
    color: #0ea5e9;
    border: 1px solid #0ea5e9;
    &:hover:not(:disabled) {
      background: rgba(14, 165, 233, 0.1);
    }
    &:active:not(:disabled) {
      background: rgba(14, 165, 233, 0.2);
    }
  }

  // 警告按钮
  &--warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    }
  }

  // 危险按钮
  &--danger {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
    }
  }

  // 成功按钮
  &--success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #4ade80 0%, #22c55e 0%, #16a34a 100%);
    }
  }

  // 信息按钮
  &--info {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    }
  }

  // 禁用状态
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // 加载状态
  &--loading {
    pointer-events: none;
  }
}

// 图标区域
.l-btn-icon {
  font-size: 14px;
}

// 文字区域
.l-btn-text {
  line-height: 1.4;
}

// 加载动画
.l-btn-loading {
  display: inline-flex;
  gap: 4px;
  .loading-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: loading-bounce 1.4s infinite ease-in-out both;
    &:nth-child(1) {
      animation-delay: -0.32s;
    }
    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

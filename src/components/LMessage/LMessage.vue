<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="visible" class="l-message" :class="[`l-message--${type}`]">
        <span class="l-message-icon">
          <i class="iconfont">{{ icon }}</i>
        </span>
        <span class="l-message-content">{{ message }}</span>
        <button v-if="closable" class="l-message-close" @click="handleClose">
          <span>×</span>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

interface Props {
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  duration?: number
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
  closable: false,
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const visible = ref(false)

const icon = computed(() => {
  const icons: Record<string, string> = {
    success: '\ue7e2',
    warning: '\ue7de',
    error: '\ue7e1',
    info: '\ue7dc',
  }
  return icons[props.type] || icons.info
})

const handleClose = () => {
  visible.value = false
  emit('close')
}

onMounted(() => {
  visible.value = true
  if (props.duration > 0) {
    setTimeout(() => {
      handleClose()
    }, props.duration)
  }
})

watch(
  () => props.message,
  () => {
    visible.value = true
    if (props.duration > 0) {
      setTimeout(() => {
        handleClose()
      }, props.duration)
    }
  },
)
</script>

<style lang="scss" scoped>
/**
 * LMessage 样式 - 精简版消息提示组件
 * 适配嵌入式系统极小存储空间需求
 * 支持明亮/黑暗两种模式
 */

.l-message {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 12px);
  background: var(--bg-secondary-opacity-60, rgba(255, 255, 255, 0.8));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 2000;
  min-width: 280px;
  max-width: 480px;

  // 成功类型
  &--success {
    // border: 1px solid var(--success-500, #22c55e);
    .l-message-icon {
      color: var(--success-500, #22c55e);
    }
  }

  // 警告类型
  &--warning {
    // border: 1px solid var(--warning-500, #f59e0b);
    .l-message-icon {
      color: var(--warning-500, #f59e0b);
    }
  }

  // 错误类型
  &--error {
    // border: 1px solid var(--danger-500, #ef4444);
    .l-message-icon {
      color: var(--danger-500, #ef4444);
    }
  }

  // 信息类型
  &--info {
    // border: 1px solid var(--primary-500, #0ea5e9);
    .l-message-icon {
      color: var(--primary-500, #0ea5e9);
    }
  }
}

.l-message-icon {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.l-message-content {
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary, #111827);
  line-height: 1.5;
}

.l-message-close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  font-size: 18px;
  color: var(--text-tertiary, #9ca3af);
  transition: all 0.2s;

  &:hover {
    background: var(--gray-100, #f3f4f6);
    color: var(--text-secondary, #6b7280);
  }
}

// 过渡动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px);
}
</style>

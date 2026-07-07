<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="visible" class="l-dialog-mask" @click.self="handleClose">
        <Transition name="scale">
          <div v-if="visible" class="l-dialog">
            <!-- 头部区域 -->
            <div v-if="showHeader" class="l-dialog-header">
              <slot name="header">
                <span class="l-dialog-title">{{ title }}</span>
              </slot>
              <button v-if="closable" class="l-dialog-close" @click="handleClose">
                <span class="close-icon">×</span>
              </button>
            </div>
            <!-- 内容区域 -->
            <div class="l-dialog-body">
              <slot>
                <span v-if="message">{{ message }}</span>
              </slot>
            </div>
            <!-- 底部区域 -->
            <div v-if="showFooter" class="l-dialog-footer">
              <slot name="footer">
                <button class="l-dialog-btn l-dialog-btn--cancel" @click="handleCancel">
                  {{ cancelText }}
                </button>
                <button class="l-dialog-btn l-dialog-btn--confirm" @click="handleConfirm">
                  {{ confirmText }}
                </button>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title?: string
  message?: string
  closable?: boolean
  showHeader?: boolean
  showFooter?: boolean
  cancelText?: string
  confirmText?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  closable: true,
  showHeader: true,
  showFooter: true,
  cancelText: '取消',
  confirmText: '确认',
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('update:visible', false)
  emit('confirm')
}
</script>

<style lang="scss" scoped>
/**
 * LDialog 样式 - 精简版弹窗组件
 * 适配嵌入式系统极小存储空间需求
 * 支持明亮/黑暗两种模式
 */

// 遮罩层
.l-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

// 弹窗主体
.l-dialog {
  width: 100%;
  max-width: 420px;
  background: var(--bg-card, #ffffff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
  overflow: hidden;
  border: 1px solid var(--border-color, #e5e7eb);
}

// 头部区域
.l-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

.l-dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #111827);
}

.l-dialog-header :deep(*) {
  color: var(--text-primary, #111827);
}

.l-dialog-close {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;

  &:hover {
    background: var(--gray-200, #e5e7eb);
  }
}

.close-icon {
  font-size: 20px;
  color: var(--text-secondary, #6b7280);
  line-height: 1;
}

// 内容区域
.l-dialog-body {
  padding: 20px;
  color: var(--text-secondary, #6b7280);
  font-size: 14px;
  line-height: 1.6;
  background: var(--bg-card, #ffffff);
}

// 底部区域
.l-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color, #e5e7eb);
  background: var(--bg-secondary, #f9fafb);
}

// 按钮样式
.l-dialog-btn {
  padding: 8px 20px;
  border: none;
  border-radius: var(--radius-md, 6px);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &--cancel {
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-secondary, #6b7280);
    border: 1px solid var(--border-color, #e5e7eb);

    &:hover {
      background: var(--gray-200, #e5e7eb);
    }
  }

  &--confirm {
    background: linear-gradient(
      135deg,
      var(--primary-400, #38bdf8) 0%,
      var(--primary-600, #0284c7) 100%
    );
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);

    &:hover {
      background: linear-gradient(
        135deg,
        var(--primary-300, #7dd3fc) 0%,
        var(--primary-500, #0ea5e9) 100%
      );
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
    }

    &:active {
      box-shadow: 0 1px 4px rgba(14, 165, 233, 0.3);
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.25s ease;
}

.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

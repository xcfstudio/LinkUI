<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :class="['l-switch', { 'l-switch--checked': modelValue, 'l-switch--disabled': disabled }]"
    :disabled="disabled"
    @click="handleToggle"
  >
    <span class="l-switch__core">
      <span class="l-switch__thumb"></span>
    </span>
    <span v-if="showText" class="l-switch__label">
      <span v-if="modelValue">{{ activeText }}</span>
      <span v-else>{{ inactiveText }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  disabled?: boolean
  showText?: boolean
  activeText?: string
  inactiveText?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  showText: false,
  activeText: 'ON',
  inactiveText: 'OFF',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', value: boolean): void
}>()

const handleToggle = () => {
  if (props.disabled) return
  const newValue = !props.modelValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style lang="scss" scoped>
/**
 * LSwitch 样式 - 精简版开关组件
 * 适配嵌入式系统极小存储空间需求
 * 支持明亮/黑暗两种模式
 */

.l-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &__core {
    position: relative;
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: var(--gray-300, #d1d5db);
    transition: background 0.25s ease;

    .l-switch--checked & {
      background: var(--primary-500, #0ea5e9);
      box-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
    }
  }

  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #ffffff;
    transition: transform 0.25s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    .l-switch--checked & {
      transform: translateX(20px);
    }
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary, #6b7280);

    .l-switch--checked & {
      color: var(--primary-600, #0284c7);
    }
  }
}
</style>

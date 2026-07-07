<template>
  <label
    :class="['l-radio', { 'l-radio--checked': isChecked, 'l-radio--disabled': disabled }]"
    :disabled="disabled"
  >
    <span class="l-radio__input">
      <span class="l-radio__inner"></span>
      <input
        type="radio"
        :value="labelValue"
        :name="name"
        :disabled="disabled"
        :checked="isChecked"
        @change="handleChange"
        class="l-radio__original"
      />
    </span>
    <span v-if="$slots.default || label" class="l-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
/**
 * LRadio 单选框组件API文档
 * 用于在表单中选择一个选项，与其他单选框组中的选项互斥。
 * @param modelValue 选中的值，与 v-model 绑定。
 * @param label 单选框的标签文本。
 * @param disabled 是否禁用单选框。
 * @param name 单选框组的名称，用于绑定到表单数据。
 */

import { computed } from 'vue'

interface Props {
  modelValue: unknown
  label?: string | number | boolean
  disabled?: boolean
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
  name: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', value: unknown): void
}>()

const labelValue = computed(() => {
  return props.label !== '' ? props.label : props.modelValue
})

const isChecked = computed(() => {
  return props.modelValue === labelValue.value
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!props.disabled && target.checked) {
    emit('update:modelValue', labelValue.value)
    emit('change', labelValue.value)
  }
}
</script>

<style lang="scss" scoped>
.l-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &__input {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
  }

  &__inner {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid var(--border-color, #e5e7eb);
    border-radius: 50%;
    background: var(--bg-primary, #ffffff);
    transition: all 0.25s ease;
    box-sizing: border-box;

    .l-radio--checked & {
      border-color: var(--primary-500, #0ea5e9);
      background: var(--primary-500, #0ea5e9);
      box-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ffffff;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0);
      transition: all 0.25s ease;
    }

    .l-radio--checked &::after {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }

  &__original {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
  }

  &__label {
    font-size: 14px;
    color: var(--text-primary, #1f2937);
    transition: color 0.2s ease;

    .l-radio--checked & {
      color: var(--primary-600, #0284c7);
    }
  }
}
</style>

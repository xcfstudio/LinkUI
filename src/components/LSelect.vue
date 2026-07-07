<template>
  <div
    :class="['l-select', { 'l-select--open': isOpen, 'l-select--disabled': disabled }]"
    :disabled="disabled"
  >
    <div class="l-select__input" @click="toggleDropdown">
      <span class="l-select__placeholder" v-if="!selectedLabel">{{ placeholder }}</span>
      <span class="l-select__label" v-else>{{ selectedLabel }}</span>
      <span class="l-select__arrow">
        <i class="iconfont">&#xe653;</i>
      </span>
    </div>
    <ul v-show="isOpen" class="l-select__dropdown">
      <li
        v-for="(option, index) in options"
        :key="option.value != null ? String(option.value) : index"
        :class="{ 'l-select__item--selected': isSelected(option) }"
        @click="selectOption(option)"
      >
        {{ option.label || option.value }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  label?: string
  value: unknown
}

interface Props {
  modelValue: unknown
  options: Option[]
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: unknown): void
  (e: 'change', value: unknown): void
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue)
  return selected ? selected.label || selected.value : ''
})

const isSelected = (option: Option) => {
  return option.value === props.modelValue
}

const toggleDropdown = () => {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

const selectOption = (option: Option) => {
  emit('update:modelValue', option.value)
  emit('change', option.value)
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.l-select')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
/**
 * LSelect 样式 - 下拉选择组件
 * 模仿 Element Plus 风格，支持明亮/黑暗两种模式
 */

.l-select {
  position: relative;
  display: inline-block;
  min-width: 160px;
  cursor: pointer;
  user-select: none;

  &--disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &--open {
    .l-select__input {
      border-color: var(--primary-500, #0ea5e9);
      box-shadow: 0 0 8px rgba(14, 165, 233, 0.2);
    }

    .l-select__arrow {
      transform: rotate(180deg);
    }
  }

  &__input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: var(--radius-md, 8px);
    background: var(--bg-primary, #ffffff);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--primary-400, #38bdf8);
    }
  }

  &__placeholder {
    color: var(--text-tertiary, #9ca3af);
    font-size: 14px;
  }

  &__label {
    color: var(--text-primary, #1f2937);
    font-size: 14px;
  }

  &__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    color: var(--text-tertiary, #9ca3af);

    i {
      font-size: 14px;
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    min-width: 100%;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
    padding: 4px 0;
    list-style: none;
    background: var(--bg-primary, #ffffff);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: var(--radius-md, 8px);
    box-shadow: var(--shadow-md);
    z-index: 100;

    li {
      padding: 10px 14px;
      font-size: 14px;
      color: var(--text-primary, #1f2937);
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--primary-50, #f0f9ff);
      }
    }

    .l-select__item--selected {
      background: rgba(var(--primary-500), 0.1);
      color: var(--primary-600, #0284c7);
    }
  }
}
</style>
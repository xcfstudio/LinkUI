<template>
  <div
    class="l-input-wrapper"
    :class="[`l-input--${type}`, { 'l-input--disabled': disabled, 'l-input--error': error }]"
  >
    <slot name="prefix" />
    <input
      :type="inputType"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="l-input"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <slot name="suffix" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  type?: 'text' | 'password' | 'number' | 'email' | 'tel'
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const inputType = computed(() => {
  return props.type
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', target.value)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}
</script>

<style lang="scss" scoped>
.l-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 44px;
  background: var(--bg-card, #ffffff);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: var(--radius-md, 8px);
  transition: all 0.25s ease;

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;

    .l-input {
      cursor: not-allowed;
    }
  }

  &--error {
    border-color: var(--danger-500, #ef4444);
    background: rgba(239, 68, 68, 0.05);
  }

  &:focus-within {
    border-color: var(--primary-500, #0ea5e9);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
}

.l-input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--text-primary, #111827);

  &::placeholder {
    color: var(--text-tertiary, #9ca3af);
  }

  &:disabled {
    background: transparent;
  }
}
</style>

<!-- 登录页面 -->
<template>
  <div class="login-container">
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-icon">
          <span class="iconfont" style="font-size: 48px; color: var(--text-primary)">&#xe601;</span>
        </div>
        <h1 class="brand-title" style="color: var(--text-primary)">LinkUI</h1>
        <p class="brand-subtitle" style="color: var(--text-primary)">MIFI设备管理平台</p>
      </div>

      <!-- 登录表单 -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- 密码输入框 -->
        <div class="form-group">
          <label class="form-label">设备密码</label>
          <LInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入设备密码"
            :error="!!passwordError"
            @blur="validatePassword"
            style="
              background: var(--bg-secondary-opacity-40);
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
            "
          >
            <template #prefix>
              <span class="iconfont" style="font-size: 18px; color: var(--text-primary)"
                >&#xe7fb;</span
              >
            </template>
            <template #suffix>
              <span class="iconfont input-action" @click="togglePassword">
                {{ showPassword ? '&#xe603;' : '&#xe85c;' }}
              </span>
            </template>
          </LInput>
          <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
        </div>

        <!-- 登录按钮 -->
        <!-- <button type="submit" class="login-btn" :disabled="isLoading">
          <span v-if="isLoading" class="btn-loading">
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
            <span class="loading-dot"></span>
          </span>
          <span v-else>登录</span>
        </button> -->
        <LButton type="primary" size="lg" style="border-radius: 14px; height: 48px"> 登录 </LButton>
      </form>

      <!-- 底部提示 -->
      <div class="login-footer">
        <span class="footer-link" style="color: var(--text-primary)">默认密码：admin</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { login, getLoginFailInfo, getBasicInfo } from '@/api/basic.api'
import { LButton, LInput } from '@/components'
import { ref, reactive, onMounted } from 'vue'
import { useProcStore } from '@/stores/index.ts'

const procStore = useProcStore()

// 表单数据
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const passwordError = ref('')
const tryCount = ref('-')
const lockTime = ref('-')

// 表单验证规则
const rules = reactive({
  password: {
    required: true,
    minLength: 2,
    maxLength: 20,
  },
})

// 切换密码显示
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// 验证密码
const validatePassword = () => {
  const pwd = password.value.trim()

  if (!pwd) {
    passwordError.value = '请输入密码'
    return false
  }

  if (pwd.length < rules.password.minLength) {
    passwordError.value = `密码长度不能少于${rules.password.minLength}位`
    return false
  }

  if (pwd.length > rules.password.maxLength) {
    passwordError.value = `密码长度不能超过${rules.password.maxLength}位`
    return false
  }

  passwordError.value = ''
  return true
}

// 处理登录
const handleLogin = async () => {
  if (!validatePassword()) return

  isLoading.value = true

  try {
    // 发送登录请求
    const res = (await login(password.value)).data
    if (res.result === '0') {
      // 更新登录状态
      await procStore.updateLoginStatus()
      // 登录成功后跳转到首页
      window.location.href = '#/deviceInfo'

      return
    }
    if (res.result === '3') {
      // 密码错误
      const failInfo = (await getLoginFailInfo()).data
      tryCount.value = failInfo.psw_fail_num_str
      lockTime.value = failInfo.login_lock_time
      if (+tryCount.value > 0) {
        passwordError.value = `密码错误，还可尝试${tryCount.value}次`
      } else {
        passwordError.value = `账号已锁定，${lockTime.value}秒后重试`
      }
      return
    }
    if (res.result === '2') {
      // 数据错误
      passwordError.value = '数据错误，请联系管理员'
      return
    }
    if (res.result === '1') {
      // 账号已锁定
      const failInfo = (await getLoginFailInfo()).data
      lockTime.value = failInfo.login_lock_time
      passwordError.value = `账号已锁定，${lockTime.value}秒后重试`
    }
  } catch (error) {
    passwordError.value = '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
// 登录容器
.login-container {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%);
  position: relative;
  overflow: hidden;
  padding: 20px;
  padding-top: 150px;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.8;
  }
}

// 登录卡片
.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--bg-secondary-opacity-60);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
  transition: transform 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
}

// Logo区域
.logo-section {
  text-align: center;
  margin-bottom: 32px;

  .logo-icon {
    width: 88px;
    height: 88px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .brand-title {
    font-size: 28px;
    font-weight: bolder;
    color: #fff;
    margin: 0 0 8px;
    letter-spacing: 2px;
  }

  .brand-subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }
}

// 登录表单
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

// 表单组
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

// 输入框操作按钮
.input-action {
  color: var(--text-tertiary, #9ca3af);
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: var(--text-primary, #111827);
  }
}

// 错误信息
.error-message {
  font-size: 13px;
  color: rgba(239, 68, 68, 0.9);
  margin-top: 4px;
}

// 登录按钮
.login-btn {
  height: 52px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  border: none;
  border-radius: 14px;
  color: #0ea5e9;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(255, 255, 255, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// 按钮加载动画
.btn-loading {
  display: flex;
  gap: 6px;

  .loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #0ea5e9;
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

// 登录底部
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;

  .footer-link {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: color 0.3s ease;

    &:hover {
      color: #fff;
      text-decoration: underline;
    }
  }

  .footer-divider {
    color: rgba(255, 255, 255, 0.3);
  }
}

// 版权信息
.copyright {
  position: absolute;
  bottom: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

// 响应式设计
@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
    border-radius: 20px;
  }

  .brand-title {
    font-size: 24px;
    font-weight: bolder;
  }

  .logo-icon {
    width: 72px;
    height: 72px;
  }
}
</style>

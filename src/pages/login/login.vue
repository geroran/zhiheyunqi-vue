<template>
  <view class="container">
    <!-- Background Elements -->
    <view class="bg-shape s1"></view>
    <view class="bg-shape s2"></view>
    <view class="bg-shape s3"></view>

    <view class="login-card">
      <view class="header">
        <view class="logo-box">
          <text class="logo-icon">⚖️</text>
        </view>
        <text class="title">智合·云契</text>
        <text class="subtitle">智能法律契约管理平台</text>
      </view>

      <!-- Toggle Tabs -->
      <view class="tabs">
        <view 
          class="tab" 
          :class="{ active: isLoginMode }" 
          @click="isLoginMode = true"
        >
          <text>登录</text>
          <view class="indicator" v-if="isLoginMode"></view>
        </view>
        <view 
          class="tab" 
          :class="{ active: !isLoginMode }" 
          @click="isLoginMode = false"
        >
          <text>注册</text>
          <view class="indicator" v-if="!isLoginMode"></view>
        </view>
      </view>

      <!-- Form -->
      <view class="form-group">
        <view class="input-wrap">
          <text class="input-icon">�</text>
          <input 
            class="input" 
            v-model="username" 
            type="text" 
            placeholder="账号 / 手机号" 
            placeholder-class="placeholder"
          />
        </view>
        <view class="input-wrap">
          <text class="input-icon">�</text>
          <input 
            class="input" 
            v-model="password" 
            type="password" 
            placeholder="请输入密码" 
            placeholder-class="placeholder"
          />
        </view>
        
        <view class="input-wrap slide-in" v-if="!isLoginMode">
          <text class="input-icon">🛡️</text>
          <input 
            class="input" 
            v-model="confirmPassword" 
            type="password" 
            placeholder="确认密码" 
            placeholder-class="placeholder"
          />
        </view>
      </view>

      <!-- Action Button -->
      <button class="main-btn" hover-class="btn-hover" @click="handleAction">
        {{ isLoginMode ? '立即登录' : '创建账号' }}
      </button>

      <!-- Quick Login for Judges -->
      <view class="divider">
        <text class="text">快速通道</text>
      </view>

      <button class="judge-btn" hover-class="btn-hover" @click="quickLogin">
        <view class="btn-content">
          <text class="icon">👑</text>
          <text class="text">评委老师一键体验</text>
        </view>
        <view class="shine-effect"></view>
      </button>
    </view>

    <view class="footer">
      <text class="copyright">Intelligent Contract Cloud © 2025</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const isLoginMode = ref(true)
const username = ref('')
const password = ref('')
const confirmPassword = ref('')

const handleAction = () => {
  if (!username.value || !password.value) {
    uni.showToast({ title: '请输入账号密码', icon: 'none' })
    return
  }

  if (isLoginMode.value) {
    // Login Logic
    const storedUser = uni.getStorageSync('user_' + username.value)
    if (storedUser) {
      if (storedUser.password === password.value) {
        loginSuccess(storedUser)
      } else {
        uni.showToast({ title: '密码错误', icon: 'none' })
      }
    } else {
      uni.showToast({ title: '用户不存在，请先注册', icon: 'none' })
    }
  } else {
    // Register Logic
    if (password.value !== confirmPassword.value) {
      uni.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }
    
    // Check if exists
    if (uni.getStorageSync('user_' + username.value)) {
      uni.showToast({ title: '用户已存在', icon: 'none' })
      return
    }

    const newUser = {
      username: username.value,
      password: password.value,
      nickname: '用户' + Math.floor(Math.random() * 1000)
    }
    uni.setStorageSync('user_' + username.value, newUser)
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => {
        isLoginMode.value = true
    }, 1000)
  }
}

const quickLogin = () => {
  const demoUser = {
    username: 'judge',
    nickname: '评委老师',
    avatar: '/static/avatar-default.png'
  }
  uni.setStorageSync('currentUser', demoUser)
  
  uni.showLoading({ title: '极速登录中...' })
  setTimeout(() => {
    uni.hideLoading()
    uni.switchTab({ url: '/pages/index/index' })
  }, 600)
}

const loginSuccess = (user) => {
  uni.setStorageSync('currentUser', user)
  uni.showToast({ title: '登录成功', icon: 'success' })
  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' })
  }, 1000)
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
  position: relative;
  overflow: hidden;
  padding: 40rpx;
}

/* Background Shapes */
.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 1;
  opacity: 0.6;
}

.s1 {
  width: 500rpx;
  height: 500rpx;
  background: #bfdbfe;
  top: -100rpx;
  left: -100rpx;
  animation: float 8s ease-in-out infinite;
}

.s2 {
  width: 400rpx;
  height: 400rpx;
  background: #ddd6fe;
  bottom: 10%;
  right: -50rpx;
  animation: float 10s ease-in-out infinite reverse;
}

.s3 {
  width: 300rpx;
  height: 300rpx;
  background: #fecaca;
  top: 40%;
  left: 20%;
  opacity: 0.4;
  animation: pulse 6s ease-in-out infinite;
}

.V {
  z-index: 10;
  width: 100%;
  animation: fadeIn 0.8s ease-out;
}

.login-card {
  width: 100%;
  max-width: 620rpx;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 40rpx;
  padding: 60rpx 50rpx;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 20rpx 40rpx rgba(37, 99, 235, 0.08),
    0 4rpx 12rpx rgba(37, 99, 235, 0.04);
  z-index: 10;
}

.header {
  text-align: center;
  margin-bottom: 50rpx;
  
  .logo-box {
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24rpx;
    box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.25);
    
    .logo-icon {
      font-size: 50rpx;
    }
  }
  
  .title {
    display: block;
    font-size: 44rpx;
    font-weight: 900;
    color: #1e3a8a;
    margin-bottom: 8rpx;
    letter-spacing: 2rpx;
  }
  
  .subtitle {
    font-size: 24rpx;
    color: #64748b;
    letter-spacing: 1rpx;
  }
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
  
  .tab {
    font-size: 30rpx;
    color: #94a3b8;
    margin: 0 36rpx;
    padding-bottom: 12rpx;
    position: relative;
    cursor: pointer;
    transition: all 0.3s;
    font-weight: 500;
    
    &.active {
      color: #2563eb;
      font-weight: bold;
      transform: scale(1.05);
    }
    
    .indicator {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      background: #2563eb;
      border-radius: 6rpx;
      animation: expand 0.3s ease;
    }
  }
}

.form-group {
  margin-bottom: 40rpx;
  
  .input-wrap {
    background: #f8fafc;
    border-radius: 20rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    padding: 0 30rpx;
    margin-bottom: 24rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    
    &:focus-within {
      background: white;
      border-color: #3b82f6;
      box-shadow: 0 0 0 6rpx rgba(59, 130, 246, 0.1);
      transform: translateY(-2rpx);
    }
    
    .input-icon {
      font-size: 36rpx;
      margin-right: 20rpx;
      filter: grayscale(0.5);
    }
    
    .input {
      flex: 1;
      height: 100%;
      color: #334155;
      font-size: 28rpx;
      font-weight: 500;
    }
    
    .placeholder {
      color: #94a3b8;
    }
  }
}

/* Animations */
.slide-in {
  animation: slideIn 0.3s ease-out;
}

.main-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 24rpx;
  height: 96rpx;
  line-height: 96rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 10rpx 25rpx rgba(37, 99, 235, 0.25);
  margin-bottom: 40rpx;
  border: none;
  
  &::after { border: none; }
}

.btn-hover {
  opacity: 0.9;
  transform: scale(0.98);
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  
  .text {
    font-size: 22rpx;
    color: #94a3b8;
    background: #f8fafc; /* small trick, ideally transparent */
    padding: 0 10rpx;
  }
}

.judge-btn {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: #b45309;
  border-radius: 24rpx;
  height: 100rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 4rpx 12rpx rgba(245, 158, 11, 0.1),
    inset 0 0 0 2rpx rgba(251, 191, 36, 0.3);
    
  .btn-content {
    display: flex;
    align-items: center;
    z-index: 2;
  }

  .icon {
    font-size: 40rpx;
    margin-right: 12rpx;
  }
  
  .text {
    font-size: 30rpx;
    font-weight: 800;
  }
  
  .shine-effect {
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    animation: goldShine 3s infinite;
  }
}

.footer {
  position: absolute;
  bottom: 30rpx;
  
  .copyright {
    font-size: 20rpx;
    color: #94a3b8;
  }
}

/* Keyframes */
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30rpx, -30rpx); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-20rpx); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes expand {
  from { width: 0; }
  to { width: 40rpx; }
}

@keyframes goldShine {
  0% { transform: translateX(-100%); }
  20% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}
</style>

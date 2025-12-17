<template>
  <view class="container">
    <!-- Immersive Background -->
    <view class="bg-gradient"></view>
    <view class="bg-shape s1"></view>
    <view class="bg-shape s2"></view>

    <!-- Header Section -->
    <view class="profile-card fade-in-up">
      <view class="header-content">
        <!-- Avatar -->
        <view class="avatar-wrapper" @click="changeAvatar">
          <view class="avatar-border">
            <image 
              class="avatar-img" 
              :src="userInfo.avatar || '/static/logo.png'" 
              mode="aspectFill" 
              v-if="userInfo.avatar" 
            />
            <view class="avatar-placeholder" v-else>
              <text>👤</text>
            </view>
          </view>
          <view class="edit-badge">
            <text class="icon">📷</text>
          </view>
        </view>

        <!-- User Info -->
        <view class="info-wrapper" @click="changeNickname">
          <view class="name-row">
            <text class="username">{{ userInfo.nickname || '未登录用户' }}</text>
            <view class="edit-btn">
              <text class="icon">✎</text>
            </view>
          </view>
          <view class="level-tag">
            <text class="crown">👑</text>
            <text class="level-text">Lv.{{ levelInfo.level }} {{ levelInfo.title }}</text>
          </view>
        </view>

        <!-- Check-in Button -->
        <view 
          class="checkin-btn" 
          :class="{ disabled: hasCheckedIn }" 
          @click="handleCheckIn"
        >
          <text class="icon">{{ hasCheckedIn ? '✓' : '📅' }}</text>
          <text>{{ hasCheckedIn ? '已打卡' : '签到' }}</text>
        </view>
      </view>

      <!-- Stats Grid -->
      <view class="stats-grid">
        <view class="stat-item">
          <text class="num">{{ stats.days }}</text>
          <text class="label">累计天数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="num">{{ stats.articles }}</text>
          <text class="label">阅读篇数</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="num">{{ stats.quizScore }}</text>
          <text class="label">演练积分</text>
        </view>
      </view>
    </view>

    <!-- Knowledge Graph -->
    <view class="section-card fade-in-up delay-1">
      <view class="card-header">
        <view class="title-box">
          <text class="icon">📊</text>
          <text class="title">知识图谱</text>
        </view>
        <text class="subtitle">学习进度概览</text>
      </view>
      
      <view class="skills-list">
        <view class="skill-item" v-for="(val, idx) in skills" :key="idx">
          <view class="skill-info">
            <text class="name">{{ val.name }}</text>
            <text class="score">{{ val.score }}%</text>
          </view>
          <view class="progress-track">
            <view 
              class="progress-fill" 
              :style="{ '--final-width': val.score + '%', animationDelay: (idx * 0.1) + 's' }"
            ></view>
          </view>
        </view>
      </view>
    </view>

    <!-- Recent History -->
    <view class="section-card fade-in-up delay-2">
      <view class="card-header">
        <view class="title-box">
          <text class="icon">👣</text>
          <text class="title">最近足迹</text>
        </view>
        <view class="action-btn" @click="clearHistory">
          <text>清空</text>
        </view>
      </view>

      <view class="history-list" v-if="history.length > 0">
        <view class="history-item" v-for="(item, index) in history" :key="index">
          <view class="item-icon-box" :class="item.icon === '🎮' ? 'game' : 'read'">
            <text>{{ item.icon }}</text>
          </view>
          <view class="item-content">
            <text class="main-text">{{ item.main }}</text>
            <text class="time-text">{{ item.time }}</text>
          </view>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <image class="empty-img" src="/static/empty-box.png" mode="widthFix" v-if="false"/> 
        <text class="empty-text">虽然还没有足迹，但未来可期 🌱</text>
      </view>
    </view>

    <!-- Logout -->
    <view class="logout-btn fade-in-up delay-3" @click="handleLogout">
      <text>退出登录</text>
    </view>
    
    <view class="copyright">Intelligent Contract Cloud © 2025</view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const userInfo = ref({})
const stats = ref({ days: 0, articles: 0, quizScore: 0 })
const skills = ref([])
const history = ref([])
const hasCheckedIn = ref(false)

// Init defaults if storage empty
const initData = () => {
    // Skills Defaults
    const defaultSkills = [
        { name: "基础概念", score: 60 },
        { name: "房屋租赁", score: 40 },
        { name: "劳动权益", score: 30 },
        { name: "借贷风险", score: 20 },
        { name: "消费维权", score: 50 },
        { name: "合同规范", score: 10 }
    ]
    
    // Check local storage for skills
    let storedSkills = uni.getStorageSync('userSkills')
    if (!storedSkills) {
        uni.setStorageSync('userSkills', defaultSkills)
        skills.value = defaultSkills
    } else {
        skills.value = storedSkills
    }
    
    // Stats
    let storedStats = uni.getStorageSync('userStats')
    if (!storedStats) {
        storedStats = { days: 1, articles: 0, quizScore: 0 }
        uni.setStorageSync('userStats', storedStats)
    }
    stats.value = storedStats
    
    // History
    let storedHistory = uni.getStorageSync('userHistory')
    history.value = storedHistory || []
    
    // Check-in Status
    const today = new Date().toLocaleDateString()
    const lastDate = uni.getStorageSync('lastCheckIn')
    hasCheckedIn.value = (lastDate === today)
}

onShow(() => {
    const user = uni.getStorageSync('currentUser')
    if (user) {
        userInfo.value = user
    } else {
        userInfo.value = { nickname: '游客', avatar: '' }
    }
    initData()
})

const levelInfo = computed(() => {
    const score = stats.value.quizScore
    if (score < 100) return { level: 1, title: '初入职场' }
    if (score < 500) return { level: 2, title: '契约新手' }
    if (score < 1000) return { level: 3, title: '法律达人' }
    if (score < 2000) return { level: 4, title: '风控专家' }
    return { level: 5, title: '律政先锋' }
})

const handleCheckIn = () => {
    if (hasCheckedIn.value) return
    
    const today = new Date().toLocaleDateString()
    uni.setStorageSync('lastCheckIn', today)
    hasCheckedIn.value = true
    
    // Update Stats
    stats.value.days++
    stats.value.quizScore += 5 // Check-in bonus
    uni.setStorageSync('userStats', stats.value)
    
    uni.showToast({ title: '打卡成功 +5积分', icon: 'success' })
}

const clearHistory = () => {
    uni.removeStorageSync('userHistory')
    history.value = []
    uni.showToast({ title: '足迹已清空', icon: 'none' })
}

const handleLogout = () => {
    uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
            if (res.confirm) {
                uni.removeStorageSync('currentUser')
                uni.reLaunch({ url: '/pages/login/login' })
            }
        }
    })
}

const changeAvatar = () => {
    uni.chooseImage({
        count: 1,
        success: (res) => {
            const tempFilePath = res.tempFilePaths[0]
            userInfo.value.avatar = tempFilePath
            uni.setStorageSync('currentUser', userInfo.value)
        }
    })
}

const changeNickname = () => {
    uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新昵称',
        content: userInfo.value.nickname,
        success: (res) => {
            if (res.confirm && res.content.trim()) {
                userInfo.value.nickname = res.content.trim()
                uni.setStorageSync('currentUser', userInfo.value)
                uni.showToast({ title: '修改成功', icon: 'success' })
            }
        }
    })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 30rpx;
  padding-bottom: 60rpx;
  position: relative;
  overflow: hidden;
}

/* Dynamic Background */
.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 500rpx;
  background: linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 100%);
  z-index: 0;
  border-bottom-left-radius: 60rpx;
  border-bottom-right-radius: 60rpx;
}

.bg-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  z-index: 0;
  opacity: 0.5;
}

.s1 {
  width: 300rpx;
  height: 300rpx;
  background: #bfdbfe;
  top: -50rpx;
  right: -50rpx;
}

.s2 {
  width: 200rpx;
  height: 200rpx;
  background: #e9d5ff;
  top: 100rpx;
  left: -50rpx;
}

/* Animations */
.fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }

@keyframes fadeInUp {
  to { opacity: 1; transform: translateY(0); }
}

/* Profile Card */
.profile-card {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-radius: 40rpx;
  padding: 40rpx;
  box-shadow: 
    0 10rpx 30rpx rgba(148, 163, 184, 0.1),
    0 4rpx 10rpx rgba(148, 163, 184, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 30rpx;
  margin-top: 20rpx;
  
  .header-content {
    display: flex;
    align-items: center;
    margin-bottom: 50rpx;
  }
}

.avatar-wrapper {
  position: relative;
  margin-right: 30rpx;
  
  .avatar-border {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    padding: 6rpx;
    background: linear-gradient(135deg, #3b82f6, #818cf8);
    box-shadow: 0 8rpx 20rpx rgba(59, 130, 246, 0.3);
  }
  
  .avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4rpx solid white;
    background: white;
  }
  
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #f1f5f9;
    border: 4rpx solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 60rpx;
  }
  
  .edit-badge {
    position: absolute;
    bottom: 6rpx;
    right: 6rpx;
    width: 44rpx;
    height: 44rpx;
    background: #0f172a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3rpx solid white;
    box-shadow: 0 4rpx 8rpx rgba(0,0,0,0.1);
    
    .icon {
      font-size: 22rpx;
      margin-bottom: 2rpx;
    }
  }
}

.info-wrapper {
  flex: 1;
  
  .name-row {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
    
    .username {
      font-size: 40rpx;
      font-weight: 900;
      color: #1e3a8a;
      margin-right: 16rpx;
    }
    
    .edit-btn {
      width: 40rpx;
      height: 40rpx;
      background: #eff6ff;
      border-radius: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      
      .icon {
        font-size: 20rpx;
        color: #3b82f6;
      }
    }
  }
  
  .level-tag {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(90deg, #f59e0b, #d97706);
    padding: 6rpx 20rpx;
    border-radius: 30rpx;
    box-shadow: 0 4rpx 10rpx rgba(245, 158, 11, 0.2);
    
    .crown {
      font-size: 20rpx;
      margin-right: 8rpx;
    }
    
    .level-text {
      font-size: 22rpx;
      font-weight: bold;
      color: white;
      text-transform: uppercase;
      letter-spacing: 1rpx;
    }
  }
}

.checkin-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 12rpx 28rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 24rpx;
  font-weight: bold;
  color: #3b82f6;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  transition: all 0.3s;
  
  .icon {
    font-size: 28rpx;
  }
  
  &:active {
    transform: scale(0.96);
    background: #f8fafc;
  }
  
  &.disabled {
    background: #f1f5f9;
    color: #94a3b8;
    border-color: transparent;
  }
}

.stats-grid {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border-radius: 24rpx;
  padding: 30rpx;
  
  .stat-item {
    flex: 1;
    text-align: center;
    
    .num {
      display: block;
      font-size: 36rpx;
      font-weight: 900;
      color: #0f172a;
      margin-bottom: 6rpx;
    }
    
    .label {
      font-size: 22rpx;
      color: #64748b;
    }
  }
  
  .stat-divider {
    width: 2rpx;
    height: 40rpx;
    background: #e2e8f0;
  }
}

/* Section Cards */
.section-card {
  background: white;
  border-radius: 32rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(148, 163, 184, 0.05);
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;
    
    .title-box {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      .icon { font-size: 36rpx; }
      
      .title {
        font-size: 32rpx;
        font-weight: 800;
        color: #0f172a;
      }
    }
    
    .subtitle {
      font-size: 24rpx;
      color: #94a3b8;
    }
    
    .action-btn {
      font-size: 24rpx;
      color: #64748b;
      background: #f1f5f9;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
    }
  }
}

/* Skills List */
.skills-list {
  .skill-item {
    margin-bottom: 36rpx;
    
    &:last-child { margin-bottom: 0; }
    
    .skill-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12rpx;
      font-size: 26rpx;
      font-weight: bold;
      color: #475569;
      
      .score { color: #3b82f6; }
    }
    
    .progress-track {
      height: 16rpx;
      background: #f1f5f9;
      border-radius: 10rpx;
      overflow: hidden;
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #60a5fa);
        border-radius: 10rpx;
        width: 0;
        animation: progressSlide 1s ease-out forwards;
      }
    }
  }
}

@keyframes progressSlide {
  to { width: var(--final-width); } 
}

/* History List */
.history-list {
  .history-item {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    
    &:last-child { margin-bottom: 0; }
    
    .item-icon-box {
      width: 80rpx;
      height: 80rpx;
      border-radius: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      margin-right: 24rpx;
      
      &.read {
        background: #eff6ff;
        color: #3b82f6;
      }
      &.game {
        background: #fff7ed;
        color: #f97316;
      }
    }
    
    .item-content {
      flex: 1;
      
      .main-text {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: #334155;
        margin-bottom: 6rpx;
      }
      
      .time-text {
        font-size: 22rpx;
        color: #94a3b8;
      }
    }
  }
}

.empty-state {
  text-align: center;
  padding: 40rpx 0;
  
  .empty-text {
    font-size: 26rpx;
    color: #cbd5e1;
  }
}

.logout-btn {
  background: white;
  color: #ef4444;
  text-align: center;
  padding: 30rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  margin-bottom: 40rpx;
  
  &:active {
    background: #fef2f2;
    transform: scale(0.98);
  }
}

.copyright {
  text-align: center;
  font-size: 20rpx;
  color: #cbd5e1;
  margin-bottom: 20rpx;
}
</style>

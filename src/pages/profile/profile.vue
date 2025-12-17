<template>
  <view class="container">
    <!-- User Header -->
    <view class="profile-header">
      <view class="avatar-box">
        <image class="avatar-img" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill" v-if="userInfo.avatar" />
        <text class="avatar-placeholder" v-else>👤</text>
      </view>
      <view class="user-info">
        <text class="username">{{ userInfo.nickname || '未登录用户' }}</text>
        <text class="level">Lv.{{ levelInfo.level }} {{ levelInfo.title }}</text>
      </view>
      <view class="checkin-btn" :class="{ disabled: hasCheckedIn }" @click="handleCheckIn">
        {{ hasCheckedIn ? '已打卡' : '打卡' }}
      </view>
    </view>

    <!-- Stats Row -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="num">{{ stats.days }}</text>
        <text class="label">累计打卡</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ stats.articles }}</text>
        <text class="label">阅读文章</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ stats.quizScore }}</text>
        <text class="label">演练积分</text>
      </view>
    </view>

    <!-- Knowledge Graph (Skills) -->
    <view class="section-card">
      <view class="title-row">
        <text class="title">我的知识图谱</text>
        <text class="more">查看详情 ></text>
      </view>
      <view class="skills-list">
        <view class="skill-item" v-for="(val, idx) in skills" :key="idx">
          <view class="skill-label">
            <text>{{ val.name }}</text>
            <text class="percent">{{ val.score }}%</text>
          </view>
          <view class="progress-bg">
            <view class="progress-bar" :style="{ width: val.score + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- History List -->
    <view class="section-card">
      <view class="title-row">
        <text class="title">最近足迹</text>
        <view class="clear-btn" @click="clearHistory">清空</view>
      </view>
      <view class="history-list" v-if="history.length > 0">
        <view class="history-item" v-for="(item, index) in history" :key="index">
          <text class="icon">{{ item.icon }}</text>
          <view class="info">
            <text class="main">{{ item.main }}</text>
            <text class="time">{{ item.time }}</text>
          </view>
        </view>
      </view>
      <view class="empty-state" v-else>
        <text>暂无足迹，快去学习吧~</text>
      </view>
    </view>
    
    <view class="logout-btn" @click="handleLogout">退出登录</view>
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
        { name: "消费维权", score: 50 }
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
        // Redirect if no user? Or just show guest. For now show guest.
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
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 40rpx;
}

.profile-header {
  background: white;
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  align-items: center;
  position: relative;
  
  .avatar-box {
    width: 120rpx;
    height: 120rpx;
    background: #e0e7ff;
    border-radius: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
    border: 4rpx solid white;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
    
    .avatar-placeholder {
      font-size: 60rpx;
    }
  }
  
  .user-info {
    flex: 1;
    .username {
      font-size: 36rpx;
      font-weight: bold;
      color: #1e3a8a; // Primary Blue
      display: block;
    }
    .level {
      font-size: 24rpx;
      color: white;
      background: #3b82f6;
      padding: 4rpx 16rpx;
      border-radius: 20rpx;
      display: inline-block;
      margin-top: 10rpx;
    }
  }
  
  .settings-icon {
    font-size: 40rpx;
    color: #94a3b8;
  }
}

.stats-row {
  display: flex;
  justify-content: space-around;
  background: white;
  padding-bottom: 40rpx;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.02);
  
  .stat-item {
    text-align: center;
    .num {
      display: block;
      font-size: 36rpx;
      font-weight: 800;
      color: #1f2937;
    }
    .label {
      font-size: 24rpx;
      color: #9ca3af;
      margin-top: 6rpx;
    }
  }
}

.section-card {
  background: white;
  margin: 0 30rpx 30rpx;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.02);
  
  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;
    
    .title {
      font-size: 30rpx;
      font-weight: bold;
      color: #1f2937;
    }
    .more {
      font-size: 24rpx;
      color: #9ca3af;
    }
  }
}

.skills-list {
  .skill-item {
    margin-bottom: 24rpx;
    
    .skill-label {
      display: flex;
      justify-content: space-between;
      font-size: 26rpx;
      color: #4b5563;
      margin-bottom: 8rpx;
    }
    
    .progress-bg {
      height: 12rpx;
      background: #f1f5f9;
      border-radius: 6rpx;
      overflow: hidden;
      
      .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #3b82f6, #60a5fa);
        border-radius: 6rpx;
      }
    }
  }
}

.history-list {
  .history-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f8fafc;
    
    &:last-child {
      border-bottom: none;
    }
    

    .icon {
      font-size: 32rpx;
      margin-right: 20rpx;
      width: 60rpx;
      height: 60rpx;
      background: #eff6ff;
      border-radius: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .info {
      flex: 1;
      .main {
        font-size: 28rpx;
        color: #334155;
        display: block;
      }
      .time {
        font-size: 22rpx;
        color: #94a3b8;
      }
    }
  }
}

.checkin-btn {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  color: white;
  padding: 10rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 10rpx rgba(37, 99, 235, 0.3);
  margin-left: 20rpx;
  transition: all 0.3s;
  
  &.disabled {
    background: #e2e8f0;
    color: #94a3b8;
    box-shadow: none;
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.clear-btn {
  font-size: 24rpx;
  color: #94a3b8;
  padding: 4rpx 12rpx;
  background: #f1f5f9;
  border-radius: 8rpx;
  
  &:active {
    opacity: 0.7;
  }
}

.empty-state {
  text-align: center;
  padding: 40rpx 0;
  color: #cbd5e1;
  font-size: 26rpx;
}

.logout-btn {
  margin: 60rpx 40rpx;
  background: white;
  color: #ef4444;
  text-align: center;
  padding: 24rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
  
  &:active {
    background: #fef2f2;
  }
}
</style>

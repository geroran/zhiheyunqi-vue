<template>
  <view class="container">
    <!-- User Header -->
    <view class="profile-header">
      <view class="avatar-box">
        <text class="avatar-placeholder">👤</text>
      </view>
      <view class="user-info">
        <text class="username">契约新手</text>
        <text class="level">Lv.2 初入职场</text>
      </view>
      <view class="settings-icon">⚙️</view>
    </view>

    <!-- Stats Row -->
    <view class="stats-row">
      <view class="stat-item">
        <text class="num">{{ userStats.days }}</text>
        <text class="label">累计打卡</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ userStats.articles }}</text>
        <text class="label">阅读文章</text>
      </view>
      <view class="stat-item">
        <text class="num">{{ userStats.quizScore }}</text>
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
      </view>
      <view class="history-list">
        <view class="history-item">
          <text class="icon">📖</text>
          <view class="info">
            <text class="main">学习了《违约责任》</text>
            <text class="time">2小时前</text>
          </view>
        </view>
        <view class="history-item">
          <text class="icon">🔍</text>
          <view class="info">
            <text class="main">使用了条款分析器</text>
            <text class="time">昨天</text>
          </view>
        </view>
        <view class="history-item">
          <text class="icon">🎮</text>
          <view class="info">
            <text class="main">完成挑战《房东突然涨租》</text>
            <text class="time">3天前</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { userStats } from '@/mock/index.js'

// Transform mock radar data to the format needed for the list
const skills = ref(userStats.radar.categories.map((cat, index) => {
  return {
    name: cat,
    score: userStats.radar.series[0].data[index]
  }
}))
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
</style>

<template>
  <view class="container">
    <!-- Header Area -->
    <view class="header">
      <view class="title-bar">
        <text class="app-name">智合云契</text>
        <text class="slogan">看懂每一份约定</text>
      </view>
      <view class="search-box">
        <text class="placeholder">搜索合同知识、模板...</text>
      </view>
    </view>

    <!-- Categories -->
    <view class="section categories">
      <view class="category-item" v-for="(item, index) in categories" :key="index">
        <view class="icon-circle" :style="{ backgroundColor: item.color }">
          <text class="cat-icon">{{ item.icon }}</text>
        </view>
        <text class="cat-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- Featured Articles -->
    <view class="section">
      <view class="section-title">
        <text class="status-dot"></text>
        <text class="text">合同百科</text>
      </view>
      <view class="card-list">
        <view class="article-card" v-for="item in articles" :key="item.id">
          <view class="card-content">
            <text class="card-title">{{ item.title }}</text>
            <text class="card-desc">{{ item.desc }}</text>
            <view class="tags">
              <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- Templates Preview -->
    <view class="section">
      <view class="section-title">
        <text class="status-dot warning"></text>
        <text class="text">热门模板</text>
      </view>
      <scroll-view scroll-x="true" class="template-scroll">
        <view class="template-card" v-for="tpl in templatesData" :key="tpl.id">
          <view class="tpl-icon">📄</view>
          <text class="tpl-title">{{ tpl.title }}</text>
          <text class="tpl-desc">{{ tpl.desc }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { encyclopedia, templates } from '@/mock/index.js'

const articles = ref(encyclopedia)
const templatesData = ref(templates)

const categories = [
  { name: '百科', icon: '📖', color: '#e0f2fe' },
  { name: '避坑', icon: '🛡️', color: '#fef3c7' },
  { name: '模板', icon: '📝', color: '#dcfce7' },
  { name: '术语', icon: '🔤', color: '#f3e8ff' }
]
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding-bottom: 20rpx;
}

.header {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  padding: 80rpx 40rpx 40rpx;
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
  color: white;
  
  .title-bar {
    margin-bottom: 30rpx;
    .app-name {
      font-size: 48rpx;
      font-weight: bold;
      display: block;
    }
    .slogan {
      font-size: 24rpx;
      opacity: 0.8;
      margin-top: 10rpx;
      display: block;
    }
  }
}

.search-box {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 100rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  backdrop-filter: blur(10px);
  
  .placeholder {
    color: rgba(255,255,255, 0.7);
    font-size: 28rpx;
  }
}

.section {
  padding: 0 30rpx;
  margin-top: 40rpx;
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .status-dot {
      width: 8rpx;
      height: 32rpx;
      background: #2563eb;
      border-radius: 4rpx;
      margin-right: 16rpx;
      
      &.warning {
        background: #f59e0b;
      }
    }
    
    .text {
      font-size: 34rpx;
      font-weight: bold;
      color: #1f2937;
    }
  }
}

.categories {
  display: flex;
  justify-content: space-between;
  margin-top: -30rpx; // pull up overlap
  padding: 0 40rpx;
  position: relative;
  z-index: 10;
  
  .category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    padding: 20rpx;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05);
    width: 140rpx;
    
    .icon-circle {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 10rpx;
      
      .cat-icon {
        font-size: 40rpx;
      }
    }
    
    .cat-name {
      font-size: 24rpx;
      color: #4b5563;
      font-weight: 500;
    }
  }
}

.card-list {
  .article-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.03);
    
    .card-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #111827;
      display: block;
      margin-bottom: 10rpx;
    }
    
    .card-desc {
      font-size: 26rpx;
      color: #6b7280;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      overflow: hidden;
    }
    
    .tags {
      margin-top: 20rpx;
      display: flex;
      gap: 10rpx;
      
      .tag {
        font-size: 20rpx;
        background: #f3f4f6;
        color: #4b5563;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
    }
  }
}

.template-scroll {
  white-space: nowrap;
  
  .template-card {
    display: inline-block;
    width: 300rpx;
    background: white; // Gradient provided in item style if needed, but white clean card is better
    background: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%);
    border-radius: 20rpx;
    padding: 30rpx;
    margin-right: 20rpx;
    border: 1rpx solid #e5e7eb;
    
    .tpl-icon {
      font-size: 48rpx;
      margin-bottom: 20rpx;
    }
    
    .tpl-title {
      display: block;
      font-size: 28rpx;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8rpx;
    }
    
    .tpl-desc {
      display: block;
      font-size: 22rpx;
      color: #9ca3af;
      white-space: normal;
      height: 60rpx;
      overflow: hidden;
    }
  }
}
</style>

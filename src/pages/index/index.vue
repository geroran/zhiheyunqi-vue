<template>
  <view class="container">
    <!-- Header Area -->
    <view class="header">
      <view class="title-bar">
        <text class="app-name">智合云契</text>
        <text class="slogan">看懂每一份约定</text>
      </view>
      <view class="search-box">
        <input 
          class="search-input" 
          type="text" 
          placeholder="搜索合同知识、模板..." 
          v-model="searchQuery"
          placeholder-style="color: rgba(255,255,255, 0.7);"
        />
        <text class="search-icon" v-if="!searchQuery">🔍</text>
      </view>
    </view>

    <!-- Categories -->
    <view class="section categories">
      <view 
        class="category-item" 
        v-for="(item, index) in categories" 
        :key="index"
        @click="selectCategory(item.name)"
        :class="{ active: activeCategory === item.name }"
      >
        <view class="icon-circle" :style="{ backgroundColor: item.color }">
          <text class="cat-icon">{{ item.icon }}</text>
        </view>
        <text class="cat-name">{{ item.name }}</text>
      </view>
    </view>

    <!-- Dynamic List Section -->
    <view class="section">
      <view class="section-title">
        <text class="status-dot"></text>
        <text class="text">{{ sectionTitle }}</text>
      </view>
      <view class="card-list">
        <view class="article-card" v-for="item in filteredArticles" :key="item.id" @click="handleItemClick(item)">
          <view class="card-content">
            <text class="card-title">{{ item.title }}</text>
            <text class="card-desc">{{ item.desc }}</text>
            <view class="tags" v-if="item.tags">
              <text class="tag" v-for="tag in item.tags" :key="tag">{{ tag }}</text>
            </view>
            <view class="tags" v-else>
              <text class="tag">模板</text>
              <text class="tag">通用</text>
            </view>
          </view>
          <view class="arrow-icon">›</view>
        </view>
      </view>
    </view>

    <!-- Templates Preview (Hidden when viewing templates category) -->
    <view class="section" v-if="activeCategory !== '模板'">
      <view class="section-title">
        <text class="status-dot warning"></text>
        <text class="text">热门模板</text>
      </view>
      <scroll-view scroll-x="true" class="template-scroll">
        <view class="template-card" v-for="tpl in templatesData" :key="tpl.id" @click="goToDetail('template', tpl)">
          <view class="tpl-icon">📄</view>
          <text class="tpl-title">{{ tpl.title }}</text>
          <text class="tpl-desc">{{ tpl.desc }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { encyclopedia, templates } from '@/mock/index.js'

const articles = ref(encyclopedia)
const templatesData = ref(templates)
const searchQuery = ref('')
const activeCategory = ref('全部')

const categories = [
  { name: '全部', icon: '🔍', color: '#f1f5f9' },
  { name: '百科', icon: '📖', color: '#e0f2fe' },
  { name: '避坑', icon: '🛡️', color: '#fef3c7' },
  { name: '模板', icon: '📝', color: '#dcfce7' },
  { name: '术语', icon: '🔤', color: '#f3e8ff' }
]

const sectionTitle = computed(() => {
  return activeCategory.value === '模板' ? '精选模板' : '合同百科'
})

const filteredArticles = computed(() => {
  let result = []

  // Filter selection
  if (activeCategory.value === '模板') {
    result = templatesData.value
  } else {
    result = articles.value
    if (activeCategory.value !== '全部') {
      result = result.filter(item => item.tags && item.tags.includes(activeCategory.value))
    }
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase()
    result = result.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.desc.toLowerCase().includes(query) ||
      (item.content && item.content.toLowerCase().includes(query))
    )
  }

  return result
})

const selectCategory = (name) => {
    activeCategory.value = name
}

const handleItemClick = (item) => {
  // If item represents a template (has type '模板' or selected category is '模板')
  // In mock data, we added type: '模板' for templates.
  const type = (item.type === '模板' || activeCategory.value === '模板') ? 'template' : 'article'
  goToDetail(type, item)
}

const goToDetail = (type, item) => {
  uni.navigateTo({
    url: `/pages/detail/detail?type=${type}&id=${item.id}`
  })
}
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
  position: relative;
  
  .search-input {
    flex: 1;
    height: 100%;
    color: white;
    font-size: 28rpx;
  }
  
  .search-icon {
    position: absolute;
    right: 30rpx;
    font-size: 32rpx;
    opacity: 0.8;
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
    transition: all 0.3s ease;
    border: 2rpx solid transparent;
    
    &.active {
      transform: translateY(-4rpx);
      box-shadow: 0 8rpx 16rpx rgba(37, 99, 235, 0.15);
      border-color: #3b82f6;
      background: #eff6ff;
      
      .cat-name {
        color: #2563eb;
        font-weight: bold;
      }
    }
    
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.15);
    }
    
    .card-content {
      flex: 1;
    }
    
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
      line-clamp: 2;
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
    
    .arrow-icon {
      font-size: 48rpx;
      color: #d1d5db;
      margin-left: 20rpx;
      transition: all 0.3s ease;
    }
    
    &:active .arrow-icon {
      color: #2563eb;
      transform: translateX(8rpx);
    }
  }
}

.template-scroll {
  white-space: nowrap;
  
  .template-card {
    display: inline-block;
    width: 300rpx;
    background: linear-gradient(145deg, #ffffff 0%, #f9fafb 100%);
    border-radius: 20rpx;
    padding: 30rpx;
    margin-right: 20rpx;
    border: 1rpx solid #e5e7eb;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:active {
      transform: translateY(-4rpx);
      box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.15);
      border-color: #3b82f6;
    }
    
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

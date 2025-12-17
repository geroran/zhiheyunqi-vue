<template>
  <view class="container">
    <!-- Immersive Background -->
    <view class="bg-gradient"></view>
    <view class="bg-orb orb-1"></view>
    <view class="bg-orb orb-2"></view>
    <view class="bg-orb orb-3"></view>

    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="handleBack">
        <text class="back-icon">‹</text>
      </view>
      <view class="header-content">
        <view class="logo-row">
          <text class="logo-icon">⚖️</text>
          <text class="logo-text">法规检索</text>
        </view>
        <text class="subtitle">全国人大法规库 · 实时同步</text>
      </view>
    </view>

    <!-- Search Mode -->
    <view class="main-area" v-if="!showViewer">
      <!-- Premium Search Card -->
      <view class="search-card glass-card">
        <view class="search-row">
          <view class="input-wrapper">
            <text class="search-icon">🔍</text>
            <input 
              class="search-input" 
              v-model="keyword" 
              placeholder="搜索法规名称、关键词..."
              @confirm="doSearch"
            />
            <view class="clear-btn" v-if="keyword" @click="keyword = ''">×</view>
          </view>
          <button class="search-btn" @click="doSearch" :disabled="loading">
            {{ loading ? '搜索中' : '搜索' }}
          </button>
        </view>
        
        <!-- Quick Tags -->
        <view class="quick-tags">
          <view 
            class="tag-item" 
            v-for="kw in hotKeywords" 
            :key="kw"
            @click="quickSearch(kw)"
          >
            <text>{{ kw }}</text>
          </view>
        </view>
      </view>

      <!-- Results Area -->
      <view class="results-area">
        <!-- Stats Bar -->
        <view class="stats-bar" v-if="total > 0">
          <text class="stats-text">找到 <text class="highlight">{{ total }}</text> 部相关法规</text>
        </view>

        <!-- Loading -->
        <view class="loading-box glass-card" v-if="loading">
          <view class="loader"></view>
          <text class="loading-text">正在检索法规库...</text>
        </view>

        <!-- Results List -->
        <view class="results-list" v-else>
          <view 
            class="law-card glass-card" 
            v-for="item in results" 
            :key="item.bbbs"
            @click="viewDocument(item)"
          >
            <view class="card-top">
              <view class="law-type">{{ item.flxz || '法律' }}</view>
              <text class="law-date">{{ formatDate(item.gbrq) }}</text>
            </view>
            <text class="law-title">{{ cleanTitle(item.title) }}</text>
            <view class="card-bottom">
              <text class="law-org">{{ item.fbJg || '全国人民代表大会' }}</text>
              <view class="view-btn">
                <text>查看全文</text>
                <text class="arrow">→</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Load More -->
        <view class="load-more-btn" v-if="results.length > 0 && results.length < total" @click="loadMore">
          <text v-if="!loadingMore">{{ `加载更多 (${results.length}/${total})` }}</text>
          <text v-else>加载中...</text>
        </view>
      </view>
    </view>

    <!-- Document Viewer Mode -->
    <view class="viewer-area" v-else>
      <!-- Doc Header -->
      <view class="doc-header glass-card">
        <text class="doc-title">{{ cleanTitle(currentItem?.title) }}</text>
        <view class="doc-meta">
          <view class="meta-tag">{{ currentItem?.flxz || '法律' }}</view>
          <text class="meta-sep">·</text>
          <text class="meta-date">{{ formatDate(currentItem?.gbrq) }}</text>
          <text class="meta-sep">·</text>
          <text class="meta-org">{{ currentItem?.fbJg || '全国人大' }}</text>
        </view>
      </view>

      <!-- OFD Document Viewer -->
      <view class="doc-viewer glass-card">
        <!-- Loading State -->
        <view class="doc-loading" v-if="loadingPages">
          <view class="loader large"></view>
          <text class="loading-text">正在加载法规原文...</text>
          <text class="loading-hint">首次加载可能需要几秒钟</text>
        </view>

        <!-- Pages -->
        <scroll-view scroll-y class="pages-container" v-else-if="ofdPages.length > 0">
          <view class="page-wrapper" v-for="(pageUrl, idx) in ofdPages" :key="idx">
            <image 
              class="page-img" 
              :src="pageUrl" 
              mode="widthFix"
              @error="handleImageError(idx)"
            />
            <view class="page-indicator">
              <text>第 {{ idx + 1 }} 页</text>
            </view>
          </view>

          <!-- Load More Pages -->
          <view class="load-pages-btn" v-if="hasMorePages" @click="loadMorePages">
            <text v-if="!loadingMorePages">继续加载更多页面</text>
            <text v-else>加载中...</text>
          </view>

          <!-- End Marker -->
          <view class="doc-end" v-if="!hasMorePages">
            <text class="end-line"></text>
            <text class="end-text">— 文档结束 —</text>
            <text class="end-line"></text>
          </view>
        </scroll-view>

        <!-- Error State -->
        <view class="error-box" v-if="ofdError">
          <text class="error-emoji">📄</text>
          <text class="error-title">文档加载失败</text>
          <text class="error-desc">{{ ofdError }}</text>
          <button class="retry-btn" @click="retryLoadOfd">重新加载</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const keyword = ref('')
const results = ref([])
const total = ref(0)
const loading = ref(false)
const loadingMore = ref(false)
const pageNum = ref(1)
const pageSize = 20

const showViewer = ref(false)
const currentItem = ref(null)
const loadingPages = ref(false)
const loadingMorePages = ref(false)
const ofdPages = ref([])
const ofdPath = ref('')
const currentPageIndex = ref(0)
const hasMorePages = ref(true)
const ofdError = ref('')

const hotKeywords = ['民法典', '合同法', '劳动法', '消费者权益', '婚姻法', '公司法']

onMounted(() => {
  loadDefaultResults()
})

const handleBack = () => {
  if (showViewer.value) {
    showViewer.value = false
    ofdPages.value = []
    currentPageIndex.value = 0
    hasMorePages.value = true
    ofdError.value = ''
  } else {
    uni.navigateBack()
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return dateStr.substring(0, 10)
}

// 清理标题中的HTML标签
const cleanTitle = (str) => {
  if (!str) return ''
  return str.replace(/<[^>]*>/g, '')
}

const loadDefaultResults = async () => {
  loading.value = true
  try {
    const res = await fetchLawList('', 1)
    results.value = res.rows || []
    total.value = res.total || 0
  } catch (e) {
    console.error('Load error:', e)
  } finally {
    loading.value = false
  }
}

const quickSearch = (kw) => {
  keyword.value = kw
  doSearch()
}

const doSearch = async () => {
  loading.value = true
  pageNum.value = 1
  results.value = []
  
  try {
    const res = await fetchLawList(keyword.value, pageNum.value)
    results.value = res.rows || []
    total.value = res.total || 0
  } catch (e) {
    console.error('Search error:', e)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

const loadMore = async () => {
  if (loadingMore.value) return
  loadingMore.value = true
  pageNum.value++
  
  try {
    const res = await fetchLawList(keyword.value, pageNum.value)
    results.value = [...results.value, ...(res.rows || [])]
  } catch (e) {
    console.error('Load more error:', e)
  } finally {
    loadingMore.value = false
  }
}

const fetchLawList = async (searchContent, page) => {
  const response = await fetch('/api/law/law-search/search/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchRange: 1,
      searchType: 2,
      searchContent: searchContent,
      pageNum: page,
      pageSize: pageSize
    })
  })
  
  if (!response.ok) throw new Error('API failed')
  return response.json()
}

const viewDocument = async (item) => {
  currentItem.value = item
  showViewer.value = true
  loadingPages.value = true
  ofdPages.value = []
  currentPageIndex.value = 0
  hasMorePages.value = true
  ofdError.value = ''
  
  try {
    const detailRes = await fetch(`/api/law/law-search/search/flfgDetails?bbbs=${item.bbbs}`)
    const detailData = await detailRes.json()
    
    if (detailData.code === 200 && detailData.data?.ossFile?.ossWordOfdPath) {
      ofdPath.value = detailData.data.ossFile.ossWordOfdPath
      await loadOfdPages()
    } else {
      ofdError.value = '该法规暂无电子文档'
    }
  } catch (e) {
    console.error('View error:', e)
    ofdError.value = '加载失败: ' + e.message
  } finally {
    loadingPages.value = false
  }
}

const loadOfdPages = async () => {
  if (!ofdPath.value) return
  
  const pagesToLoad = 5
  const newPages = []
  
  for (let i = 0; i < pagesToLoad; i++) {
    const pageIndex = currentPageIndex.value + i
    const pageUrl = buildOfdImageUrl(ofdPath.value, pageIndex)
    
    try {
      const testRes = await fetch(pageUrl, { method: 'HEAD' })
      if (testRes.ok) {
        newPages.push(pageUrl)
      } else {
        hasMorePages.value = false
        break
      }
    } catch (e) {
      hasMorePages.value = false
      break
    }
  }
  
  if (newPages.length === 0 && currentPageIndex.value === 0) {
    for (let i = 0; i < 3; i++) {
      ofdPages.value.push(buildOfdImageUrl(ofdPath.value, i))
    }
    hasMorePages.value = true
  } else {
    ofdPages.value = [...ofdPages.value, ...newPages]
    currentPageIndex.value += newPages.length
    if (newPages.length < pagesToLoad) hasMorePages.value = false
  }
}

const loadMorePages = async () => {
  if (loadingMorePages.value || !hasMorePages.value) return
  loadingMorePages.value = true
  await loadOfdPages()
  loadingMorePages.value = false
}

const buildOfdImageUrl = (path, pageIndex) => {
  const innerUrl = `http://172.16.220.27:38080/law-search/amazonFile/ofdGenerateLink?filePath=${path}`
  const onceEncoded = encodeURIComponent(innerUrl)
  const doubleEncoded = encodeURIComponent(onceEncoded)
  const timestamp = Date.now()
  return `/api/ofd/reader/image?file=${doubleEncoded}&_b=3.2.0&_i=${pageIndex}&_=${timestamp}&_v=1&_h=0&_p=120`
}

const handleImageError = (index) => {
  console.log('Image error:', index)
  if (index === 0 && ofdPages.value.length <= 3) {
    ofdError.value = '文档暂时无法访问'
  }
  if (index >= currentPageIndex.value - 1) {
    hasMorePages.value = false
  }
}

const retryLoadOfd = () => {
  ofdError.value = ''
  viewDocument(currentItem.value)
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%);
  position: relative;
  overflow-x: hidden;
}

/* Immersive Background */
.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 380rpx;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%);
  z-index: 0;
}

.bg-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
  pointer-events: none;
}

.orb-1 {
  width: 400rpx;
  height: 400rpx;
  background: rgba(96, 165, 250, 0.4);
  top: -100rpx;
  right: -100rpx;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 300rpx;
  height: 300rpx;
  background: rgba(129, 140, 248, 0.3);
  top: 200rpx;
  left: -100rpx;
  animation: float 10s ease-in-out infinite reverse;
}

.orb-3 {
  width: 200rpx;
  height: 200rpx;
  background: rgba(251, 191, 36, 0.2);
  top: 100rpx;
  right: 100rpx;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30rpx); }
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 28rpx;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 8rpx 32rpx rgba(31, 38, 135, 0.08),
    0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

/* Header */
.header {
  position: relative;
  z-index: 10;
  padding: 60rpx 30rpx 40rpx;
  
  .back-btn {
    position: absolute;
    top: 60rpx;
    left: 30rpx;
    width: 72rpx;
    height: 72rpx;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .back-icon {
      font-size: 48rpx;
      color: white;
      font-weight: 300;
      margin-top: -4rpx;
    }
  }
  
  .header-content {
    text-align: center;
    padding-top: 20rpx;
    
    .logo-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16rpx;
      
      .logo-icon {
        font-size: 52rpx;
      }
      
      .logo-text {
        font-size: 48rpx;
        font-weight: 800;
        color: white;
        letter-spacing: 2rpx;
      }
    }
    
    .subtitle {
      display: block;
      margin-top: 12rpx;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.75);
      letter-spacing: 4rpx;
    }
  }
}

/* Main Area */
.main-area {
  position: relative;
  z-index: 10;
  padding: 0 30rpx 40rpx;
  margin-top: -20rpx;
}

/* Search Card */
.search-card {
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .search-row {
    display: flex;
    gap: 20rpx;
    
    .input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      background: #f1f5f9;
      border-radius: 20rpx;
      padding: 0 24rpx;
      transition: all 0.3s;
      
      &:focus-within {
        background: #e8f0fe;
        box-shadow: 0 0 0 3rpx rgba(59, 130, 246, 0.2);
      }
      
      .search-icon {
        font-size: 32rpx;
        margin-right: 16rpx;
      }
      
      .search-input {
        flex: 1;
        height: 88rpx;
        font-size: 30rpx;
        color: #1f2937;
      }
      
      .clear-btn {
        width: 44rpx;
        height: 44rpx;
        background: #cbd5e1;
        border-radius: 50%;
        color: white;
        font-size: 32rpx;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    .search-btn {
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      border-radius: 20rpx;
      padding: 0 48rpx;
      font-size: 30rpx;
      font-weight: 600;
      height: 88rpx;
      line-height: 88rpx;
      box-shadow: 0 8rpx 24rpx rgba(30, 58, 138, 0.25);
      transition: all 0.3s;
      
      &:active {
        transform: scale(0.96);
        box-shadow: 0 4rpx 12rpx rgba(30, 58, 138, 0.3);
      }
    }
  }
  
  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 24rpx;
    
    .tag-item {
      background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
      color: #3b82f6;
      padding: 14rpx 28rpx;
      border-radius: 40rpx;
      font-size: 26rpx;
      font-weight: 500;
      transition: all 0.2s;
      
      &:active {
        background: linear-gradient(135deg, #dbeafe 0%, #c7d2fe 100%);
        transform: scale(0.96);
      }
    }
  }
}

/* Results Area */
.results-area {
  .stats-bar {
    margin-bottom: 24rpx;
    
    .stats-text {
      font-size: 26rpx;
      color: #64748b;
      
      .highlight {
        color: #3b82f6;
        font-weight: 700;
      }
    }
  }
}

/* Loading Box */
.loading-box {
  padding: 100rpx 40rpx;
  text-align: center;
  
  .loader {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    margin: 0 auto 24rpx;
    animation: spin 1s linear infinite;
    
    &.large {
      width: 80rpx;
      height: 80rpx;
      border-width: 6rpx;
    }
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #64748b;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Law Cards */
.law-card {
  padding: 32rpx;
  margin-bottom: 24rpx;
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(31, 38, 135, 0.12);
  }
  
  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
    
    .law-type {
      background: linear-gradient(135deg, #1e3a8a, #3b82f6);
      color: white;
      font-size: 22rpx;
      font-weight: 600;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
    }
    
    .law-date {
      font-size: 24rpx;
      color: #94a3b8;
    }
  }
  
  .law-title {
    display: block;
    font-size: 32rpx;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.5;
    margin-bottom: 20rpx;
  }
  
  .card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .law-org {
      font-size: 24rpx;
      color: #64748b;
    }
    
    .view-btn {
      display: flex;
      align-items: center;
      gap: 8rpx;
      color: #3b82f6;
      font-size: 26rpx;
      font-weight: 600;
      
      .arrow {
        transition: transform 0.3s;
      }
    }
  }
  
  &:active .view-btn .arrow {
    transform: translateX(8rpx);
  }
}

.load-more-btn {
  text-align: center;
  padding: 32rpx;
  color: #3b82f6;
  font-size: 28rpx;
  font-weight: 600;
  
  &:active {
    opacity: 0.7;
  }
}

/* Viewer Area */
.viewer-area {
  position: relative;
  z-index: 10;
  padding: 0 30rpx 40rpx;
  margin-top: -20rpx;
}

.doc-header {
  padding: 32rpx;
  margin-bottom: 24rpx;
  
  .doc-title {
    display: block;
    font-size: 36rpx;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.5;
    margin-bottom: 20rpx;
  }
  
  .doc-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12rpx;
    
    .meta-tag {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      color: white;
      font-size: 22rpx;
      font-weight: 600;
      padding: 6rpx 16rpx;
      border-radius: 12rpx;
    }
    
    .meta-sep {
      color: #cbd5e1;
    }
    
    .meta-date, .meta-org {
      font-size: 24rpx;
      color: #64748b;
    }
  }
}

.doc-viewer {
  min-height: 60vh;
  overflow: hidden;
  
  .doc-loading {
    padding: 120rpx 40rpx;
    text-align: center;
    
    .loading-text {
      display: block;
      font-size: 30rpx;
      color: #475569;
      margin-top: 24rpx;
    }
    
    .loading-hint {
      display: block;
      font-size: 24rpx;
      color: #94a3b8;
      margin-top: 12rpx;
    }
  }
  
  .pages-container {
    height: calc(100vh - 480rpx);
    
    .page-wrapper {
      padding: 24rpx;
      
      .page-img {
        width: 100%;
        border-radius: 16rpx;
        box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
      }
      
      .page-indicator {
        text-align: center;
        margin-top: 20rpx;
        
        text {
          font-size: 24rpx;
          color: #94a3b8;
          background: #f1f5f9;
          padding: 8rpx 24rpx;
          border-radius: 20rpx;
        }
      }
    }
    
    .load-pages-btn {
      text-align: center;
      padding: 40rpx;
      color: #3b82f6;
      font-size: 28rpx;
      font-weight: 600;
    }
    
    .doc-end {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24rpx;
      padding: 48rpx;
      
      .end-line {
        flex: 1;
        height: 2rpx;
        background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      }
      
      .end-text {
        font-size: 24rpx;
        color: #94a3b8;
        white-space: nowrap;
      }
    }
  }
  
  .error-box {
    padding: 100rpx 60rpx;
    text-align: center;
    
    .error-emoji {
      font-size: 80rpx;
      display: block;
      margin-bottom: 24rpx;
    }
    
    .error-title {
      display: block;
      font-size: 32rpx;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 12rpx;
    }
    
    .error-desc {
      display: block;
      font-size: 26rpx;
      color: #64748b;
      margin-bottom: 40rpx;
    }
    
    .retry-btn {
      background: linear-gradient(135deg, #3b82f6, #60a5fa);
      color: white;
      border-radius: 50rpx;
      font-size: 30rpx;
      font-weight: 600;
      padding: 24rpx 80rpx;
      box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.3);
    }
  }
}
</style>

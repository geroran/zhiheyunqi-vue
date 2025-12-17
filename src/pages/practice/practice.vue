<template>
  <view class="container">
    <view class="header">
      <view class="badge">今日挑战</view>
      <text class="title">实战演练</text>
      <text class="subtitle">在真实的场景中学会应对</text>
    </view>

    <!-- Game Modes -->
    <!-- Game Modes -->
    <view class="mode-scroll">
      <view 
        class="mode-card" 
        v-for="(mode, index) in gameModes" 
        :key="index"
        :class="{ active: currentMode === index }"
        @click="switchMode(index)"
      >
        <text class="emoji">{{ mode.icon }}</text>
        <text class="name">{{ mode.name }}</text>
      </view>
    </view>

    <!-- Scenario List -->
    <view class="scenario-list" v-if="!activeScenario">
      <view 
        class="scenario-card" 
        v-for="item in currentList" 
        :key="item.id"
        @click="startScenario(item)"
      >
        <view class="card-left">
          <text class="tag">{{ item.id <= 1 ? '新手' : '进阶' }}</text>
          <text class="card-title">{{ item.title }}</text>
          <text class="card-desc">{{ item.desc }}</text>
        </view>
        <view class="play-btn">
          <text class="icon">▶</text>
        </view>
      </view>
    </view>

    <!-- Active Game View -->
    <view class="game-view" v-else>
      <view class="game-header">
        <text class="back-btn" @click="activeScenario = null">← 返回</text>
        <text class="game-title">{{ activeScenario.title }}</text>
      </view>
      
      <view class="question-card">
        <text class="q-desc">{{ activeScenario.desc }}</text>
        
        <view class="options-list">
          <view 
            class="option-item" 
            v-for="(opt, idx) in activeScenario.options" 
            :key="idx"
            :class="{ 
              selected: selectedOption === idx,
              correct: hasAnswered && opt.isCorrect,
              wrong: hasAnswered && selectedOption === idx && !opt.isCorrect
            }"
            @click="selectOption(idx)"
          >
            <text class="opt-text">{{ opt.text }}</text>
            <text class="icon" v-if="hasAnswered && opt.isCorrect">✅</text>
            <text class="icon" v-if="hasAnswered && selectedOption === idx && !opt.isCorrect">❌</text>
          </view>
        </view>

        <!-- Feedback -->
        <view class="feedback-box" v-if="hasAnswered">
          <text class="feedback-title">{{ isCorrect ? '回答正确！🎉' : '回答错误 😟' }}</text>
          <text class="feedback-text">{{ currentFeedback }}</text>
          <button class="next-btn" @click="activeScenario = null">完成挑战</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { scenarios, fillBlankScenarios, spotDiffScenarios } from '@/mock/index.js'

const currentMode = ref(0) // 0: 情景模拟, 1: 条款填空, 2: 找茬游戏
const activeScenario = ref(null)
const selectedOption = ref(null)
const hasAnswered = ref(false)

const scenariosData = ref(scenarios)
const fillBlankData = ref(fillBlankScenarios)
const spotDiffData = ref(spotDiffScenarios)

const gameModes = [
  { name: '情景模拟', icon: '🎭' },
  { name: '条款填空', icon: '📝' },
  { name: '找茬游戏', icon: '🔎' }
]

const currentList = computed(() => {
  switch(currentMode.value) {
    case 0: return scenariosData.value
    case 1: return fillBlankData.value
    case 2: return spotDiffData.value
    default: return scenariosData.value
  }
})

const switchMode = (index) => {
  currentMode.value = index
  activeScenario.value = null // 切换模式时退出当前游戏
}

const startScenario = (item) => {
  activeScenario.value = item
  selectedOption.value = null
  hasAnswered.value = false
}

const selectOption = (idx) => {
  if (hasAnswered.value) return
  selectedOption.value = idx
  hasAnswered.value = true
  
  // Logic to update local storage if correct
  if (activeScenario.value.options[idx].isCorrect) {
      // 1. Update Score
      let stats = uni.getStorageSync('userStats') || { days: 1, articles: 0, quizScore: 0 }
      stats.quizScore += 10
      uni.setStorageSync('userStats', stats)
      
      // 2. Add to History
      let history = uni.getStorageSync('userHistory') || []
      const newEntry = {
          icon: '🎮',
          main: `完成挑战《${activeScenario.value.title}》`,
          time: '刚刚'
      }
      history.unshift(newEntry)
      if (history.length > 20) history.pop()
      uni.setStorageSync('userHistory', history)
      
      // 3. Update Skills (Mapped Logic)
      let skills = uni.getStorageSync('userSkills')
      if (skills) {
          const title = activeScenario.value.title
          const desc = activeScenario.value.desc
          let targetCategory = ''
          
          // Map scenario content to skill category
          if (title.includes('房') || title.includes('租') || desc.includes('房')) targetCategory = '房屋租赁'
          else if (title.includes('理财') || title.includes('贷') || title.includes('钱') || desc.includes('金')) targetCategory = '借贷风险'
          else if (title.includes('职') || title.includes('工') || desc.includes('公司')) targetCategory = '劳动权益'
          else if (title.includes('买') || title.includes('费') || desc.includes('店')) targetCategory = '消费维权'
          else targetCategory = '基础概念'
          
          const skillIdx = skills.findIndex(s => s.name === targetCategory)
          if (skillIdx !== -1 && skills[skillIdx].score < 100) {
             skills[skillIdx].score = Math.min(100, skills[skillIdx].score + 5)
             uni.setStorageSync('userSkills', skills)
          }
      }
  }
}

const isCorrect = computed(() => {
  if (selectedOption.value === null) return false
  return activeScenario.value.options[selectedOption.value].isCorrect
})

const currentFeedback = computed(() => {
  if (selectedOption.value === null) return ''
  return activeScenario.value.options[selectedOption.value].feedback
})
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx 30rpx;
  min-height: 100vh;
  background: #f1f5f9;
}

.header {
  margin-bottom: 40rpx;
  .badge {
    background: #1e3a8a;
    color: white;
    font-size: 20rpx;
    padding: 4rpx 12rpx;
    border-radius: 8rpx;
    display: inline-block;
    margin-bottom: 10rpx;
  }
  .title {
    font-size: 44rpx;
    font-weight: 800;
    color: #0f172a;
    display: block;
  }
  .subtitle {
    font-size: 26rpx;
    color: #64748b;
  }
}

.mode-scroll {
  display: flex;
  margin-bottom: 40rpx;
  gap: 20rpx;
  
  .mode-card {
    background: white;
    padding: 20rpx 30rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    gap: 10rpx;
    opacity: 0.6;
    transition: all 0.3s;
    
    &.active {
      opacity: 1;
      background: white;
      box-shadow: 0 4rpx 12rpx rgba(30, 58, 138, 0.1);
      border: 1rpx solid #bfdbfe;
    }
    
    .name {
      font-size: 26rpx;
      font-weight: bold;
      color: #334155;
    }
  }
}

.scenario-list {
  .scenario-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2rpx 4rpx rgba(0,0,0,0.02);
    
    .card-left {
      flex: 1;
      padding-right: 20rpx;
      
      .tag {
        font-size: 20rpx;
        color: #2563eb;
        background: #eff6ff;
        padding: 2rpx 8rpx;
        border-radius: 4rpx;
        margin-right: 10rpx;
      }
      
      .card-title {
        font-size: 30rpx;
        font-weight: bold;
        color: #0f172a;
      }
      
      .card-desc {
        display: block;
        font-size: 24rpx;
        color: #64748b;
        margin-top: 8rpx;
      }
    }
    
    .play-btn {
      width: 60rpx;
      height: 60rpx;
      border-radius: 30rpx;
      background: #f8fafc;
      color: #0f172a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
    }
  }
}

.game-view {
  .game-header {
    margin-bottom: 30rpx;
    .back-btn {
      font-size: 28rpx;
      color: #64748b;
      margin-bottom: 20rpx;
      display: block;
    }
    .game-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #0f172a;
    }
  }
  
  .question-card {
    background: white;
    padding: 40rpx;
    border-radius: 24rpx;
    box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.05);
    
    .q-desc {
      font-size: 32rpx;
      color: #334155;
      line-height: 1.6;
      display: block;
      margin-bottom: 40rpx;
    }
    
    .option-item {
      background: #f8fafc;
      border: 2rpx solid #e2e8f0;
      padding: 24rpx 30rpx;
      border-radius: 16rpx;
      margin-bottom: 20rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
      
      &.selected {
        border-color: #3b82f6;
        background: #eff6ff;
      }
      
      &.correct {
        border-color: #22c55e;
        background: #f0fdf4;
      }
      
      &.wrong {
        border-color: #ef4444;
        background: #fef2f2;
      }
      
      .opt-text {
        font-size: 28rpx;
        color: #334155;
      }
    }
    
    .feedback-box {
      margin-top: 40rpx;
      padding-top: 30rpx;
      border-top: 1rpx dashed #cbd5e1;
      
      .feedback-title {
        font-size: 30rpx;
        font-weight: bold;
        display: block;
        margin-bottom: 10rpx;
        color: #0f172a;
      }
      
      .feedback-text {
        font-size: 26rpx;
        color: #475569;
        line-height: 1.5;
        display: block;
        margin-bottom: 20rpx;
      }
      
      .next-btn {
        background: #1e3a8a;
        color: white;
        font-size: 26rpx;
        border-radius: 50rpx;
      }
    }
  }
}
</style>

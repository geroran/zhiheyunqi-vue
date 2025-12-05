<template>
  <view class="container">
    <view class="header">
      <text class="title">智能工具箱</text>
      <text class="subtitle">AI辅助，风险无处遁形</text>
    </view>

    <!-- AI Analyzer -->
    <view class="tool-card main-tool">
      <view class="tool-header">
        <view class="icon-box">
          <text class="icon">🔍</text>
        </view>
        <view class="tool-info">
          <text class="name">AI条款分析器</text>
          <text class="desc">粘贴合同条款，一键识别风险漏洞</text>
        </view>
      </view>
      
      <view class="input-area">
        <textarea 
          class="clause-input" 
          placeholder="在此粘贴您要分析的条款内容..." 
          v-model="clauseText"
          maxlength="500"
        />
        <view class="char-count">{{ clauseText.length }}/500</view>
      </view>

      <button class="analyze-btn" @click="analyzeClause" :disabled="isAnalyzing">
        <text v-if="!isAnalyzing">开始检测</text>
        <text v-else>AI分析中...</text>
      </button>

      <!-- Analysis Result -->
      <view v-if="analysisResult" class="result-box">
        <view class="result-header">
          <text class="label">分析报告</text>
          <text class="risk-tag high" v-if="hasRisk">高风险</text>
          <text class="risk-tag safe" v-else>低风险</text>
        </view>
        <view class="result-content">
          <rich-text :nodes="analysisResult"></rich-text>
        </view>
        <view class="disclaimer">
          *结果基于公开模型训练，仅供学习参考，不构成法律建议。
        </view>
      </view>
    </view>

    <!-- Other Tools Grid -->
    <view class="grid-tools">
      <view class="grid-card">
        <text class="tool-icon">🤖</text>
        <text class="tool-name">智能问答</text>
        <text class="tool-desc">法律问题随时问</text>
        <button class="mini-btn">提问</button>
      </view>
      <view class="grid-card">
        <text class="tool-icon">📋</text>
        <text class="tool-name">自查清单</text>
        <text class="tool-desc">签约前逐项核对</text>
        <button class="mini-btn">开始</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const clauseText = ref('')
const isAnalyzing = ref(false)
const analysisResult = ref('')
const hasRisk = ref(false)

const analyzeClause = () => {
  if (!clauseText.value.trim()) return
  
  isAnalyzing.value = true
  analysisResult.value = ''
  
  // Simulate API delay
  setTimeout(() => {
    isAnalyzing.value = false
    
    // Mock logic: check for keywords
    if (clauseText.value.includes('最终解释权') || clauseText.value.includes('概不负责')) {
      hasRisk.value = true
      analysisResult.value = `
        <div style="font-size: 14px; color: #374151;">
          <p>检测到关键风险词：<span style="color: #ef4444; font-weight: bold;">"最终解释权" / "概不负责"</span></p>
          <p style="margin-top: 8px;"><b>法律解读：</b>根据《消费者权益保护法》，排除消费者主要权利的格式条款无效。商家单方规定"最终解释权"通常被认定为无效霸王条款。</p>
          <p style="margin-top: 8px; color: #2563eb;"><b>建议修改：</b>删除该表述，或并通过协商明确双方权利义务。</p>
        </div>
      `
    } else {
      hasRisk.value = false
      analysisResult.value = `
        <div style="font-size: 14px; color: #374151;">
          <p>未检测到明显的高风险关键词。</p>
          <p style="margin-top: 8px;"><b>可读性分析：</b>条款表述相对清晰。</p>
          <p style="margin-top: 8px; color: #059669;"><b>提示：</b>请继续关注其他关联条款，确保权利义务对等。</p>
        </div>
      `
    }
  }, 1500)
}
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx 30rpx;
  min-height: 100vh;
  background: #f8fafc;
}

.header {
  margin-bottom: 40rpx;
  .title {
    font-size: 40rpx;
    font-weight: 800;
    color: #1e3a8a;
    display: block;
  }
  .subtitle {
    font-size: 24rpx;
    color: #64748b;
    margin-top: 8rpx;
    display: block;
  }
}

.tool-card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(30, 58, 138, 0.08);
  margin-bottom: 30rpx;
  
  &.main-tool {
    border: 1rpx solid rgba(226, 232, 240, 0.8);
  }
}

.tool-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  
  .icon-box {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    
    .icon {
      font-size: 40rpx;
    }
  }
  
  .tool-info {
    .name {
      font-size: 32rpx;
      font-weight: bold;
      color: #1f2937;
      display: block;
    }
    .desc {
      font-size: 22rpx;
      color: #9ca3af;
      display: block;
      margin-top: 4rpx;
    }
  }
}

.input-area {
  position: relative;
  margin-bottom: 30rpx;
  
  .clause-input {
    width: 100%;
    height: 240rpx;
    background: #f9fafb;
    border: 2rpx solid #e5e7eb;
    border-radius: 16rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #374151;
  }
  
  .char-count {
    position: absolute;
    bottom: 20rpx;
    right: 20rpx;
    font-size: 20rpx;
    color: #9ca3af;
  }
}

.analyze-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border-radius: 100rpx;
  font-size: 30rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.3);
  
  &:active {
    transform: scale(0.98);
  }
  
  &[disabled] {
    opacity: 0.7;
  }
}

.result-box {
  margin-top: 30rpx;
  background: #f0f9ff;
  border-radius: 16rpx;
  padding: 24rpx;
  border: 1rpx solid #bae6fd;
  animation: fadeIn 0.5s ease;
  
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid rgba(0,0,0,0.05);
    
    .label {
      font-weight: bold;
      color: #0369a1;
      font-size: 28rpx;
    }
    
    .risk-tag {
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      font-weight: bold;
      
      &.high {
        background: #fee2e2;
        color: #b91c1c;
      }
      &.safe {
        background: #dcfce7;
        color: #15803d;
      }
    }
  }
  
  .disclaimer {
    margin-top: 20rpx;
    font-size: 20rpx;
    color: #94a3b8;
    text-align: center;
  }
}

.grid-tools {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30rpx;
  
  .grid-card {
    background: white;
    padding: 30rpx;
    border-radius: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.03);
    
    .tool-icon {
      font-size: 48rpx;
      margin-bottom: 16rpx;
    }
    
    .tool-name {
      font-weight: bold;
      font-size: 28rpx;
      margin-bottom: 8rpx;
    }
    
    .tool-desc {
      font-size: 22rpx;
      color: #9ca3af;
      margin-bottom: 24rpx;
    }
    
    .mini-btn {
      font-size: 24rpx;
      height: 56rpx;
      line-height: 56rpx;
      padding: 0 30rpx;
      border-radius: 28rpx;
      background: white;
      border: 2rpx solid #1e3a8a;
      color: #1e3a8a;
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

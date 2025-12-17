<template>
  <view class="container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="icon">‹</text>
      </view>
      <view class="header-info">
        <text class="type-badge">{{ typeName }}</text>
        <text class="title">{{ currentItem?.title }}</text>
      </view>
    </view>

    <!-- Content Section -->
    <view class="content-section">
      <view class="content-card">
        <view class="card-header">
          <text class="icon">📖</text>
          <text class="label">内容详情</text>
        </view>
        <view class="content-body">
          <text class="desc">{{ currentItem?.desc }}</text>
          <text class="main-content">{{ currentItem?.content }}</text>
          
          <!-- Tags -->
          <view v-if="currentItem?.tags" class="tags">
            <text class="tag" v-for="tag in currentItem.tags" :key="tag">{{ tag }}</text>
          </view>
          
          <!-- Template Structure -->
          <view v-if="currentItem?.structure" class="structure-section">
            <text class="structure-title">📋 合同结构</text>
            <view class="structure-item" v-for="(item, index) in currentItem.structure" :key="index">
              <view class="item-header">
                <text class="item-number">{{ index + 1 }}</text>
                <text class="item-name">{{ item.name }}</text>
              </view>
              <text class="item-desc">{{ item.desc }}</text>
            </view>
          </view>
          
          <!-- Disclaimer -->
          <view v-if="currentItem?.disclaimer" class="disclaimer">
            <text class="disclaimer-icon">⚠️</text>
            <text class="disclaimer-text">{{ currentItem.disclaimer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- AI Analysis Section -->
    <view class="ai-section">
      <view class="ai-card">
        <view class="ai-header">
          <view class="ai-title-box">
            <text class="ai-icon">🤖</text>
            <text class="ai-title">AI 智能解读</text>
          </view>
          <text class="ai-subtitle">专业法律知识库 · 深度分析</text>
        </view>

        <!-- Quick Questions -->
        <view class="quick-questions">
          <text class="section-label">💡 快速提问</text>
          <view class="question-grid">
            <view 
              v-for="(q, index) in quickQuestions" 
              :key="index"
              class="question-btn"
              @click="askQuestion(q)"
            >
              <text class="q-text">{{ q }}</text>
            </view>
          </view>
        </view>

        <!-- Custom Question Input -->
        <view class="input-area">
          <textarea 
            class="question-input" 
            placeholder="或输入您的问题..." 
            v-model="userQuestion"
            maxlength="300"
            :disabled="isStreaming"
          />
          <button 
            class="ask-btn" 
            @click="sendQuestion" 
            :disabled="isStreaming || !userQuestion.trim()"
          >
            <text v-if="!isStreaming">{{ userQuestion.trim() ? '提问' : '请输入' }}</text>
            <text v-else>思考中...</text>
          </button>
        </view>

        <!-- AI Response -->
        <view v-if="aiResponse || isStreaming" class="ai-response">
          <view class="response-header">
            <text class="label">🎯 AI 解答</text>
            <text class="streaming-tag" v-if="isStreaming">● 输出中</text>
          </view>
          <view class="response-content">
            <view class="markdown-body" v-html="renderedMarkdown"></view>
            <view v-if="isStreaming" class="cursor">▊</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { encyclopedia, templates } from '@/mock/index.js'
import { onLoad } from '@dcloudio/uni-app'

const API_KEY = 'sk-pyuyacwmrpbpfihhappjxuqxvevlkoghjuwkjqlyddyluvyc'
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const currentItem = ref(null)
const itemType = ref('')
const userQuestion = ref('')
const aiResponse = ref('')
const isStreaming = ref(false)

const typeName = computed(() => {
  return itemType.value === 'article' ? '合同百科' : '合同模板'
})

const quickQuestions = computed(() => {
  if (!currentItem.value) return []
  
  if (itemType.value === 'article') {
    return [
      '请详细解释这个概念',
      '有哪些实际案例？',
      '如何避免相关风险？',
      '相关法律依据是什么？'
    ]
  } else {
    return [
      '这个合同的核心要点是什么？',
      '签订时需要注意什么？',
      '常见的纠纷有哪些？',
      '如何保障自己的权益？'
    ]
  }
})

onLoad((options) => {
  const { type, id } = options
  itemType.value = type
  
  const dataSource = type === 'article' ? encyclopedia : templates
  currentItem.value = dataSource.find(item => item.id === parseInt(id))
})

const goBack = () => {
  uni.navigateBack()
}

const askQuestion = (question) => {
  if (isStreaming.value) return
  userQuestion.value = question
  setTimeout(() => {
    sendQuestion()
  }, 200)
}

// Markdown 渲染
const renderedMarkdown = computed(() => {
  let html = aiResponse.value
  
  html = html.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
  
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
  
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')
  
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>')
  
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br/>')
  
  if (html && !html.startsWith('<')) {
    html = '<p>' + html + '</p>'
  }
  
  return html
})

const sendQuestion = async () => {
  if (!userQuestion.value.trim() || isStreaming.value) return
  
  isStreaming.value = true
  aiResponse.value = ''
  
  const contextInfo = `
    标题：${currentItem.value.title}
    描述：${currentItem.value.desc}
    内容：${currentItem.value.content}
  `
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'THUDM/GLM-Z1-9B-0414',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的法律顾问助手，擅长用通俗易懂的语言解答法律问题。当前用户正在查看以下内容：\n${contextInfo}\n\n请基于这个内容，结合你的法律知识，为用户提供专业、准确、实用的解答。`
          },
          {
            role: 'user',
            content: userQuestion.value
          }
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048
      })
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n').filter(line => line.trim() !== '')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          
          if (data === '[DONE]') {
            isStreaming.value = false
            break
          }

          try {
            const json = JSON.parse(data)
            const content = json.choices?.[0]?.delta?.content
            
            if (content) {
              aiResponse.value += content
            }
          } catch (e) {
            console.error('解析失败:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('API 错误:', error)
    aiResponse.value = '抱歉，AI 服务暂时不可用。\n\n错误：' + error.message
    isStreaming.value = false
    
    uni.showToast({
      title: 'AI服务异常',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%);
  padding-bottom: 40rpx;
}

.header {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  padding: 80rpx 30rpx ;
  position: relative;
  
  .back-btn {
    position: absolute;
    top: 80rpx;
    left: 30rpx;
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    
    .icon {
      font-size: 48rpx;
      color: white;
      font-weight: bold;
    }
  }
  
  .header-info {
    margin-top: 40rpx;
    
    .type-badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.25);
      color: white;
      font-size: 22rpx;
      padding: 6rpx 16rpx;
      border-radius: 20rpx;
      margin: 36rpx;
      backdrop-filter: blur(10px);
    }
    
    .title {
      display: block;
      font-size: 40rpx;
      font-weight: bold;
      color: white;
      line-height: 1.4;
    }
  }
}

.content-section {
  padding: 0 30rpx;
  margin-top: -20rpx;
  position: relative;
  z-index: 10;
}

.content-card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  
  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f1f5f9;
    
    .icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }
    
    .label {
      font-size: 28rpx;
      font-weight: bold;
      color: #1f2937;
    }
  }
  
  .content-body {
    .desc {
      display: block;
      font-size: 28rpx;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 20rpx;
      font-weight: 500;
    }
    
    .main-content {
      display: block;
      font-size: 26rpx;
      color: #6b7280;
      line-height: 1.8;
      margin-bottom: 24rpx;
    }
    
    .tags {
      display: flex;
      gap: 12rpx;
      flex-wrap: wrap;
      margin-bottom: 24rpx;
      
      .tag {
        font-size: 22rpx;
        background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
        color: #1e40af;
        padding: 8rpx 16rpx;
        border-radius: 12rpx;
        font-weight: 500;
      }
    }
    
    .structure-section {
      margin-top: 30rpx;
      
      .structure-title {
        display: block;
        font-size: 28rpx;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 20rpx;
      }
      
      .structure-item {
        background: #f9fafb;
        border-radius: 16rpx;
        padding: 20rpx;
        margin-bottom: 16rpx;
        border-left: 4rpx solid #3b82f6;
        
        .item-header {
          display: flex;
          align-items: center;
          margin-bottom: 8rpx;
          
          .item-number {
            width: 40rpx;
            height: 40rpx;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20rpx;
            font-weight: bold;
            margin-right: 12rpx;
          }
          
          .item-name {
            font-size: 26rpx;
            font-weight: bold;
            color: #1f2937;
          }
        }
        
        .item-desc {
          font-size: 24rpx;
          color: #6b7280;
          line-height: 1.6;
          padding-left: 52rpx;
        }
      }
    }
    
    .disclaimer {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 16rpx;
      padding: 20rpx;
      display: flex;
      align-items: flex-start;
      margin-top: 24rpx;
      
      .disclaimer-icon {
        font-size: 28rpx;
        margin-right: 12rpx;
        flex-shrink: 0;
      }
      
      .disclaimer-text {
        flex: 1;
        font-size: 22rpx;
        color: #78350f;
        line-height: 1.6;
      }
    }
  }
}

.ai-section {
  padding: 0 30rpx;
  margin-top: 30rpx;
}

.ai-card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(37, 99, 235, 0.1);
  
  .ai-header {
    margin-bottom: 30rpx;
    
    .ai-title-box {
      display: flex;
      align-items: center;
      margin-bottom: 8rpx;
      
      .ai-icon {
        font-size: 36rpx;
        margin-right: 12rpx;
      }
      
      .ai-title {
        font-size: 32rpx;
        font-weight: bold;
        background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
    
    .ai-subtitle {
      font-size: 22rpx;
      color: #9ca3af;
      padding-left: 48rpx;
    }
  }
  
  .quick-questions {
    margin-bottom: 30rpx;
    
    .section-label {
      display: block;
      font-size: 24rpx;
      font-weight: bold;
      color: #475569;
      margin-bottom: 16rpx;
    }
    
    .question-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12rpx;
      
      .question-btn {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border: 2rpx solid #bae6fd;
        border-radius: 16rpx;
        padding: 16rpx;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:active {
          transform: scale(0.96);
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #3b82f6;
        }
        
        .q-text {
          font-size: 22rpx;
          color: #0369a1;
          font-weight: 500;
          line-height: 1.4;
        }
      }
    }
  }
  
  .input-area {
    display: flex;
    gap: 12rpx;
    margin-bottom: 24rpx;
    
    .question-input {
      flex: 1;
      background: #f8fafc;
      border: 2rpx solid #e2e8f0;
      border-radius: 16rpx;
      padding: 16rpx;
      font-size: 26rpx;
      color: #1f2937;
      min-height: 80rpx;
      
      &:focus {
        border-color: #3b82f6;
      }
    }
    
    .ask-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 16rpx;
      font-size: 26rpx;
      font-weight: bold;
      padding: 0 32rpx;
      height: 80rpx;
      line-height: 80rpx;
      box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
      
      &:active {
        transform: scale(0.96);
      }
      
      &[disabled] {
        opacity: 0.5;
        background: #94a3b8;
      }
    }
  }
  
  .ai-response {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 20rpx;
    padding: 24rpx;
    border: 2rpx solid #bae6fd;
    animation: slideIn 0.4s ease;
    
    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      padding-bottom: 16rpx;
      border-bottom: 2rpx solid rgba(186, 230, 253, 0.5);
      
      .label {
        font-size: 26rpx;
        font-weight: bold;
        color: #0369a1;
      }
      
      .streaming-tag {
        font-size: 20rpx;
        color: #0ea5e9;
        animation: pulse 1.5s infinite;
      }
    }
    
    .response-content {
      position: relative;
      
      .markdown-body {
        font-size: 26rpx;
        line-height: 1.8;
        color: #1f2937;
        word-wrap: break-word;
        
        :deep(h1), :deep(h2), :deep(h3) {
          font-weight: bold;
          color: #1e3a8a;
          margin: 16rpx 0 12rpx;
        }
        
        :deep(h1) { font-size: 32rpx; }
        :deep(h2) { font-size: 30rpx; }
        :deep(h3) { font-size: 28rpx; }
        
        :deep(p) {
          margin: 12rpx 0;
        }
        
        :deep(strong) {
          font-weight: bold;
          color: #1e40af;
        }
        
        :deep(em) {
          font-style: italic;
          color: #4f46e5;
        }
        
        :deep(code) {
          background: #fef3c7;
          color: #92400e;
          padding: 2rpx 8rpx;
          border-radius: 6rpx;
          font-family: 'Courier New', monospace;
          font-size: 22rpx;
        }
        
        :deep(pre) {
          background: #1e293b;
          color: #e2e8f0;
          padding: 20rpx;
          border-radius: 12rpx;
          overflow-x: auto;
          margin: 16rpx 0;
          
          code {
            background: transparent;
            color: inherit;
            padding: 0;
          }
        }
        
        :deep(ul), :deep(ol) {
          margin: 12rpx 0;
          padding-left: 40rpx;
        }
        
        :deep(li) {
          margin: 8rpx 0;
          line-height: 1.6;
        }
        
        :deep(a) {
          color: #2563eb;
          text-decoration: underline;
        }
      }
      
      .cursor {
        display: inline-block;
        color: #3b82f6;
        animation: blink 1s infinite;
        margin-left: 4rpx;
      }
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>

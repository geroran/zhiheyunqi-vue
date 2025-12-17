<template>
  <view class="container">
    <view class="header">
      <text class="title">🤖 AI智能助手</text>
      <text class="subtitle">法律问题，即问即答 · 流式输出 · 专业解答</text>
    </view>

    <!-- AI Chat Section -->
    <view class="chat-card">
      <view class="chat-header">
        <view class="icon-box">
          <text class="icon">{{ currentConfig.icon }}</text>
        </view>
        <view class="chat-info">
          <text class="name">{{ currentConfig.title }}</text>
          <text class="desc">{{ currentConfig.desc }}</text>
        </view>
        <button 
          v-if="currentMode !== 'general'" 
          class="reset-mode-btn" 
          @click="switchMode('general')"
        >
          返回通用
        </button>
      </view>

      <!-- Sample Questions -->
      <view class="samples-section">
        <text class="samples-title">💡 快速体验 - 点击示例问题</text>
        <view class="samples-grid">
          <view 
            v-for="(sample, index) in currentConfig.samples" 
            :key="index"
            class="sample-item"
            @click="selectSample(sample)"
          >
            <text class="sample-icon">{{ sample.icon }}</text>
            <text class="sample-text">{{ sample.question }}</text>
          </view>
        </view>
      </view>

      <!-- Input Area -->
      <view class="input-section">
        <textarea 
          class="question-input" 
          :placeholder="currentConfig.placeholder" 
          v-model="userQuestion"
          maxlength="500"
          :disabled="isStreaming"
        />
        <view class="input-footer">
          <text class="char-count">{{ userQuestion.length }}/500</text>
          <button 
            class="send-btn" 
            @click="sendQuestion" 
            :disabled="isStreaming || !userQuestion.trim()"
          >
            <text v-if="!isStreaming">{{ userQuestion.trim() ? '发送提问' : '请输入问题' }}</text>
            <text v-else>AI思考中...</text>
          </button>
        </view>
      </view>

      <!-- AI Response Area -->
      <view v-if="aiResponse || isStreaming" class="response-box">
        <view class="response-header">
          <text class="label">🎯 AI 解答</text>
          <text class="streaming-indicator" v-if="isStreaming">● 正在输出...</text>
        </view>
        <view class="response-content">
          <!-- Markdown 渲染区域 -->
          <view class="markdown-body" v-html="renderedMarkdown"></view>
          <view v-if="isStreaming" class="cursor-blink">▊</view>
        </view>
        <view class="response-footer">
          <text class="disclaimer">*AI 回答仅供参考，不构成正式法律意见</text>
          <button v-if="!isStreaming" class="clear-btn" @click="clearChat">清空对话</button>
        </view>
      </view>
    </view>

    <!-- Original Tools Section (Collapsed) -->
    <view class="other-tools" v-if="currentMode === 'general'">
      <text class="section-title">其他专业工具</text>
      <view class="grid-tools">
        <view class="grid-card" @click="switchMode('analysis')">
          <text class="tool-icon">🔍</text>
          <text class="tool-name">条款分析</text>
          <text class="tool-desc">识别风险条款</text>
        </view>
        <view class="grid-card" @click="switchMode('checklist')">
          <text class="tool-icon">📋</text>
          <text class="tool-name">自查清单</text>
          <text class="tool-desc">签约前核对</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const API_KEY = 'sk-pyuyacwmrpbpfihhappjxuqxvevlkoghjuwkjqlyddyluvyc'
const API_URL = 'https://api.siliconflow.cn/v1/chat/completions'

const userQuestion = ref('')
const aiResponse = ref('')
const isStreaming = ref(false)
const currentMode = ref('general') // general, analysis, checklist

const modeConfig = {
  general: {
    title: '智能法律顾问',
    desc: '基于 专业法律RAG知识库 大模型 · 支持流式输出',
    icon: '💬',
    systemPrompt: '你是一个专业的法律顾问助手，擅长用通俗易懂的语言解答法律问题。回答要准确、专业，并提供实用建议。',
    placeholder: '请输入您的法律问题，或点击上方示例快速体验...',
    samples: [
      { icon: '📝', question: '租房合同中"最终解释权归房东所有"这个条款有效吗？' },
      { icon: '💼', question: '劳动合同试用期最长可以约定多久？' },
      { icon: '🏠', question: '购房合同签订后，开发商延期交房怎么办？' },
      { icon: '🚗', question: '交通事故对方全责但不赔偿，应该如何处理？' },
      { icon: '💰', question: '网购商品存在质量问题，商家拒绝退款怎么办？' },
      { icon: '⚖️', question: '什么情况下可以申请劳动仲裁？需要哪些材料？' }
    ]
  },
  analysis: {
    title: '条款风险分析师',
    desc: '粘贴合同条款 · 深度识别陷阱 · 提供修改建议',
    icon: '🔍',
    systemPrompt: '你是一个专业的合同条款风险分析师。请对用户提供的合同条款进行深度分析，指出其中的法律风险、不公平条款、模糊表述，并给出具体的修改建议。回答格式应包含：风险等级、风险点解析、修改建议。',
    placeholder: '请粘贴您需要分析的合同条款...',
    samples: [
      { icon: '🏠', question: '分析条款："租赁期间，如房屋发生任何损坏，均由承租人负责维修并承担费用。"' },
      { icon: '💼', question: '分析条款："员工离职后3年内不得从事同行业工作，否则需赔偿公司50万元。"' },
      { icon: '💰', question: '分析条款："本充值卡一经售出，概不退换，余额不予退还。"' },
      { icon: '⚠️', question: '分析条款："出卖人逾期交房超过90天，买受人方可解除合同，且不退还定金。"' }
    ]
  },
  checklist: {
    title: '避坑清单生成器',
    desc: '输入场景 · 生成检查清单 · 签约前逐项核对',
    icon: '📋',
    systemPrompt: '你是一个专业的法律风险控制专家。请根据用户提供的场景（如租房、买房、入职等），生成一份详细的“避坑自查清单”。清单应包含：核心通过点、必备材料、常见陷阱、签约前必问事项。请以Markdown列表形式输出。',
    placeholder: '请输入您要进行的法律行为（如：我要租房）...',
    samples: [
      { icon: '🏘️', question: '我要租一间二手房，请生成签约前自查清单' },
      { icon: '🎓', question: '我是应届生，马上要签三方协议，需要注意什么？' },
      { icon: '🚗', question: '购买二手车，过户前需要检查哪些手续和合同细节？' },
      { icon: '🛠️', question: '家里装修找了装修公司，签合同前要核对哪些项目？' }
    ]
  }
}

const currentConfig = computed(() => modeConfig[currentMode.value])

// 选择示例问题
const selectSample = (sample) => {
  if (isStreaming.value) return
  userQuestion.value = sample.question
  // 自动发送
  setTimeout(() => {
    sendQuestion()
  }, 300)
}

const switchMode = (mode) => {
  if (isStreaming.value) return
  currentMode.value = mode
  clearChat()
  // 滚动到顶部
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}

// Markdown 渲染（简化版，处理常见格式）
const renderedMarkdown = computed(() => {
  let html = aiResponse.value
  
  // 转义 HTML 特殊字符
  html = html.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
  
  // 标题 (### -> h3, ## -> h2, # -> h1)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // 粗体 **text** 或 __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>')
  
  // 斜体 *text* 或 _text_
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.*?)_/g, '<em>$1</em>')
  
  // 行内代码 `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // 代码块 ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  
  // 无序列表 - item 或 * item
  html = html.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // 有序列表 1. item
  html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>')
  
  // 链接 [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  
  // 换行
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br/>')
  
  // 包裹段落
  if (html && !html.startsWith('<')) {
    html = '<p>' + html + '</p>'
  }
  
  return html
})

// 发送问题
const sendQuestion = async () => {
  if (!userQuestion.value.trim() || isStreaming.value) return
  
  isStreaming.value = true
  aiResponse.value = ''
  
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
            content: currentConfig.value.systemPrompt
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
            console.error('解析 JSON 失败:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('API 调用错误:', error)
    aiResponse.value = '抱歉，AI 服务暂时不可用，请稍后重试。\n\n错误信息：' + error.message
    isStreaming.value = false
    
    // 显示友好的错误提示
    uni.showToast({
      title: 'AI服务异常',
      icon: 'none',
      duration: 2000
    })
  }
}

// 清空对话
const clearChat = () => {
  userQuestion.value = ''
  aiResponse.value = ''
}
</script>

<style lang="scss" scoped>
.container {
  padding: 40rpx 30rpx;
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%);
}

.header {
  margin-bottom: 40rpx;
  text-align: center;
  
  .title {
    font-size: 48rpx;
    font-weight: 800;
    background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .subtitle {
    font-size: 24rpx;
    color: #64748b;
    display: block;
  }
}

.chat-card {
  background: white;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(37, 99, 235, 0.12);
  margin-bottom: 40rpx;
}

.chat-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #f1f5f9;
  
  .icon-box {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20rpx;
    
    .icon {
      font-size: 40rpx;
    }
  }
  
  .chat-info {
    flex: 1;
    
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

.samples-section {
  margin-bottom: 30rpx;
  
  .samples-title {
    font-size: 26rpx;
    font-weight: bold;
    color: #475569;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .samples-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16rpx;
    
    .sample-item {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 16rpx;
      padding: 20rpx;
      display: flex;
      align-items: flex-start;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2rpx solid transparent;
      
      &:active {
        transform: scale(0.96);
        border-color: #f59e0b;
      }
      
      .sample-icon {
        font-size: 32rpx;
        margin-right: 12rpx;
        flex-shrink: 0;
      }
      
      .sample-text {
        font-size: 22rpx;
        color: #78350f;
        line-height: 1.5;
        font-weight: 500;
      }
    }
  }
}

.input-section {
  margin-bottom: 30rpx;
  
  .question-input {
    width: 100%;
    min-height: 180rpx;
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;
    padding: 20rpx;
    font-size: 28rpx;
    color: #1f2937;
    margin-bottom: 16rpx;
    transition: border-color 0.3s;
    
    &:focus {
      border-color: #3b82f6;
    }
  }
  
  .input-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .char-count {
      font-size: 22rpx;
      color: #94a3b8;
    }
    
    .send-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border-radius: 100rpx;
      font-size: 26rpx;
      font-weight: bold;
      padding: 0 40rpx;
      height: 64rpx;
      line-height: 64rpx;
      box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.4);
      
      &:active {
        transform: scale(0.96);
      }
      
      &[disabled] {
        opacity: 0.5;
        background: #94a3b8;
      }
    }
  }
}

.response-box {
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
      font-size: 28rpx;
      font-weight: bold;
      color: #0369a1;
    }
    
    .streaming-indicator {
      font-size: 22rpx;
      color: #0ea5e9;
      animation: pulse 1.5s infinite;
    }
  }
  
  .response-content {
    position: relative;
    
    .markdown-body {
      font-size: 28rpx;
      line-height: 1.8;
      color: #1f2937;
      word-wrap: break-word;
      
      // Markdown 样式
      :deep(h1) {
        font-size: 36rpx;
        font-weight: bold;
        color: #1e3a8a;
        margin: 20rpx 0 16rpx;
      }
      
      :deep(h2) {
        font-size: 32rpx;
        font-weight: bold;
        color: #1e40af;
        margin: 16rpx 0 12rpx;
      }
      
      :deep(h3) {
        font-size: 30rpx;
        font-weight: bold;
        color: #2563eb;
        margin: 12rpx 0 8rpx;
      }
      
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
        font-size: 24rpx;
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
    
    .cursor-blink {
      display: inline-block;
      color: #3b82f6;
      animation: blink 1s infinite;
      margin-left: 4rpx;
    }
  }
  
  .response-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20rpx;
    padding-top: 16rpx;
    border-top: 2rpx solid rgba(186, 230, 253, 0.5);
    
    .disclaimer {
      font-size: 20rpx;
      color: #64748b;
      flex: 1;
    }
    
    .clear-btn {
      font-size: 22rpx;
      color: #ef4444;
      background: white;
      border: 1rpx solid #fecaca;
      border-radius: 12rpx;
      padding: 8rpx 20rpx;
      height: auto;
      line-height: 1.5;
    }
  }
}

.other-tools {
  .section-title {
    font-size: 28rpx;
    font-weight: bold;
    color: #475569;
    display: block;
    margin-bottom: 20rpx;
  }
  
  .grid-tools {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
    
    .grid-card {
      background: white;
      padding: 30rpx;
      border-radius: 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
      
      .tool-icon {
        font-size: 48rpx;
        margin-bottom: 12rpx;
      }
      
      .tool-name {
        font-size: 26rpx;
        font-weight: bold;
        color: #1f2937;
        margin-bottom: 6rpx;
      }
      
      .tool-desc {
        font-size: 22rpx;
        color: #9ca3af;
      }
    }
  }
}

.reset-mode-btn {
  font-size: 22rpx;
  color: #4b5563;
  background: #f1f5f9;
  border-radius: 30rpx;
  padding: 8rpx 20rpx;
  margin-left: auto;
  border: 1rpx solid #e2e8f0;
  
  &:active {
    background: #e2e8f0;
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
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>

<template>
  <div class="home">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else>
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="container text-center">
          <img src="@/assets/logo.svg" width="300" alt="Company Logo" class="mb-2">
          <h1 class="tagline">智能切割优化软件系统</h1>
          <p class="sub-tagline">省时省料·省钱省心，让每一次切割都物尽其用</p>
          <p class="lead mb-4">专业的门窗行业智能工具集，为中小型企业提供精准的切割优化方案</p>
        </div>
      </section>

      <!-- 工具导航区域 -->
      <section class="tools-section">
        <div class="container">
          <h2 class="text-center mb-5">专业切割优化工具</h2>
          <div class="row g-4">
            <!-- 铝钢切割优化工具卡片 -->
            <div class="col-md-6">
              <div class="tool-card card h-100">
                <div class="card-body text-center">
                  <div class="tool-icon">
                    <i class="fas fa-ruler-combined"></i>
                  </div>
                  <h3 class="card-title">型材切割优化软件</h3>
                  <ul class="tool-features">
                    <li><i class="fas fa-check text-success me-2"></i>智能排版算法，最大化材料利用率</li>
                    <li><i class="fas fa-check text-success me-2"></i>支持多种规格和材质的铝合金型材</li>
                    <li><i class="fas fa-check text-success me-2"></i>自动计算切割角度和尺寸</li>
                    <li><i class="fas fa-check text-success me-2"></i>可导出切割方案和报表</li>
                  </ul>
                  <router-link to="/plastic-steel" class="btn btn-orange">
                    开始使用 <i class="fas fa-arrow-right ms-2"></i>
                  </router-link>
                </div>
              </div>
            </div>

            <!-- 玻璃切割优化工具卡片 -->
            <div class="col-md-6">
              <div class="tool-card card h-100">
                <div class="card-body text-center">
                  <div class="tool-icon">
                    <i class="fas fa-border-all"></i>
                  </div>
                  <h3 class="card-title">板材切割优化软件</h3>
                  <ul class="tool-features">
                    <li><i class="fas fa-check text-success me-2"></i>高效的二维排版算法</li>
                    <li><i class="fas fa-check text-success me-2"></i>支持多种玻璃规格和类型</li>
                    <li><i class="fas fa-check text-success me-2"></i>智能避免应力点和危险切割</li>
                    <li><i class="fas fa-check text-success me-2"></i>可视化切割路径和方案</li>
                  </ul>
                  <router-link to="/glass" class="btn btn-orange">
                    开始使用 <i class="fas fa-arrow-right ms-2"></i>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 视频演示区域 -->
      <section class="video-demo-section py-5">
        <div class="container">
          <h2 class="text-center mb-5">产品演示视频</h2>
          <div class="video-container" ref="videoContainer">
            <video 
              ref="demoVideo"
              class="demo-video" 
              preload="metadata"
              poster="@/assets/video-poster.jpg"
              :controls="false">
              <source src="@/assets/demo.mp4" type="video/mp4">
              您的浏览器不支持视频播放。
            </video>
            <div class="video-controls" :class="{ 'controls-visible': isControlsVisible }">
              <button class="play-pause-btn" @click="togglePlay">
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>
            </div>
          </div>
          <p class="text-center mt-4">通过这个演示视频，您可以快速了解我们的智能切割优化系统如何帮助您提高工作效率</p>
        </div>
      </section>

      <!-- 创始人问答区域 -->
      <section class="founder-qa-section py-5">
        <div class="container">
          <h2 class="text-center mb-5">创始人有话说</h2>
          <div class="qa-container">
            <div class="qa-item" v-for="(qa, index) in qaList" :key="index">
              <div class="question">
                <div class="q-icon">Q</div>
                <div class="q-content">{{ qa.question }}</div>
              </div>
              <div class="answer">
                <div class="a-icon">A</div>
                <div class="a-content">{{ qa.answer }}</div>
              </div>
            </div>
          </div>
          <div class="slogan-container text-center mt-5">
            <h3 class="mb-3">「算准每一毫米，守住每一分利」</h3>
            <p class="slogan-subtitle">——为门窗人而生的智能助手，正在和你一样扎根生长。</p>
            <button class="btn btn-lg btn-orange mt-4" @click="startFreeTrial">
              免费试用基础版 <i class="fas fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- 优势展示区域 -->
      <section class="benefits-section">
        <div class="container">
          <h2 class="text-center mb-5">为什么选择我们</h2>
          <div class="row g-4">
            <div class="col-md-4">
              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <h3>提高效率</h3>
                <p>智能算法优化切割方案，显著提升材料利用率，减少浪费</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="fas fa-coins"></i>
                </div>
                <h3>降低成本</h3>
                <p>通过精确计算和智能排版，最大限度减少材料损耗，节约成本</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="benefit-item">
                <div class="benefit-icon">
                  <i class="fas fa-tools"></i>
                </div>
                <h3>易于使用</h3>
                <p>直观的操作界面，简单的使用流程，快速上手无需专业培训</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 联系信息区域 -->
      <section class="contact-section py-5">
        <div class="container">
          <div class="business-card-wrapper card p-4">
            <div class="row align-items-center">
              <div class="col-md-8">
                <div class="business-info">
                  <h3 class="company-name">智能切割优化系统</h3>
                  <div class="contact-details">
                    <p><i class="fas fa-phone"></i> 联系电话：123-456-7890</p>
                    <p><i class="fas fa-envelope"></i> 电子邮箱：contact@example.com</p>
                    <p><i class="fas fa-map-marker-alt"></i> 地址：某某省某某市某某区某某街道123号</p>
                  </div>
                  <div class="action-buttons mt-4">
                    <a href="tel:123-456-7890" class="btn btn-primary me-3">
                      <i class="fas fa-phone me-2"></i>立即咨询
                    </a>
                    <a href="mailto:contact@example.com" class="btn btn-outline-primary">
                      <i class="fas fa-envelope me-2"></i>发送邮件
                    </a>
                  </div>
                </div>
              </div>
              <div class="col-md-4 text-center">
                <div class="qr-code">
                  <img src="@/assets/qr-code.png" width="200" alt="联系我们">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(true)
const demoVideo = ref(null)
const videoContainer = ref(null)
const isPlaying = ref(false)
const isControlsVisible = ref(false)

// 问答数据
const qaList = ref([
  {
    question: "为什么选择做建材门窗行业的数字化系统？听起来很传统啊……",
    answer: "正因为传统，才更需要改变。我姐夫做了十几年塑钢门窗厂，每次看他手写算料、人工排单，错一厘米可能浪费半面墙的玻璃。国家提倡产业智能化，但小工厂连基础的数据工具都没有——我想用代码替他们'省材料、省时间、省焦虑'。"
  },
  {
    question: "你们软件现在能解决什么具体问题？",
    answer: "从最痛的'下料计算'切入。比如您要切割100根钢筋，系统会按长度智能排列，让废料最少；如果是玻璃或木板这类面积切割，算法会更复杂——我们区分了'按根'和'按块'两种模式，误差率比老师傅手算还低5%。接下来会逐步上线库存预警、手机画图下单功能，让中小厂也能像大企业一样'用数据赚钱'。"
  },
  {
    question: "大厂也在做类似系统，你们优势在哪？",
    answer: "我们不卖'万能模板'，只做'听得懂方言的软件'。这半年我跑了23家乡镇工厂，发现老板们怕的不是花钱，是怕系统太复杂、用不起来。所以我们的操作界面像'计算器'一样简单，甚至能对接他们用了十几年的Excel表格——先帮人跑起来，再带人跑得更远。"
  },
  {
    question: "听说您是技术出身？怎么会懂制造业的痛点？",
    answer: "（笑）其实是我姐夫的吐槽点醒了我。有次他凌晨三点打电话，因为切割师傅算错尺寸，整个订单要重做。我当时就想：明明有更精准的算法，为什么还在用纸笔计算？后来我带着笔记本住进车间，看着工人怎么量、怎么切、怎么骂供应商…这些细节，才是打磨产品的'秘密图纸'。"
  },
  {
    question: "对未来有什么期待？",
    answer: "希望五年后，每个县城建材店的老板打开手机就能用我们的系统——查看库存、设计门窗、一键报价。让坚持了半辈子的中小厂，不会被数字化浪潮抛下，而是用自己的经验加上我们的工具，长出新的翅膀。"
  }
])

// 免费试用功能
const startFreeTrial = () => {
  // 实现免费试用逻辑
  router.push('/auth/register')
}

// 视频播放控制
const togglePlay = () => {
  if (demoVideo.value) {
    if (demoVideo.value.paused) {
      demoVideo.value.play()
      isPlaying.value = true
    } else {
      demoVideo.value.pause()
      isPlaying.value = false
    }
  }
}

// 监听视频播放状态变化
const handleVideoStateChange = () => {
  if (demoVideo.value) {
    isPlaying.value = !demoVideo.value.paused
  }
}

// 处理视频播放结束
const handleVideoEnded = () => {
  // 检查视频是否仍在可视区域内
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && demoVideo.value) {
        // 如果视频区域可见，则重新播放
        demoVideo.value.currentTime = 0
        demoVideo.value.play()
      }
    })
    observer.disconnect() // 用完即销毁
  }, {
    threshold: 0.5
  })

  if (videoContainer.value) {
    observer.observe(videoContainer.value)
  }
}

// 创建交叉观察器
let observer = null

onMounted(() => {
  // 模拟内容加载
  setTimeout(() => {
    loading.value = false
  }, 500)

  // 添加视频事件监听
  if (demoVideo.value) {
    demoVideo.value.addEventListener('play', handleVideoStateChange)
    demoVideo.value.addEventListener('pause', handleVideoStateChange)
    demoVideo.value.addEventListener('ended', handleVideoEnded)
  }

  // 创建交叉观察器
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 视频进入视口
        if (demoVideo.value && demoVideo.value.paused) {
          demoVideo.value.play()
        }
      } else {
        // 视频离开视口
        if (demoVideo.value && !demoVideo.value.paused) {
          demoVideo.value.pause()
        }
      }
    })
  }, {
    threshold: 0.5 // 当视频元素50%可见时触发
  })

  // 开始观察视频元素
  if (videoContainer.value) {
    observer.observe(videoContainer.value)
  }
})

onUnmounted(() => {
  // 清理事件监听
  if (demoVideo.value) {
    demoVideo.value.removeEventListener('play', handleVideoStateChange)
    demoVideo.value.removeEventListener('pause', handleVideoStateChange)
    demoVideo.value.removeEventListener('ended', handleVideoEnded)
  }

  // 停止观察
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.home {
  min-height: calc(100vh - 60px); /* 减去头部导航的高度 */
  display: flex;
  flex-direction: column;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 60px);
  background: var(--light-bg);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(52, 152, 219, 0.1);
  border-radius: 50%;
  border-top-color: var(--secondary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.hero-section {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  padding: 8rem 0;
  position: relative;
  overflow: hidden;
  flex: 0 0 auto;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='rgba(255,255,255,0.05)' fill-rule='evenodd'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.hero-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(to bottom right, transparent 49%, var(--light-bg) 50%);
}

.tagline {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
  letter-spacing: -1px;
  line-height: 1.2;
}

.sub-tagline {
  font-size: 1.4rem;
  opacity: 0.95;
  margin-bottom: 3rem;
  font-weight: 300;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.tools-section {
  padding: 8rem 0;
  background: var(--light-bg);
  position: relative;
  overflow: hidden;
  flex: 1 0 auto;
}

.tools-section::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: radial-gradient(circle at center, rgba(48,79,254,0.05) 0%, transparent 70%);
}

.benefit-item {
  text-align: center;
  padding: 3rem 2rem;
  border-radius: 16px;
  transition: all 0.3s ease;
  background: white;
  box-shadow: var(--card-shadow);
  position: relative;
  overflow: hidden;
}

.benefit-item::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(26,35,126,0.05) 0%, rgba(48,79,254,0.05) 100%);
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.benefit-item:hover {
  transform: var(--hover-transform);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

.benefit-item:hover::before {
  opacity: 1;
}

.benefit-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--secondary-color) 0%, var(--gradient-end) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.benefit-item h3 {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.benefit-item p {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.contact-section {
  padding: 8rem 0;
  background: var(--light-bg);
  position: relative;
  overflow: hidden;
  flex: 0 0 auto;
}

.business-card-wrapper {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
  position: relative;
}

.business-card-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(135deg, rgba(26,35,126,0.02) 0%, rgba(48,79,254,0.02) 100%);
  z-index: 0;
}

.company-name {
  font-size: 2rem;
  color: var(--primary-color);
  margin-bottom: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.contact-details {
  margin-bottom: 2rem;
}

.contact-details p {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #666;
}

.contact-details i {
  font-size: 1.2rem;
  color: var(--secondary-color);
  width: 24px;
  text-align: center;
}

.qr-code {
  padding: 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.qr-code:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.15);
}

@media (max-width: 768px) {
  .tagline {
    font-size: 2.5rem;
  }

  .sub-tagline {
    font-size: 1.2rem;
  }

  .hero-section {
    padding: 6rem 0;
  }

  .tools-section {
    padding: 4rem 0;
  }

  .benefit-item {
    padding: 2rem;
  }

  .company-name {
    font-size: 1.8rem;
  }
}

.btn-orange {
  background-color: #ff6b00;
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-orange:hover {
  background-color: #ff8533;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 0, 0.3);
}

.tool-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  text-align: center;
}

.tool-features li {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-features li i {
  font-size: 1rem;
  color: #28a745;
  flex-shrink: 0;
}

.tool-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0396FF 0%, #0D47A1 100%);
  box-shadow: 0 10px 20px rgba(3, 150, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tool-icon::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, 
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.1) 50%,
    rgba(255,255,255,0) 100%);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

.tool-icon i {
  font-size: 3.5rem;
  color: white;
  transform: translateY(0);
  transition: all 0.3s ease;
}

.tool-card:hover .tool-icon {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(3, 150, 255, 0.3);
}

.tool-card:hover .tool-icon i {
  transform: scale(1.1);
}

@keyframes shine {
  0% {
    left: -50%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    left: 150%;
    opacity: 0;
  }
}

.tool-card {
  border: none;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.card-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.video-demo-section {
  background: var(--light-bg);
  position: relative;
}

.video-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.demo-video {
  width: 100%;
  display: block;
  aspect-ratio: 16/9;
  background: #000;
}

/* 视频控制器样式 */
.video-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.video-container:hover .video-controls {
  opacity: 1;
}

.play-pause-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.play-pause-btn:hover {
  background: #fff;
  transform: scale(1.1);
}

.play-pause-btn i {
  font-size: 24px;
  color: #333;
}

@media (max-width: 768px) {
  .video-container {
    margin: 0 15px;
  }
  
  .play-pause-btn {
    width: 50px;
    height: 50px;
  }
  
  .play-pause-btn i {
    font-size: 20px;
  }
}

.founder-qa-section {
  background-color: #f8f9fa;
  padding: 4rem 0;
}

.qa-container {
  max-width: 900px;
  margin: 0 auto;
}

.qa-item {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.qa-item:hover {
  transform: translateY(-5px);
}

.question, .answer {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.answer {
  margin-top: 1.5rem;
}

.q-icon, .a-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.q-icon {
  background-color: #e9ecef;
  color: #495057;
}

.a-icon {
  background-color: #ff6b35;
  color: white;
}

.q-content {
  font-size: 1.1rem;
  font-weight: 600;
  color: #343a40;
}

.a-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #495057;
}

.slogan-container {
  margin-top: 4rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.slogan-container h3 {
  font-size: 1.8rem;
  color: #ff6b35;
  font-weight: bold;
}

.slogan-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.btn-orange {
  background-color: #ff6b35;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-orange:hover {
  background-color: #ff5a1f;
  transform: translateY(-2px);
}
</style> 
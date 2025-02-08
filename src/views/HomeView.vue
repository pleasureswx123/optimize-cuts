<template>
  <div class="home">
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
                  <i class="fas fa-window-maximize"></i>
                </div>
                <h3 class="card-title">铝钢切割优化软件</h3>
                <ul class="tool-features">
                  <li>智能排版算法，最大化材料利用率</li>
                  <li>支持多种规格和材质的铝合金型材</li>
                  <li>自动计算切割角度和尺寸</li>
                  <li>可导出切割方案和报表</li>
                </ul>
                <router-link to="/plastic-steel" class="btn btn-primary">
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
                  <i class="fas fa-clone"></i>
                </div>
                <h3 class="card-title">玻璃切割优化软件</h3>
                <ul class="tool-features">
                  <li>高效的二维排版算法</li>
                  <li>支持多种玻璃规格和类型</li>
                  <li>智能避免应力点和危险切割</li>
                  <li>可视化切割路径和方案</li>
                </ul>
                <router-link to="/glass" class="btn btn-primary">
                  开始使用 <i class="fas fa-arrow-right ms-2"></i>
                </router-link>
              </div>
            </div>
          </div>
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
</template>

<script setup>
// 组件逻辑
</script>

<style scoped>
.hero-section {
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  color: white;
  padding: 8rem 0;
  position: relative;
  overflow: hidden;
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
  position: relative;
  z-index: 1;
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
</style> 
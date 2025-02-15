<template>
  <div class="contact-page">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">联系我们</h1>
        <p class="page-description">如果您有任何问题或建议，欢迎随时与我们联系</p>
      </div>
    </div>

    <div class="container">
      <div class="contact-content">
        <!-- 联系信息卡片 -->
        <div class="row">
          <div class="col-md-4">
            <div class="contact-card">
              <div class="card-icon">
                <i class="fas fa-phone-alt"></i>
              </div>
              <h3>电话咨询</h3>
              <p>工作时间：周一至周五 9:00-18:00</p>
              <a href="tel:123-456-7890" class="contact-link">123-456-7890</a>
            </div>
          </div>
          <div class="col-md-4">
            <div class="contact-card">
              <div class="card-icon">
                <i class="fas fa-envelope"></i>
              </div>
              <h3>电子邮件</h3>
              <p>我们将在24小时内回复您的邮件</p>
              <a href="mailto:contact@example.com" class="contact-link">contact@example.com</a>
            </div>
          </div>
          <div class="col-md-4">
            <div class="contact-card">
              <div class="card-icon">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <h3>公司地址</h3>
              <p>欢迎前来参观交流</p>
              <address class="contact-link">某某省某某市某某区某某街道123号</address>
            </div>
          </div>
        </div>

        <!-- 留言表单和社交媒体 -->
        <div class="row mt-5">
          <div class="col-lg-8">
            <div class="contact-form-card">
              <h2 class="section-title">在线留言</h2>
              <form class="contact-form" @submit.prevent="submitForm">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">姓名</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="form.name"
                      required
                      placeholder="请输入您的姓名"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">电话</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      v-model="form.phone"
                      required
                      placeholder="请输入您的联系电话"
                    >
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">邮箱</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    v-model="form.email"
                    required
                    placeholder="请输入您的电子邮箱"
                  >
                </div>
                <div class="mb-3">
                  <label class="form-label">留言内容</label>
                  <textarea 
                    class="form-control" 
                    v-model="form.message"
                    rows="5"
                    required
                    placeholder="请输入您的留言内容"
                  ></textarea>
                </div>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-paper-plane me-2"></i>提交留言
                </button>
              </form>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="social-card">
              <h2 class="section-title">关注我们</h2>
              <div class="qr-code-section">
                <img src="@/assets/qr-code.png" alt="微信二维码" class="qr-code">
                <p class="qr-tip">扫描二维码关注公众号</p>
              </div>
              <div class="social-links">
                <a href="#" class="social-link" title="微信">
                  <i class="fab fa-weixin"></i>
                </a>
                <a href="#" class="social-link" title="QQ">
                  <i class="fab fa-qq"></i>
                </a>
                <a href="#" class="social-link" title="微博">
                  <i class="fab fa-weibo"></i>
                </a>
              </div>
              <div class="business-hours">
                <h3>工作时间</h3>
                <ul class="hours-list">
                  <li>
                    <span class="day">周一至周五</span>
                    <span class="time">9:00 - 18:00</span>
                  </li>
                  <li>
                    <span class="day">周六</span>
                    <span class="time">9:30 - 17:00</span>
                  </li>
                  <li>
                    <span class="day">周日</span>
                    <span class="time">休息</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  phone: '',
  email: '',
  message: ''
})

const submitForm = async () => {
  try {
    // TODO: 实现表单提交逻辑
    console.log('表单数据：', form.value)
    alert('感谢您的留言，我们会尽快与您联系！')
    // 重置表单
    form.value = {
      name: '',
      phone: '',
      email: '',
      message: ''
    }
  } catch (error) {
    console.error('提交表单时出错：', error)
    alert('提交失败，请稍后重试')
  }
}
</script>

<style scoped>
.contact-page {
  padding-bottom: 4rem;
}

.page-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  padding: 4rem 0;
  margin-bottom: 4rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.page-description {
  font-size: 1.2rem;
  opacity: 0.9;
}

.contact-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  height: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 64px;
  height: 64px;
  background: var(--light-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.card-icon i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.contact-card h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.contact-card p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.contact-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  display: block;
}

.contact-form-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.social-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
  position: relative;
  padding-bottom: 1rem;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: var(--primary-color);
  border-radius: 3px;
}

.qr-code-section {
  text-align: center;
  margin-bottom: 2rem;
}

.qr-code {
  width: 200px;
  height: 200px;
  margin-bottom: 1rem;
}

.qr-tip {
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.social-link {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--light-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-3px);
}

.business-hours {
  background: var(--light-bg);
  border-radius: 8px;
  padding: 1.5rem;
}

.business-hours h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.hours-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hours-list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.hours-list li:last-child {
  border-bottom: none;
}

.hours-list .day {
  color: var(--text-secondary);
}

.hours-list .time {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .page-header {
    padding: 3rem 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .contact-card {
    margin-bottom: 1.5rem;
  }

  .social-card {
    margin-top: 1.5rem;
  }
}
</style> 
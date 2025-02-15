<template>
  <div class="app">
    <header class="main-header">
      <div class="container">
        <div class="header-content">
          <div class="brand-area">
            <div class="brand-logo">
              <i class="fas fa-cut"></i>
            </div>
            <div class="brand-text">
              <h1>智能切割优化系统</h1>
              <div class="brand-slogan">让每一次切割都物尽其用</div>
            </div>
          </div>
          <nav class="nav-area">
            <router-link to="/" class="nav-link" active-class="active">
              <i class="fas fa-home"></i>
              <span>首页</span>
            </router-link>
            <router-link to="/plastic-steel" class="nav-link" active-class="active">
              <i class="fas fa-window-maximize"></i>
              <span>型材切割优化</span>
            </router-link>
            <router-link to="/glass" class="nav-link" active-class="active">
              <i class="fas fa-clone"></i>
              <span>板材切割优化</span>
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="page-transition-wrapper">
        <router-view v-slot="{ Component }">
          <transition 
            name="page" 
            mode="out-in"
            @before-leave="beforeLeave"
            @enter="enter"
            @after-enter="afterEnter"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <footer class="main-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section about">
            <h3>关于我们</h3>
            <p>专注于为门窗行业提供智能切割优化解决方案，致力于提高材料利用率，降低生产成本。</p>
            <div class="social-links">
              <a href="#" class="social-link"><i class="fab fa-weixin"></i></a>
              <a href="#" class="social-link"><i class="fab fa-qq"></i></a>
              <a href="#" class="social-link"><i class="fab fa-weibo"></i></a>
            </div>
          </div>
          <div class="footer-section contact">
            <h3>联系方式</h3>
            <ul>
              <li>
                <i class="fas fa-phone"></i>
                <span>电话：123-456-7890</span>
              </li>
              <li>
                <i class="fas fa-envelope"></i>
                <span>邮箱：contact@example.com</span>
              </li>
              <li>
                <i class="fas fa-map-marker-alt"></i>
                <span>地址：某某省某某市某某区</span>
              </li>
            </ul>
          </div>
          <div class="footer-section links">
            <h3>快速链接</h3>
            <ul>
              <li><router-link to="/">首页</router-link></li>
              <li><router-link to="/plastic-steel">型材切割优化</router-link></li>
              <li><router-link to="/glass">板材切割优化</router-link></li>
              <li><router-link to="/contact">联系我们</router-link></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ new Date().getFullYear() }} 智能切割优化系统. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const beforeLeave = (el) => {
  el.style.height = el.offsetHeight + 'px'
  el.style.overflow = 'hidden'
}

const enter = (el) => {
  el.style.height = 'auto'
  const height = el.offsetHeight + 'px'
  el.style.height = '0'
  setTimeout(() => {
    el.style.height = height
  }, 0)
}

const afterEnter = (el) => {
  el.style.height = 'auto'
  el.style.overflow = 'visible'
}
</script>

<style>
* {
  box-sizing: border-box;
}
.row {
  margin-right: 0!important;
}
.main-content {
  flex: 1;
  background: var(--light-bg);
  min-height: calc(100vh - var(--header-height));
}

.page-transition-wrapper {
  margin: 0 auto;
}

.page-enter-active,
.page-leave-active {
  transition: all var(--transition-speed) ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.social-links {
  display: flex;
  gap: calc(var(--spacing-unit) * 2);
  margin-top: calc(var(--spacing-unit) * 2);
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all var(--transition-speed) ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.footer-section.about {
  max-width: 400px;
}

.footer-section.contact ul li {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) * 1.5);
}

.footer-section.contact ul li i {
  width: 20px;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: calc(var(--spacing-unit) * 4);
  }
  
  .footer-section.about {
    max-width: 100%;
  }
}
</style> 
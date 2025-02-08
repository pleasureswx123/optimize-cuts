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
              首页
            </router-link>
            <router-link to="/plastic-steel" class="nav-link" active-class="active">
              <i class="fas fa-window-maximize"></i>
              门窗切割优化
            </router-link>
            <router-link to="/glass" class="nav-link" active-class="active">
              <i class="fas fa-clone"></i>
              玻璃切割优化
            </router-link>
          </nav>
        </div>
      </div>
    </header>

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="main-footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>关于我们</h3>
            <p>专注于为门窗行业提供智能切割优化解决方案</p>
          </div>
          <div class="footer-section">
            <h3>联系方式</h3>
            <ul>
              <li><i class="fas fa-phone"></i> 电话：123-456-7890</li>
              <li><i class="fas fa-envelope"></i> 邮箱：contact@example.com</li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>快速链接</h3>
            <ul>
              <li><router-link to="/">首页</router-link></li>
              <li><router-link to="/plastic-steel">门窗切割优化</router-link></li>
              <li><router-link to="/glass">玻璃切割优化</router-link></li>
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
// 组件逻辑
</script>

<style>
/* 全局样式将放在 src/styles/main.css 中 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 
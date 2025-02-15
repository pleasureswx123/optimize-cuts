import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/plastic-steel',
      name: 'plastic-steel',
      component: () => import('../views/PlasticSteelView.vue')
    },
    {
      path: '/glass',
      name: 'glass',
      component: () => import('../views/GlassView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router 
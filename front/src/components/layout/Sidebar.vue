<template>
  <aside class="sidebar">
    <div class="sidebar-top">
      <div class="logo">
        <SvgIcon name="icon-dashboard" size="24px" />
      </div>

      <nav class="nav-links">
        <RouterLink to="/" class="nav-item" :class="{ active: route.name === 'dashboard' }">
          <SvgIcon name="icon-home" size="20px" />
        </RouterLink>
        <RouterLink to="/passwords" class="nav-item" :class="{ active: route.name === 'passwords' }">
          <SvgIcon name="lucide:lock-keyhole" size="20px" />
        </RouterLink>
        <a href="#" class="nav-item">
          <SvgIcon name="icon-grid" size="20px" />
        </a>
        <div class="divider"></div>
        <button class="add-btn">
          <SvgIcon name="icon-add" size="20px" color="#fff" />
        </button>
      </nav>
    </div>

    <div class="sidebar-bottom">
      <a href="#" class="nav-item">
        <SvgIcon name="icon-settings" size="20px" />
      </a>
      <a href="#" class="nav-item">
        <SvgIcon name="icon-help" size="20px" />
      </a>
      <div class="avatar">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ocean" alt="Avatar" />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import SvgIcon from '../SvgIcon.vue'

const route = useRoute()
</script>

<style scoped>
.sidebar {
  width: 80px;
  height: 100vh;
  background-color: var(--bg-main);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 30px 0;
  border-right: 1px solid var(--border-color);
}

.sidebar-top, .sidebar-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logo {
  color: var(--primary);
  margin-bottom: 20px;
  background: rgba(108, 92, 231, 0.1);
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.nav-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.nav-item:hover, .nav-item.active {
  color: var(--primary);
  background-color: rgba(108, 92, 231, 0.1);
}

.divider {
  width: 24px;
  height: 1px;
  background-color: var(--border-color);
  margin: 10px 0;
}

.add-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform var(--transition-fast);
}

.add-btn:hover {
  transform: scale(1.05);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #fff;
  box-shadow: var(--shadow-sm);
  background: linear-gradient(135deg, #a8c0ff, #3f2b96);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>

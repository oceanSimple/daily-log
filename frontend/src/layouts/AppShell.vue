<template>
  <div class="app-shell">
    <AppSidebar :items="navItems" />
    <div class="app-shell__content">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue';

const navItems = [
  {
    label: 'Dashboard',
    note: '今天的节奏、截止和记录入口',
    to: '/',
  },
  {
    label: 'Day Log',
    note: '按天聚合日记、总结、任务与日程',
    to: '/day/2026-05-07',
  },
  {
    label: 'Calendar',
    note: '按日与按周查看时间安排',
    to: '/calendar',
  },
  {
    label: 'Tasks',
    note: '轻量任务系统，聚焦今日与临近截止',
    to: '/tasks',
  },
  {
    label: 'Journal',
    note: '浏览历史记录与每日总结归档',
    to: '/journal',
  },
];
</script>

<style scoped>
.app-shell {
  display: grid;
  min-height: calc(100vh - 32px);
  grid-template-columns: 296px minmax(0, 1fr);
  margin: 16px;
  border: 1px solid rgba(255, 255, 255, 0.52);
  border-radius: 24px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.28), rgba(255, 255, 255, 0.12)),
    rgba(245, 248, 252, 0.48);
  box-shadow: var(--shadow-strong);
  backdrop-filter: blur(28px) saturate(140%);
  overflow: hidden;
}

.app-shell__content {
  min-width: 0;
  padding: 32px 34px 40px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.08));
}

@media (max-width: 900px) {
  .app-shell {
    min-height: 100vh;
    margin: 0;
    border: 0;
    border-radius: 0;
    box-shadow: none;
    backdrop-filter: none;
    grid-template-columns: 1fr;
  }

  .app-shell__content {
    padding: 20px 16px 32px;
  }
}
</style>

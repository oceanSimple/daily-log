import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

import AppShell from '@/layouts/AppShell.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppShell,
    children: [
      {
        path: '',
        redirect: '/calendar',
      },
      {
        path: 'day/:date',
        name: 'day-log',
        component: () => import('@/views/DayLogView.vue'),
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@/views/CalendarView.vue'),
      },
      {
        path: 'tasks/:date?',
        name: 'tasks',
        component: () => import('@/views/TasksView.vue'),
      },
      {
        path: 'journal',
        name: 'journal',
        component: () => import('@/views/JournalArchiveView.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

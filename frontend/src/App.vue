<template>
  <n-config-provider :theme-overrides="naiveThemeOverrides">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui';

import { naiveThemeOverrides } from '@/styles/naiveTheme';
</script>

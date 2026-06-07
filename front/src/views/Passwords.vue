<template>
  <div class="passwords-page">
    <Sidebar />
    <main class="main-content">
      <PasswordPanel />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import PasswordPanel from '@/components/password/PasswordPanel.vue'
</script>

<style scoped>
.passwords-page {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
}
</style>

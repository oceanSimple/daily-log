<template>
  <header class="header">
    <div class="header-content">
      <div class="title-section">
        <h1>Today</h1>
        <div class="date-weather">
          <span>{{ currentDate }}</span>
          <span class="weather">
            <SvgIcon name="icon-sun" color="#FFA500" />
            18°C · 晴朗
          </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SvgIcon from '../SvgIcon.vue'

const currentDate = computed(() => {
  const d = new Date()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const day = days[d.getDay()]
  return `${month}月${date}日，${day}`
})
</script>

<style scoped>
.header {
  position: relative;
  padding: 40px 60px 20px 40px;
}


.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-section h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
  letter-spacing: 1px;
  line-height: 1.2;
  text-shadow: 0 1px 4px rgba(255, 255, 255, 0.8);
}

.date-weather {
  display: flex;
  align-items: center;
  gap: 20px;
  color: var(--text-regular);
  font-size: 14px;
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
}

.weather {
  display: flex;
  align-items: center;
  gap: 6px;
}

</style>

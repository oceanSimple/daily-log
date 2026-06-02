<template>
  <Icon :icon="realIconName" :style="{ color: color, fontSize: size }" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: String, default: '1em' },
  color: { type: String, default: 'currentColor' }
})

const iconMap: Record<string, string> = {
  'icon-dashboard': 'lucide:layout-dashboard',
  'icon-home': 'lucide:home',
  'icon-check-circle': 'lucide:check-circle',
  'icon-grid': 'lucide:grid',
  'icon-add': 'lucide:plus',
  'icon-settings': 'lucide:settings',
  'icon-help': 'lucide:help-circle',
  'icon-sun': 'lucide:sun',
  'icon-clock': 'lucide:clock',
  'icon-check': 'lucide:check',
  'icon-warning': 'lucide:alert-triangle',
  'icon-arrow-down': 'lucide:chevron-down',
  'icon-calendar': 'lucide:calendar',
  'icon-plant': 'lucide:leaf',
  'icon-mail': 'lucide:mail',
  'icon-document': 'lucide:file-text',
  'icon-todo': 'lucide:check-square',
  'icon-pen': 'lucide:pen-square',
  'icon-close': 'lucide:x',
  'icon-calendar-add': 'lucide:calendar-plus',
  'icon-type': 'lucide:type',
  'icon-clock-end': 'lucide:clock',
  'icon-arrow-right': 'lucide:arrow-right'
}

const realIconName = computed(() => {
  if (props.name.includes(':')) {
    return props.name
  }
  return iconMap[props.name] || 'lucide:help-circle'
})
</script>

<style scoped>
svg {
  display: inline-block;
  vertical-align: middle;
}
</style>

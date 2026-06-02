<template>
  <div class="essay-panel">
    <div class="panel-header flex-between">
      <div class="title flex-center">
        <SvgIcon name="icon-pen" size="20px" color="var(--primary)" />
        <h2>随笔</h2>
      </div>
      
      <div class="tabs-and-add">
        <button class="add-icon-btn" @click="showAddModal = true">
          <SvgIcon name="icon-add" size="18px" />
        </button>
      </div>
    </div>
    
    <div class="essay-grid">
      <EssayCard 
        v-for="essay in essays" 
        :key="essay.id" 
        :essay="essay" 
        @delete="$emit('delete', essay.id)"
      />
      <div v-if="essays.length === 0" class="empty-state">
        暂无随笔
      </div>
    </div>

    <AddEssayModal v-model="showAddModal" @save="handleAddEssay" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SvgIcon from '../SvgIcon.vue'
import EssayCard from './EssayCard.vue'
import AddEssayModal from './AddEssayModal.vue'
import type { Essay } from '../../types'

const props = defineProps<{
  essays: Essay[]
}>()

const emit = defineEmits(['add', 'delete'])

const showAddModal = ref(false)

const handleAddEssay = (data: any) => {
  emit('add', data)
}
</script>

<style scoped>
.essay-panel {
  margin-top: 24px;
}

.panel-header {
  margin-bottom: 20px;
}

.title {
  gap: 10px;
}

.title h2 {
  font-size: 18px;
  font-weight: 600;
}

.tabs-and-add {
  display: flex;
  align-items: center;
  gap: 16px;
}

.add-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  transition: all var(--transition-fast);
}

.add-icon-btn:hover {
  background: var(--primary);
  color: #fff;
}

.essay-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.empty-state {
  grid-column: span 2;
  text-align: center;
  color: var(--text-secondary);
  padding: 40px 0;
}
</style>

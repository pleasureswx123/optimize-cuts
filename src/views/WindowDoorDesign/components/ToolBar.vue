<!-- src/views/WindowDoorDesign/components/ToolBar.vue -->
<template>
  <div class="tool-bar">
    <el-tooltip v-for="tool in tools" :key="tool.id" :content="tool.name" placement="bottom" :show-after="500">
      <div class="tool-item" :class="{ active: activeToolId === tool.id }" @click="$emit('tool-click', tool.id)">
        <Icon :icon="tool.icon" width="24" height="24" />
        <span class="tool-name">{{ tool.name }}</span>
      </div>
    </el-tooltip>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

defineProps({
  tools: {
    type: Array,
    required: true
  },
  activeToolId: {
    type: String,
    default: null
  }
});

defineEmits(['tool-click']);
</script>

<style lang="scss" scoped>
.tool-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .tool-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin: 0 4px;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    &.active {
      background-color: #e6f1fc;
      color: #409eff;
    }
    
    .tool-name {
      font-size: 12px;
      line-height: 1.2;
      text-align: center;
      margin-top: 4px;
    }
  }
}
</style> 
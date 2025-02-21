<!-- src/views/WindowDoorDesign/components/BottomBar.vue -->
<template>
  <div class="bottom-bar">
    <div class="left-section">
      <el-button type="primary" @click="$emit('settings')">
        <el-icon><Setting /></el-icon>
        画图设置
      </el-button>
      <el-button type="primary" @click="$emit('template')">
        <el-icon><Files /></el-icon>
        选择模板
      </el-button>
    </div>
    
    <div class="right-section">
      <el-button type="success" @click="$emit('save')">
        <el-icon><Download /></el-icon>
        保存仅图
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Setting, Files, Download } from '@element-plus/icons-vue';

defineEmits(['settings', 'template', 'save']);
</script>

<style lang="scss" scoped>
.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  
  .left-section, .right-section {
    display: flex;
    gap: 12px;
  }
  
  :deep(.el-button) {
    display: flex;
    align-items: center;
    
    .el-icon {
      margin-right: 4px;
    }
  }
}
</style> 
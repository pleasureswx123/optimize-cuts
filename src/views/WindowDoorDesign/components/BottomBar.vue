<!-- src/views/WindowDoorDesign/components/BottomBar.vue -->
<template>
  <div class="bottom-bar">
    <div class="right-section">
      <el-button type="success" @click="$emit('save')">
        <el-icon><Download /></el-icon>
        保存设计
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Download } from '@element-plus/icons-vue';

defineEmits(['save']);
</script>

<style lang="scss" scoped>
.bottom-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  
  .right-section {
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
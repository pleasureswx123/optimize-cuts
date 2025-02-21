<!-- src/views/WindowDoorDesign/components/SettingsForm.vue -->
<template>
  <el-form
    :model="formData"
    label-width="120px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="网格大小">
      <el-input-number
        v-model="formData.gridSize"
        :min="10"
        :max="100"
        :step="10"
      />
    </el-form-item>
    
    <el-form-item label="吸附到网格">
      <el-switch v-model="formData.snapToGrid" />
    </el-form-item>
    
    <el-form-item label="显示尺寸标注">
      <el-switch v-model="formData.showDimensions" />
    </el-form-item>
    
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">保存设置</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:settings']);

const formData = ref({ ...props.settings });

watch(() => props.settings, (newSettings) => {
  formData.value = { ...newSettings };
}, { deep: true });

const handleSubmit = () => {
  emit('update:settings', { ...formData.value });
};

const resetForm = () => {
  formData.value = { ...props.settings };
};
</script>

<style lang="scss" scoped>
.el-form {
  padding: 20px;
  
  .el-form-item:last-child {
    margin-bottom: 0;
    
    :deep(.el-form-item__content) {
      justify-content: flex-end;
      margin-left: 0 !important;
      
      .el-button {
        margin-left: 12px;
        
        &:first-child {
          margin-left: 0;
        }
      }
    }
  }
}
</style> 
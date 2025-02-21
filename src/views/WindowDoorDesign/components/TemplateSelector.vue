<!-- src/views/WindowDoorDesign/components/TemplateSelector.vue -->
<template>
  <div class="template-selector">
    <el-row :gutter="16">
      <el-col
        v-for="template in templates"
        :key="template.id"
        :span="8"
      >
        <div
          class="template-card"
          :class="{ active: selectedId === template.id }"
          @click="selectTemplate(template)"
        >
          <div class="template-thumbnail">
            <img :src="template.thumbnail" :alt="template.name">
          </div>
          <div class="template-info">
            <div class="template-name">{{ template.name }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
    
    <div class="template-actions">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button
        type="primary"
        :disabled="!selectedId"
        @click="confirmSelection"
      >
        确定
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  templates: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['select', 'cancel']);

const selectedId = ref(null);

const selectTemplate = (template) => {
  selectedId.value = template.id;
};

const confirmSelection = () => {
  const selected = props.templates.find(t => t.id === selectedId.value);
  if (selected) {
    emit('select', selected);
  }
};
</script>

<style lang="scss" scoped>
.template-selector {
  .template-card {
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 16px;
    
    &:hover {
      border-color: #dcdfe6;
    }
    
    &.active {
      border-color: #409eff;
    }
    
    .template-thumbnail {
      width: 100%;
      height: 160px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .template-info {
      padding: 12px;
      background-color: #f5f7fa;
      
      .template-name {
        font-size: 14px;
        font-weight: 500;
        text-align: center;
      }
    }
  }
  
  .template-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e0e0e0;
  }
}
</style> 
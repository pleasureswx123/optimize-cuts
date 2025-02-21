<template>
  <div class="side-panel">
    <el-collapse v-model="activeCategories" accordion>
      <el-collapse-item
        v-for="category in categories"
        :key="category.id"
        :title="category.name"
        :name="category.id"
      >
        <div class="category-content">
          <div
            v-for="item in category.items"
            :key="item.id"
            class="category-item"
            @click="$emit('category-select', item)"
          >
            <div class="item-thumbnail">
              <img :src="item.thumbnail" :alt="item.name">
            </div>
            <div class="item-info">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-dimensions">
                {{ item.dimensions.width }} x {{ item.dimensions.height }}
              </div>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  categories: {
    type: Array,
    required: true
  }
});

defineEmits(['category-select']);

const activeCategories = ref(['default']);
</script>

<style lang="scss" scoped>
.side-panel {
  width: 280px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  
  :deep(.el-collapse) {
    border: none;
    
    .el-collapse-item__header {
      padding: 16px;
      font-size: 16px;
      font-weight: 500;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .el-collapse-item__content {
      padding: 0;
    }
  }
  
  .category-content {
    padding: 16px;
  }
  
  .category-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: #f5f7fa;
    }
    
    .item-thumbnail {
      width: 80px;
      height: 80px;
      margin-right: 12px;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid #e0e0e0;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .item-info {
      flex: 1;
      
      .item-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }
      
      .item-dimensions {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style> 
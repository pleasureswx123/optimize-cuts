<template>
  <div class="window-door-design">
    <!-- 顶部工具栏 -->
    <ToolBar 
      :tools="tools"
      :activeToolId="activeToolId"
      @tool-click="handleToolClick"
    />
    
    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <SidePanel 
        :categories="categories"
        @category-select="handleCategorySelect"
      />
      
      <!-- 画布区域 -->
      <div class="canvas-container">
        <canvas id="mainCanvas"></canvas>
        <!-- 右上角操作按钮组 -->
        <div class="operation-buttons">
          <el-button-group>
            <el-button 
              type="primary" 
              :icon="Refresh"
              @click="handleUndo"
              :disabled="!canUndo"
            >撤销</el-button>
            <el-button 
              type="primary" 
              :icon="RefreshRight"
              @click="handleRedo"
              :disabled="!canRedo"
            >恢复</el-button>
            <el-button 
              type="danger" 
              :icon="Delete"
              @click="handleDelete"
              :disabled="!hasSelection"
            >删除</el-button>
            <el-button 
              type="warning" 
              :icon="RemoveFilled"
              @click="handleClear"
            >清空</el-button>
          </el-button-group>
        </div>
      </div>
    </div>
    
    <!-- 底部工具栏 -->
    <BottomBar
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Refresh, RefreshRight, Delete, RemoveFilled } from '@element-plus/icons-vue';
import ToolBar from './components/ToolBar.vue';
import SidePanel from './components/SidePanel.vue';
import BottomBar from './components/BottomBar.vue';
import { useWindowDoorDesign } from './composables/useWindowDoorDesign';
import { useHistory } from './composables/useHistory';
import { TOOLS, CATEGORIES } from './constants';

// 状态定义
const canvas = ref(null);
const activeToolId = ref(null);
const hasSelection = ref(false);

// 使用组合式函数
const {
  initCanvas,
  deleteSelected,
  clearCanvas,
  saveDesign,
  setActiveTool
} = useWindowDoorDesign(canvas);

const {
  canUndo,
  canRedo,
  recordState,
  undo,
  redo,
} = useHistory();

// 工具和分类数据
const tools = TOOLS;
const categories = CATEGORIES;

// 事件处理函数
const handleToolClick = (toolId) => {
  activeToolId.value = toolId;
  setActiveTool(toolId);
};

const handleCategorySelect = (categoryId) => {
  // 处理分类选择
};

const handleUndo = () => {
  const state = undo();
  if (state) {
    canvas.value.loadFromJSON(state);
  }
};

const handleRedo = () => {
  const state = redo();
  if (state) {
    canvas.value.loadFromJSON(state);
  }
};

const handleDelete = () => {
  deleteSelected();
  recordState(canvas.value.toJSON());
};

const handleClear = () => {
  clearCanvas();
  recordState(canvas.value.toJSON());
};

const handleSave = async () => {
  try {
    await saveDesign();
    ElMessage.success('保存成功');
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

// 生命周期钩子
onMounted(() => {
  initCanvas();
  
  // 监听选择变化
  canvas.value.on('selection:created', () => hasSelection.value = true);
  canvas.value.on('selection:cleared', () => hasSelection.value = false);
  
  // 监听对象修改以记录历史
  canvas.value.on('object:modified', () => {
    recordState(canvas.value.toJSON());
  });
});

onUnmounted(() => {
  canvas.value?.dispose();
});
</script>

<style lang="scss" scoped>
.window-door-design {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  
  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    
    .canvas-container {
      flex: 1;
      position: relative;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      margin: 16px;
      border-radius: 8px;
      overflow: hidden;
      
      canvas {
        width: 100%;
        height: 100%;
      }
      
      .operation-buttons {
        position: absolute;
        top: 16px;
        right: 16px;
        z-index: 100;
      }
    }
  }
}
</style> 
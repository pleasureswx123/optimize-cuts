import { ref, computed } from 'vue';

export function useHistory(maxHistory = 50) {
  const history = ref([]);
  const currentIndex = ref(-1);
  
  const canUndo = computed(() => currentIndex.value > 0);
  const canRedo = computed(() => currentIndex.value < history.value.length - 1);
  
  const recordState = (state) => {
    // 移除当前位置之后的历史记录
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1);
    }
    
    // 添加新状态
    history.value.push(JSON.stringify(state));
    currentIndex.value++;
    
    // 如果历史记录超过最大限制，删除最早的记录
    if (history.value.length > maxHistory) {
      history.value.shift();
      currentIndex.value--;
    }
  };
  
  const undo = () => {
    if (!canUndo.value) return null;
    
    currentIndex.value--;
    return JSON.parse(history.value[currentIndex.value]);
  };
  
  const redo = () => {
    if (!canRedo.value) return null;
    
    currentIndex.value++;
    return JSON.parse(history.value[currentIndex.value]);
  };
  
  const clear = () => {
    history.value = [];
    currentIndex.value = -1;
  };
  
  return {
    history,
    currentIndex,
    canUndo,
    canRedo,
    recordState,
    undo,
    redo,
    clear
  };
} 
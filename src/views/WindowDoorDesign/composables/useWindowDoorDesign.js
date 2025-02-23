import { Canvas, Rect, Line, Group, IText } from 'fabric';
import { CANVAS_SETTINGS, GRID_SETTINGS, SHAPE_DEFAULTS } from '../constants';

export function useWindowDoorDesign(canvasRef) {
  let isDrawing = false;
  let startPoint = null;
  let activeShape = null;
  let activeDimensions = null;
  let activeToolId = null;

  // 初始化画布
  const initCanvas = () => {
    const canvas = new Canvas('mainCanvas', {
      width: CANVAS_SETTINGS.DEFAULT_WIDTH,
      height: CANVAS_SETTINGS.DEFAULT_HEIGHT,
      backgroundColor: CANVAS_SETTINGS.BACKGROUND_COLOR,
      selection: true
    });
    
    canvasRef.value = canvas;
    setupGrid(canvas);
    setupEventListeners(canvas);
    
    return canvas;
  };
  
  // 设置网格
  const setupGrid = (canvas) => {
    const gridSize = GRID_SETTINGS.DEFAULT_SIZE;
    
    for (let i = 0; i < canvas.width; i += gridSize) {
      canvas.add(new Line([i, 0, i, canvas.height], {
        stroke: GRID_SETTINGS.COLOR,
        selectable: false,
        evented: false
      }));
    }
    
    for (let i = 0; i < canvas.height; i += gridSize) {
      canvas.add(new Line([0, i, canvas.width, i], {
        stroke: GRID_SETTINGS.COLOR,
        selectable: false,
        evented: false
      }));
    }
  };
  
  // 设置事件监听器
  const setupEventListeners = (canvas) => {
    canvas.on('mouse:down', (e) => {
      if (activeToolId === 'select') {
        // 选择工具模式下不执行任何特殊操作
        return;
      }
      
      if (!isDrawing && activeToolId === 'outer-frame') {
        isDrawing = true;
        const pointer = canvas.getPointer(e.e);
        startPoint = {
          x: Math.round(pointer.x / GRID_SETTINGS.DEFAULT_SIZE) * GRID_SETTINGS.DEFAULT_SIZE,
          y: Math.round(pointer.y / GRID_SETTINGS.DEFAULT_SIZE) * GRID_SETTINGS.DEFAULT_SIZE
        };

        // 创建初始矩形
        activeShape = new Rect({
          left: startPoint.x,
          top: startPoint.y,
          width: 0,
          height: 0,
          ...SHAPE_DEFAULTS,
          strokeWidth: 2,
          fill: 'transparent'
        });

        canvas.add(activeShape);
        canvas.renderAll();
      }
    });

    canvas.on('mouse:move', (e) => {
      if (isDrawing && activeShape && activeToolId === 'outer-frame') {
        const pointer = canvas.getPointer(e.e);
        const width = Math.round((pointer.x - startPoint.x) / GRID_SETTINGS.DEFAULT_SIZE) * GRID_SETTINGS.DEFAULT_SIZE;
        const height = Math.round((pointer.y - startPoint.y) / GRID_SETTINGS.DEFAULT_SIZE) * GRID_SETTINGS.DEFAULT_SIZE;

        // 更新矩形尺寸
        if (width > 0 && height > 0) {
          activeShape.set({
            width: width,
            height: height
          });
          canvas.renderAll();
        }
      }
    });

    canvas.on('mouse:up', () => {
      if (isDrawing && activeShape && activeToolId === 'outer-frame') {
        isDrawing = false;
        
        // 如果尺寸太小，删除图形
        if (activeShape.width < GRID_SETTINGS.DEFAULT_SIZE || activeShape.height < GRID_SETTINGS.DEFAULT_SIZE) {
          canvas.remove(activeShape);
        } else {
          // 添加尺寸标注
          addDimensions(activeShape);
          canvas.setActiveObject(activeShape);
        }
        
        activeShape = null;
        startPoint = null;
        canvas.renderAll();
      }
    });

    canvas.on('object:moving', (e) => {
      console.log('object:moving', e);
      if (!e.target) return;
      if (e.target.type === 'i-text') {
        e.target.set({
          left: Math.round(e.target.left / GRID_SETTINGS.DEFAULT_SIZE) * GRID_SETTINGS.DEFAULT_SIZE,
          top: Math.round(e.target.top / GRID_SETTINGS.DEFAULT_SIZE) * GRID_SETTINGS.DEFAULT_SIZE
        });
        canvas.renderAll();
      }

      const obj = e.target;
      const grid = GRID_SETTINGS.DEFAULT_SIZE;
      const threshold = GRID_SETTINGS.SNAP_THRESHOLD;
      
      obj.set({
        left: Math.round(obj.left / grid) * grid,
        top: Math.round(obj.top / grid) * grid
      });
      
      canvas.renderAll();
    });
  };
  
  // 添加尺寸标注
  const addDimensions = (object) => {
    if (!canvasRef.value || !object) return;
    
    const canvas = canvasRef.value;
    
    // 水平尺寸标注
    const widthText = new IText(object.width.toString(), {
      fontSize: 14,
      top: -50,
      left: object.width / 2,
      originX: 'center',
      originY: 'center',
      selectable: true,
      editable: true,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: 5,
      textAlign: 'center',
      lockMovementX: true,
      lockMovementY: true
    });
    
    // 垂直尺寸标注
    const heightText = new IText(object.height.toString(), {
      fontSize: 14,
      angle: -90,
      top: object.height / 2,
      left: -50,
      originX: 'center',
      originY: 'center',
      selectable: true,
      editable: true,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      padding: 5,
      textAlign: 'center',
      lockMovementX: true,
      lockMovementY: true
    });
    
    // 添加文本编辑事件监听
    widthText.on('changed', (opt) => {
      const newWidth = parseInt(widthText.text) || object.width;
      object.set('width', newWidth);
      // 更新对象尺寸和重新定位标注
      updateObjectDimensions(object, 'width', newWidth);
    });
    
    heightText.on('changed', (opt) => {
      const newHeight = parseInt(heightText.text) || object.height;
      object.set('height', newHeight);
      // 更新对象尺寸和重新定位标注
      updateObjectDimensions(object, 'height', newHeight);
    });
    
    const horizontalDimension = new Group([
      new Line([0, -30, object.width, -30], {
        stroke: '#000000',
        strokeWidth: 1
      }),
      new Line([0, -35, 0, -25], {
        stroke: '#000000',
        strokeWidth: 1
      }),
      new Line([object.width, -35, object.width, -25], {
        stroke: '#000000',
        strokeWidth: 1
      }),
      widthText
    ], {
      left: object.left,
      top: object.top,
      selectable: false,
      evented: false
    });
    
    const verticalDimension = new Group([
      new Line([-30, 0, -30, object.height], {
        stroke: '#000000',
        strokeWidth: 1
      }),
      new Line([-35, 0, -25, 0], {
        stroke: '#000000',
        strokeWidth: 1
      }),
      new Line([-35, object.height, -25, object.height], {
        stroke: '#000000',
        strokeWidth: 1
      }),
      heightText
    ], {
      left: object.left,
      top: object.top,
      selectable: false,
      evented: false
    });
    
    canvas.add(horizontalDimension, verticalDimension);
  };
  
  // 添加更新对象尺寸的辅助函数
  const updateObjectDimensions = (object, dimension, value) => {
    object.set(dimension, value);
    // 重新计算和更新尺寸标注的位置
    object.setCoords();
    canvasRef.value.renderAll();
  };
  
  // 删除选中对象
  const deleteSelected = () => {
    if (!canvasRef.value) return;
    
    const canvas = canvasRef.value;
    const activeObjects = canvas.getActiveObjects();
    
    if (activeObjects.length > 0) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };
  
  // 清空画布
  const clearCanvas = () => {
    if (!canvasRef.value) return;
    
    canvasRef.value.clear();
    setupGrid(canvasRef.value);
  };
  
  // 保存设计
  const saveDesign = async () => {
    if (!canvasRef.value) return;
    
    const canvas = canvasRef.value;
    const json = canvas.toJSON();
    
    // 这里可以添加保存到服务器的逻辑
    console.log('Saving design:', json);
    
    return json;
  };
  
  return {
    initCanvas,
    deleteSelected,
    clearCanvas,
    saveDesign,
    setActiveTool: (toolId) => {
      activeToolId = toolId;
      if (canvasRef.value) {
        // 更新鼠标样式
        canvasRef.value.defaultCursor = toolId === 'select' ? 'default' :
                                      toolId === 'outer-frame' ? 'crosshair' : 'default';
        // 更新画布选择模式
        canvasRef.value.selection = toolId === 'select';
        // 如果不是选择工具，取消当前选择
        if (toolId !== 'select') {
          canvasRef.value.discardActiveObject();
          canvasRef.value.renderAll();
        }
      }
    }
  };
} 
<template>
  <div class="ar-viewer">
    <div ref="container" class="ar-container"></div>
    <!-- <div class="ar-controls" v-if="!isInAR">
      <button class="btn btn-primary" @click="startAR">
        <i class="fas fa-vr-cardboard me-2"></i>启动AR视图
      </button>
      <button class="btn btn-secondary ms-2" @click="toggle3DView">
        <i class="fas fa-cube me-2"></i>切换3D视图
      </button>
    </div> -->
    <!-- <div class="ar-stats" v-if="showStats">
      <div class="stat-item">
        <span class="stat-label">切割进度:</span>
        <div class="progress">
          <div class="progress-bar" :style="{ width: progress + '%' }">
            {{ progress }}%
          </div>
        </div>
      </div>
      <div class="stat-item">
        <span class="stat-label">材料利用率:</span>
        <span class="stat-value">{{ utilization }}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">剩余长度:</span>
        <span class="stat-value">{{ remainingLength }}mm</span>
      </div>
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import TWEEN from '@tweenjs/tween.js'
import Stats from 'stats.js'
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  cuttingPlan: {
    type: Array,
    required: true,
    default: () => []
  },
  stockList: {
    type: Array,
    required: true,
    default: () => []
  },
  cutList: {
    type: Array,
    required: true,
    default: () => []
  },
  sawKerf: {
    type: Number,
    required: true,
    default: 0
  },
  viewType: {
    type: String,
    default: 'bar',
    validator: (value) => ['bar', 'glass'].includes(value)
  }
})

// 在 props 定义后，testData 定义前添加
const containerSize = ref({ width: 0, height: 0 });

// 在 props 定义后添加默认测试数据
const testData = {
  cuttingPlan: [
    {
      stock: {
        width: 1000,
        height: 800
      },
      pieces: [
        {
          width: 300,
          height: 200,
          x: 0,
          y: 0
        },
        {
          width: 400,
          height: 300,
          x: 350,
          y: 0
        }
      ]
    }
  ],
  stockList: [],
  cutList: [],
  sawKerf: 4
};

// 确保在没有数据时使用测试数据
const effectiveCuttingPlan = computed(() => props.cuttingPlan?.length ? props.cuttingPlan : testData.cuttingPlan);
const effectiveStockList = computed(() => props.stockList?.length ? props.stockList : testData.stockList);
const effectiveCutList = computed(() => props.cutList?.length ? props.cutList : testData.cutList);
const effectiveSawKerf = computed(() => props.sawKerf || testData.sawKerf);

// Refs
const container = ref(null)
const isInAR = ref(false)
const showStats = ref(true)
const progress = ref(0)
const utilization = ref(0)
const remainingLength = ref(0)

// Three.js variables
let scene, camera, renderer, controls
let materials = []
let cutPieces = []
let animationFrameId
let stats
let observer = null

// 重构状态管理
const state = ref({
  scene: {
    isInitialized: false,
    isReady: false,
    error: null
  },
  ar: {
    isSupported: false,
    isInitialized: false,
    isActive: false,
    session: null,
    error: null
  },
  animation: {
    isPlaying: false,
    progress: 0,
    currentFrame: 0,
    totalFrames: 0
  },
  rendering: {
    isActive: false,
    frameId: null
  }
});

// 场景管理器
const sceneManager = {
  async initialize() {
    if (!container.value) return false;
    
    try {
      const rect = container.value.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, rect.width / rect.height, 0.1, 1000);
      
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance"
      });
      
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(rect.width, rect.height);
      renderer.shadowMap.enabled = true;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      
      container.value.innerHTML = '';
      container.value.appendChild(renderer.domElement);
      
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      
      window.addEventListener('resize', handleResize);
      
      state.value.scene.isInitialized = true;
      return true;
    } catch (error) {
      state.value.scene.error = error.message;
      return false;
    }
  },
  
  setupScene() {
    if (!scene) return;
    
    // 基础场景设置
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    scene.add(directionalLight);
    
    const gridHelper = new THREE.GridHelper(
      props.viewType === 'glass' ? 40 : 20,
      props.viewType === 'glass' ? 40 : 20
    );
    scene.add(gridHelper);
    
    // 设置相机位置
    camera.position.set(
      props.viewType === 'glass' ? 0 : 10,
      10,
      props.viewType === 'glass' ? 0 : 10
    );
    camera.lookAt(0, 0, 0);
    
    state.value.scene.isReady = true;
  },
  
  dispose() {
    if (scene) {
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      scene = null;
    }
    
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer = null;
    }
    
    if (controls) {
      controls.dispose();
      controls = null;
    }
    
    camera = null;
    materials = [];
    cutPieces = [];
    
    window.removeEventListener('resize', handleResize);
    
    state.value.scene.isInitialized = false;
    state.value.scene.isReady = false;
  }
};

// AR 管理器
const arManager = {
  async initialize() {
    if (!navigator.xr) {
      state.value.ar.error = 'WebXR not supported';
      return false;
    }
    
    try {
      const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
      if (!isSupported) {
        state.value.ar.error = 'AR not supported';
        return false;
      }
      
      state.value.ar.isSupported = true;
      renderer.xr.enabled = true;
      
      const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: container.value }
      });
      
      container.value.appendChild(arButton);
      state.value.ar.isInitialized = true;
      return true;
    } catch (error) {
      state.value.ar.error = error.message;
      return false;
    }
  },
  
  async startSession() {
    if (!state.value.ar.isInitialized) return false;
    
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: container.value }
      });
      
      await renderer.xr.setSession(session);
      state.value.ar.session = session;
      state.value.ar.isActive = true;
      
      session.addEventListener('end', () => this.endSession());
      
      renderer.setAnimationLoop(this.renderFrame);
      return true;
    } catch (error) {
      state.value.ar.error = error.message;
      return false;
    }
  },
  
  endSession() {
    if (state.value.ar.session) {
      state.value.ar.session.end().catch(console.error);
    }
    
    state.value.ar.session = null;
    state.value.ar.isActive = false;
    renderer.setAnimationLoop(null);
    
    // 恢复普通渲染
    renderManager.start();
  },
  
  renderFrame(timestamp, frame) {
    if (!frame) return;
    
    controls?.update();
    TWEEN.update();
    
    if (state.value.animation.isPlaying) {
      state.value.animation.currentFrame++;
      state.value.animation.progress = Math.min(
        100,
        Math.round((state.value.animation.currentFrame / state.value.animation.totalFrames) * 100)
      );
    }
    
    renderer.render(scene, camera);
  }
};

// 渲染管理器
const renderManager = {
  start() {
    if (state.value.rendering.isActive) return;
    
    const animate = () => {
      state.value.rendering.frameId = requestAnimationFrame(animate);
      
      controls?.update();
      TWEEN.update();
      
      if (state.value.animation.isPlaying) {
        state.value.animation.currentFrame++;
        state.value.animation.progress = Math.min(
          100,
          Math.round((state.value.animation.currentFrame / state.value.animation.totalFrames) * 100)
        );
      }
      
      renderer?.render(scene, camera);
    };
    
    state.value.rendering.isActive = true;
    animate();
  },
  
  stop() {
    if (state.value.rendering.frameId) {
      cancelAnimationFrame(state.value.rendering.frameId);
    }
    state.value.rendering.isActive = false;
    state.value.rendering.frameId = null;
  }
};

// 动画管理器
const animationManager = {
  setup() {
    if (!materials.length || !cutPieces.length) return;
    
    state.value.animation.isPlaying = true;
    state.value.animation.currentFrame = 0;
    state.value.animation.totalFrames = materials.length * (props.viewType === 'glass' ? 5 : 3);
    
    let delay = 0;
    const duration = props.viewType === 'glass' ? 1500 : 1000;
    
    materials.forEach((material, index) => {
      if (!material?.opacity === undefined) return;
      
      // 创建材质动画
      new TWEEN.Tween(material)
        .to({ opacity: 1 }, duration)
        .delay(delay)
        .onStart(() => { material.opacity = 0; })
        .start();
      
      // 创建位置动画
      if (cutPieces[index]?.position) {
        const piece = cutPieces[index];
        const currentPos = {
          x: Number.isFinite(piece.position.x) ? piece.position.x : 0,
          y: Number.isFinite(piece.position.y) ? piece.position.y : 0,
          z: Number.isFinite(piece.position.z) ? piece.position.z : 0
        };
        
        const targetPos = this.calculateTargetPosition(currentPos);
        
        new TWEEN.Tween(piece.position)
          .to(targetPos, duration)
          .delay(delay)
          .easing(TWEEN.Easing.Cubic.Out)
          .onStart(() => {
            piece.position.set(currentPos.x, currentPos.y, currentPos.z);
          })
          .onComplete(() => {
            if (index === materials.length - 1) {
              state.value.animation.isPlaying = false;
              state.value.animation.progress = 100;
            }
          })
          .start();
      }
      
      delay += props.viewType === 'glass' ? 300 : 500;
    });
  },
  
  calculateTargetPosition(currentPos) {
    const targetPos = props.viewType === 'glass'
      ? {
          x: currentPos.x,
          y: currentPos.y + 0.01,
          z: currentPos.z
        }
      : {
          x: currentPos.x,
          y: currentPos.y + 0.2,
          z: currentPos.z + 0.2
        };
    
    // 验证目标位置
    Object.keys(targetPos).forEach(key => {
      if (!Number.isFinite(targetPos[key])) {
        targetPos[key] = 0;
      }
    });
    
    return targetPos;
  },
  
  stop() {
    TWEEN.removeAll();
    state.value.animation.isPlaying = false;
    state.value.animation.progress = 0;
  }
};

// 添加动画状态管理
const animationState = ref({
  isAnimating: false,
  currentFrame: 0,
  totalFrames: 0
});

// 添加 AR 状态管理
const arState = ref({
  isSupported: false,
  isInitialized: false,
  session: null,
  referenceSpace: null,
  hitTestSource: null
});

// 添加 handleResize 到组件作用域
const handleResize = () => {
  if (!container.value || !camera || !renderer) return;
  
  const rect = container.value.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height);
};

// 修改初始化场景函数
const initScene = async () => {
  try {
    if (!container.value) {
      ElMessage.warning('容器元素未找到');
      return false;
    }

    // 使用已保存的容器尺寸
    const { width, height } = containerSize.value;
    if (width <= 0 || height <= 0) {
      console.warn('容器尺寸无效:', width, height);
      return false;
    }

    // 如果场景已存在，先清理
    if (scene) {
      cleanupResources();
    }

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance"
    });
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    
    // 清除容器并添加渲染器
    container.value.innerHTML = '';
    container.value.appendChild(renderer.domElement);

    // 创建控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.minDistance = 1;
    controls.maxDistance = 100;

    // 添加基础场景元素
    setupBasicScene();

    // 开始渲染循环
    animate();

    return true;
  } catch (error) {
    console.error('场景初始化失败:', error);
    ElMessage.error('3D 场景初始化失败: ' + error.message);
    cleanupResources();
    return false;
  }
};

// 添加基础场景设置函数
const setupBasicScene = () => {
  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 200;
  scene.add(directionalLight);

  // 添加网格
  const gridSize = props.viewType === 'glass' ? 40 : 20;
  const gridHelper = new THREE.GridHelper(gridSize, gridSize);
  scene.add(gridHelper);

  // 添加性能监控
  if (!stats) {
    stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
  }
};

// 修改 XR 初始化函数
const initXR = async () => {
  try {
    // 检查 WebXR 支持
    if (!navigator.xr) {
      ElMessage({
        message: '您的浏览器不支持 WebXR，已自动切换到 3D 模式',
        type: 'info',
        duration: 3000
      });
      state.value.ar.error = 'WebXR not supported';
      toggle3DView(); // 自动切换到 3D 模式
      return;
    }

    // 检查 AR 支持
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar')
      .catch(() => false);
    
    if (!isSupported) {
      ElMessage({
        message: '您的设备不支持 AR 功能，已自动切换到 3D 模式',
        type: 'info',
        duration: 3000
      });
      state.value.ar.error = 'AR not supported';
      toggle3DView(); // 自动切换到 3D 模式
      return;
    }

    state.value.ar.isSupported = true;

    // 配置 XR
    if (renderer) {
      renderer.xr.enabled = true;
      
      // 创建 AR 按钮
      const arButton = ARButton.createButton(renderer, {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['dom-overlay'],
        domOverlay: { root: container.value },
        onSessionStarted: (session) => {
          console.log('AR session started');
          isInAR.value = true;
        },
        onSessionEnded: () => {
          console.log('AR session ended');
          isInAR.value = false;
          toggle3DView(); // 会话结束时切换到 3D 模式
        },
        onUnsupported: () => {
          ElMessage({
            message: 'AR 功能不可用，已切换到 3D 模式',
            type: 'info',
            duration: 3000
          });
          state.value.ar.error = 'AR features unavailable';
          toggle3DView();
        }
      });

      // 将 AR 按钮添加到控制区域
      const controls = container.value.querySelector('.ar-controls');
      if (controls) {
        controls.appendChild(arButton);
      }

      state.value.ar.isInitialized = true;
    }

  } catch (error) {
    console.error('XR initialization failed:', error);
    ElMessage({
      message: 'AR 功能初始化失败，已切换到 3D 模式',
      type: 'warning',
      duration: 3000
    });
    state.value.ar.error = error.message;
    state.value.ar.isInitialized = false;
    toggle3DView(); // 发生错误时切换到 3D 模式
  }
};

// 修改切割动画函数
const animateCutting = () => {
  if (!materials.length || !cutPieces.length) return;

  try {
    animationState.value = {
      isAnimating: true,
      currentFrame: 0,
      totalFrames: materials.length * (props.viewType === 'glass' ? 5 : 3)
    };

    let delay = 0;
    const duration = props.viewType === 'glass' ? 1500 : 1000;

    materials.forEach((material, index) => {
      if (!material || material.opacity === undefined) return;

      // 淡入动画
      new TWEEN.Tween(material)
        .to({ opacity: 1 }, duration)
        .delay(delay)
        .onStart(() => {
          material.opacity = 0;
        })
        .start();

      if (cutPieces[index] && cutPieces[index].position) {
        const piece = cutPieces[index];
        const currentPos = {
          x: Number.isFinite(piece.position.x) ? piece.position.x : 0,
          y: Number.isFinite(piece.position.y) ? piece.position.y : 0,
          z: Number.isFinite(piece.position.z) ? piece.position.z : 0
        };

        // 根据视图类型设置动画目标位置
        const targetPosition = props.viewType === 'glass'
          ? { 
              x: currentPos.x,
              y: currentPos.y + 0.01,
              z: currentPos.z
            }
          : { 
              x: currentPos.x,
              y: currentPos.y + 0.2,
              z: currentPos.z + 0.2
            };

        new TWEEN.Tween(piece.position)
          .to(targetPosition, duration)
          .delay(delay)
          .easing(TWEEN.Easing.Cubic.Out)
          .onStart(() => {
            piece.position.set(currentPos.x, currentPos.y, currentPos.z);
          })
          .onComplete(() => {
            if (index === materials.length - 1) {
              animationState.value.isAnimating = false;
              progress.value = 100;
            }
          })
          .start();
      }

      delay += props.viewType === 'glass' ? 300 : 500;
    });
  } catch (error) {
    console.error('Animation setup error:', error);
    animationState.value.isAnimating = false;
    progress.value = 0;
  }
};

// 修改动画函数
const animate = () => {
  if (!scene || !camera || !renderer || !controls) {
    console.warn('Scene not fully initialized');
    return;
  }

  try {
    animationFrameId = requestAnimationFrame(animate);
    
    if (controls) {
      controls.update();
    }

    if (TWEEN) {
      TWEEN.update();
    }

    if (stats) {
      stats.begin();
    }

    scene.traverse((object) => {
      if (object.position) {
        object.position.x = isNaN(object.position.x) ? 0 : object.position.x;
        object.position.y = isNaN(object.position.y) ? 0 : object.position.y;
        object.position.z = isNaN(object.position.z) ? 0 : object.position.z;
      }
      if (object.rotation) {
        object.rotation.x = isNaN(object.rotation.x) ? 0 : object.rotation.x;
        object.rotation.y = isNaN(object.rotation.y) ? 0 : object.rotation.y;
        object.rotation.z = isNaN(object.rotation.z) ? 0 : object.rotation.z;
      }
      if (object.scale) {
        object.scale.x = isNaN(object.scale.x) ? 1 : object.scale.x;
        object.scale.y = isNaN(object.scale.y) ? 1 : object.scale.y;
        object.scale.z = isNaN(object.scale.z) ? 1 : object.scale.z;
      }
    });

    if (animationState.value.isAnimating) {
      animationState.value.currentFrame++;
      progress.value = Math.min(100, Math.round((animationState.value.currentFrame / animationState.value.totalFrames) * 100));
    }

    renderer.render(scene, camera);

    if (stats) {
      stats.end();
    }
  } catch (error) {
    console.error('Animation error:', error);
    cancelAnimationFrame(animationFrameId);
  }
};

// 修改 AR 启动函数
const startAR = async () => {
  try {
    if (!state.value.ar.isInitialized) {
      await initXR();
    }

    if (!state.value.ar.isSupported) {
      toggle3DView(); // 如果不支持 AR，切换到 3D 视图
      return;
    }

    // 停止普通渲染循环
    renderManager.stop();

    // 请求 AR 会话
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: container.value }
    }).catch(error => {
      console.error('AR session request failed:', error);
      ElMessage({
        message: 'AR 会话启动失败，已切换到 3D 模式',
        type: 'warning',
        duration: 3000
      });
      toggle3DView();
      return null;
    });

    if (!session) {
      return;
    }

    // 设置 AR 会话
    await renderer.xr.setSession(session);
    state.value.ar.session = session;
    isInAR.value = true;

    // 配置 AR 渲染循环
    renderer.setAnimationLoop((timestamp, frame) => {
      if (!frame || !scene || !camera) return;
      
      controls?.update();
      TWEEN.update();

      // 更新场景中的对象
      scene.traverse((object) => {
        if (object.position) {
          object.position.x = isNaN(object.position.x) ? 0 : object.position.x;
          object.position.y = isNaN(object.position.y) ? 0 : object.position.y;
          object.position.z = isNaN(object.position.z) ? 0 : object.position.z;
        }
      });

      renderer.render(scene, camera);
    });

    // 监听会话结束
    session.addEventListener('end', () => {
      cleanupARSession();
      toggle3DView(); // 切换到 3D 视图
    });

  } catch (error) {
    console.error('AR 启动失败:', error);
    ElMessage({
      message: 'AR 功能启动失败，已切换到 3D 模式',
      type: 'error',
      duration: 3000
    });
    cleanupARSession();
    toggle3DView(); // 降级到 3D 视图
  }
};

// 修改清理函数
const cleanupARSession = () => {
  try {
    if (state.value.ar.session) {
      state.value.ar.session.end().catch(console.error);
    }
    
    state.value.ar.session = null;
    isInAR.value = false;
    
    renderer.setAnimationLoop(null);
    
    // 恢复普通渲染循环
    renderManager.start();
  } catch (error) {
    console.error('清理 AR 会话失败:', error);
  }
};

// 修改 3D 视图切换函数
const toggle3DView = async () => {
  try {
    if (!scene || !camera) {
      await initScene();
    }

    // 如果没有切割方案数据，直接返回
    if (!props.cuttingPlan?.length) {
      ElMessage.warning('暂无切割方案数据');
      return;
    }

    // 确保创建切割动画
    createCuttingAnimation();

    // 根据视图类型调整相机位置
    const distance = props.viewType === 'glass' ? 15 : 12;
    const targetPosition = props.viewType === 'glass' 
      ? { x: 0, y: distance, z: 0 }
      : { x: distance, y: distance, z: distance };

    // 平滑过渡到新的相机位置
    new TWEEN.Tween(camera.position)
      .to(targetPosition, 1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        camera.lookAt(0, 0, 0);
      })
      .onComplete(() => {
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
      })
      .start();

  } catch (error) {
    console.error('View toggle failed:', error);
    ElMessage.error('视图切换失败: ' + error.message);
  }
};

// 监听属性变化
watch(() => props.cuttingPlan, (newPlan) => {
  // 每次切割方案更新时，完全重置场景
  if (scene) {
    // 停止所有动画
    TWEEN.removeAll();
    renderManager.stop();
    animationManager.stop();

    // 清理所有资源
    cleanupResources();

    // 重新初始化场景
    nextTick(async () => {
      await initScene();
      if (newPlan?.length > 0) {
        createCuttingAnimation();
      }
    });
  } else {
    // 如果场景不存在，直接初始化
    nextTick(async () => {
      await initScene();
      if (newPlan?.length > 0) {
        createCuttingAnimation();
      }
    });
  }
}, { deep: true, immediate: true });

// 修改组件挂载钩子
onMounted(async () => {
  try {
    if (!container.value) {
      ElMessage.warning('容器元素未找到');
      return;
    }

    // 创建 ResizeObserver 监听容器尺寸变化
    observer = new ResizeObserver(async (entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        
        containerSize.value = { width, height };
        
        if (!scene) {
          // 首次初始化场景
          await initScene();
          if (props.cuttingPlan?.length > 0) {
            createCuttingAnimation();
          }
        } else {
          // 已有场景，仅更新尺寸
          handleResize();
        }
      }
    });

    // 开始监听容器尺寸
    observer.observe(container.value);

    // 等待下一帧确保容器已渲染
    await nextTick();
    
    // 获取初始尺寸
    const rect = container.value.getBoundingClientRect();
    containerSize.value = { 
      width: rect.width, 
      height: rect.height 
    };

    // 如果容器已有尺寸，立即初始化场景
    if (rect.width > 0 && rect.height > 0) {
      await initScene();
      if (props.cuttingPlan?.length > 0) {
        createCuttingAnimation();
      }
    }

  } catch (error) {
    console.error('初始化失败:', error);
    ElMessage.error('场景初始化失败: ' + error.message);
  }
});

onUnmounted(() => {
  // 停止所有活动
  renderManager.stop();
  animationManager.stop();
  
  if (state.value.ar.isActive) {
    arManager.endSession();
  }
  
  // 清理资源
  sceneManager.dispose();
});

// 修改组件卸载钩子
onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  window.removeEventListener('resize', handleResize);
  cleanupResources();
});

// 修改 createCuttingAnimation 函数
const createCuttingAnimation = () => {
  if (!scene) {
    console.warn('Scene not initialized');
    return;
  }

  // 使用当前切割方案
  const currentCuttingPlan = effectiveCuttingPlan.value;
  if (!currentCuttingPlan?.length) {
    console.warn('No cutting plan data');
    return;
  }

  try {
    // 清除现有模型
    const toRemove = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh && 
          !(object instanceof THREE.GridHelper) && 
          !(object instanceof THREE.AxesHelper)) {
        toRemove.push(object);
      }
    });
    toRemove.forEach(obj => scene.remove(obj));

    cutPieces = [];
    materials = [];

    // 创建一个组来容纳所有的切割件
    const cuttingGroup = new THREE.Group();
    scene.add(cuttingGroup);

    // 处理切割方案
    currentCuttingPlan.forEach((plan, planIndex) => {
      // 统一获取原料尺寸信息
      let stockDimensions;
      if (props.viewType === 'glass') {
        if (plan.stock?.width && plan.stock?.height) {
          stockDimensions = {
            width: plan.stock.width,
            height: plan.stock.height
          };
        } else {
          console.warn('Invalid glass stock dimensions:', plan);
          return;
        }
      } else {
        if (plan.originalSpec) {
          const stockLength = parseInt(plan.originalSpec);
          if (isNaN(stockLength)) {
            console.warn('Invalid bar stock length:', plan.originalSpec);
            return;
          }
          stockDimensions = {
            length: stockLength
          };
        } else {
          console.warn('Invalid bar stock dimensions:', plan);
          return;
        }
      }

      // 计算缩放比例
      const scale = props.viewType === 'glass'
        ? 10 / Math.max(stockDimensions.width, stockDimensions.height)
        : 10 / Math.max(stockDimensions.length, 1000);

      // 创建原料几何体
      const stockGeometry = props.viewType === 'glass'
        ? new THREE.PlaneGeometry(stockDimensions.width * scale, stockDimensions.height * scale)
        : new THREE.BoxGeometry(stockDimensions.length * scale, 50 * scale, 50 * scale);

      const stockMaterial = new THREE.MeshPhongMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });

      const stock = new THREE.Mesh(stockGeometry, stockMaterial);
      
      // 设置原料位置和旋转
      if (props.viewType === 'glass') {
        stock.rotation.x = -Math.PI / 2;
        stock.position.y = planIndex * 2;
      } else {
        stock.position.y = planIndex * 0.6;
      }
      
      cuttingGroup.add(stock);

      // 处理切割片段
      if (props.viewType === 'glass' && plan.placements) {
        // 玻璃切割模式
        plan.placements.forEach((piece, pieceIndex) => {
          if (!piece?.width || !piece?.height) {
            console.warn('Invalid glass piece dimensions:', piece);
            return;
          }

          const pieceGeometry = new THREE.PlaneGeometry(
            piece.width * scale,
            piece.height * scale
          );

          // 根据尺寸设置颜色
          const pieceColor = new THREE.Color().setHSL(pieceIndex * 0.1, 0.7, 0.5);

          const pieceMaterial = new THREE.MeshPhongMaterial({
            color: pieceColor,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
          });

          const pieceMesh = new THREE.Mesh(pieceGeometry, pieceMaterial);
          pieceMesh.rotation.x = -Math.PI / 2;

          // 计算位置（从2D坐标转换到3D坐标）
          const x = (piece.x || 0) * scale;
          const y = (piece.y || 0) * scale;
          
          pieceMesh.position.set(
            -stockDimensions.width * scale / 2 + x + piece.width * scale / 2,
            planIndex * 2 + 0.01,
            -stockDimensions.height * scale / 2 + y + piece.height * scale / 2
          );

          cuttingGroup.add(pieceMesh);
          cutPieces.push(pieceMesh);
          materials.push(pieceMaterial);
        });
      } else if (props.viewType !== 'glass' && plan.cutDetails) {
        // 型材切割模式
        const cutSegments = plan.cutDetails.split('，').map(segment => {
          const [length, count] = segment.split('×');
          return {
            length: parseInt(length),
            count: parseInt(count)
          };
        });

        let accumulatedLength = 0;
        cutSegments.forEach((segment, segmentIndex) => {
          for (let i = 0; i < segment.count; i++) {
            const pieceGeometry = new THREE.BoxGeometry(
              segment.length * scale,
              50 * scale,
              50 * scale
            );

            const pieceColor = new THREE.Color().setHSL(segmentIndex * 0.1, 0.7, 0.5);
            const pieceMaterial = new THREE.MeshPhongMaterial({
              color: pieceColor,
              transparent: true,
              opacity: 0.8,
              side: THREE.DoubleSide
            });

            const pieceMesh = new THREE.Mesh(pieceGeometry, pieceMaterial);
            pieceMesh.position.set(
              -stockDimensions.length * scale / 2 + accumulatedLength * scale + segment.length * scale / 2,
              planIndex * 0.6,
              0
            );

            cuttingGroup.add(pieceMesh);
            cutPieces.push(pieceMesh);
            materials.push(pieceMaterial);

            accumulatedLength += segment.length + (effectiveSawKerf.value || 0);
          }
        });
      }
    });

    // 调整相机位置
    const boundingBox = new THREE.Box3().setFromObject(cuttingGroup);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    // 调整组的位置，使其居中
    cuttingGroup.position.sub(center);

    // 设置相机位置
    const maxDim = Math.max(size.x, size.y, size.z);
    const distance = maxDim * 2;
    
    if (props.viewType === 'glass') {
      camera.position.set(0, distance, 0);
    } else {
      camera.position.set(distance, distance, distance);
    }
    
    camera.lookAt(0, 0, 0);

    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    }

    // 创建动画
    animateCutting();

  } catch (error) {
    console.error('Error creating cutting animation:', error);
    ElMessage.error('创建切割动画失败: ' + error.message);
  }
};

// 添加工具函数
const validateDimensions = (dimensions) => {
  const validated = {};
  Object.entries(dimensions).forEach(([key, value]) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      console.warn(`Invalid ${key} value:`, value);
      validated[key] = 0.001;
    } else {
      validated[key] = Math.max(0.001, value);
    }
  });
  return validated;
};

const createSafeGeometry = (params) => {
  try {
    const { width, height, depth } = validateDimensions({
      width: params.width || 0.1,
      height: params.height || 0.1,
      depth: params.depth || 0.1
    });

    if ([width, height, depth].some(v => !Number.isFinite(v))) {
      throw new Error('Invalid geometry parameters');
    }

    if (props.viewType === 'glass') {
      const geometry = new THREE.PlaneGeometry(width, height);
      if (!geometry.attributes.position || 
          geometry.attributes.position.array.some(v => !Number.isFinite(v))) {
        throw new Error('Invalid geometry generated');
      }
      return geometry;
    } else {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      if (!geometry.attributes.position || 
          geometry.attributes.position.array.some(v => !Number.isFinite(v))) {
        throw new Error('Invalid geometry generated');
      }
      return geometry;
    }
  } catch (error) {
    console.error('Geometry creation failed:', error);
    return props.viewType === 'glass' 
      ? new THREE.PlaneGeometry(0.001, 0.001)
      : new THREE.BoxGeometry(0.001, 0.001, 0.001);
  }
};

// 修改清理函数
const cleanupResources = () => {
  try {
    // 停止动画循环
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // 清理 TWEEN
    TWEEN.removeAll();

    // 清理 Three.js 资源
    if (scene) {
      // 移除所有对象
      while(scene.children.length > 0) { 
        const object = scene.children[0];
        if (object.geometry) {
          object.geometry.dispose();
        }
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
        scene.remove(object);
      }
      scene = null;
    }

    // 清理渲染器
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      renderer = null;
    }

    // 清理控制器
    if (controls) {
      controls.dispose();
      controls = null;
    }

    // 清理相机
    camera = null;

    // 清理其他资源
    materials = [];
    cutPieces = [];

    // 清理性能监控
    if (stats?.dom && stats.dom.parentNode) {
      stats.dom.parentNode.removeChild(stats.dom);
      stats = null;
    }

    // 重置所有状态
    state.value = {
      scene: {
        isInitialized: false,
        isReady: false,
        error: null
      },
      ar: {
        isSupported: false,
        isInitialized: false,
        isActive: false,
        session: null,
        error: null
      },
      animation: {
        isPlaying: false,
        progress: 0,
        currentFrame: 0,
        totalFrames: 0
      },
      rendering: {
        isActive: false,
        frameId: null
      }
    };

    // 重置动画状态
    animationState.value = {
      isAnimating: false,
      currentFrame: 0,
      totalFrames: 0
    };

    // 重置 AR 状态
    arState.value = {
      isSupported: false,
      isInitialized: false,
      session: null,
      referenceSpace: null,
      hitTestSource: null
    };

    // 移除事件监听器
    window.removeEventListener('resize', handleResize);

  } catch (error) {
    console.error('清理资源时出错:', error);
  }
};
</script>

<style scoped>
.ar-viewer {
  position: relative;
  width: 100%;
  height: 800px;
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.ar-container {
  width: 100%;
  height: 100%;
}

.ar-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 10px;
}

.ar-stats {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 8px;
  color: white;
  z-index: 10;
}

.stat-item {
  margin-bottom: 10px;
}

.stat-label {
  font-weight: 500;
  margin-right: 10px;
}

.stat-value {
  font-family: monospace;
}

.progress {
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 5px;
}

.progress-bar {
  height: 100%;
  background-color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  transition: width 0.3s ease;
}
</style> 
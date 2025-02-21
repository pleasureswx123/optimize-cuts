<template>
  <div class="ar-viewer-container">
    <!-- AR视图区域 -->
  <div class="ar-viewer-aframe">
    <a-scene
      embedded
        loading-screen="enabled: false"
      vr-mode-ui="enabled: false"
        gesture-detector
        arjs="sourceType: webcam;
              debugUIEnabled: false;
              detectionMode: mono;
              sourceWidth: 1280;
              sourceHeight: 720;
              displayWidth: 1280;
              displayHeight: 720;
              maxDetectionRate: 60;
              patternRatio: 0.75;
              facingMode: environment;
              canvasWidth: 1280;
              canvasHeight: 720;"
        renderer="antialias: true;
                  alpha: true;
                  precision: highp;
                  logarithmicDepthBuffer: true;
                  preserveDrawingBuffer: true;"
        inspector="url: https://cdn.jsdelivr.net/gh/aframevr/aframe-inspector@master/dist/aframe-inspector.min.js"
        stats
        custom-renderer
    >
      <!-- 相机实体 -->
        <a-entity camera></a-entity>

      <!-- 标记实体 -->
        <a-marker 
          preset="hiro"
          raycaster="objects: .clickable"
          emitevents="true"
          cursor="fuse: false; rayOrigin: mouse;"
          smooth="true"
          smoothCount="5"
          smoothTolerance="0.01"
          smoothThreshold="2"
        >
        <a-entity
          id="marker-content"
          position="0 0 0"
            scale="1 1 1"
        >
          <!-- 型材/玻璃切割可视化容器 -->
          <a-entity
            id="cutting-visualization"
            :position="viewType === 'glass' ? '0 0.1 0' : '0 0 0'"
            :rotation="viewType === 'glass' ? '-90 0 0' : '0 0 0'"
            scale="0.5 0.5 0.5"
          >
          </a-entity>
        </a-entity>
      </a-marker>

        <!-- 默认光照 -->
        <a-entity light="type: ambient; color: #FFF; intensity: 1"></a-entity>
    </a-scene>

    <!-- 控制面板 -->
      <div class="ar-controls">
        <button 
          class="btn btn-primary" 
          @click="startAR"
          :disabled="arState === AR_STATES.LOADING || arState === AR_STATES.STARTING"
        >
          <i class="fas fa-vr-cardboard me-2"></i>
          {{ getStartButtonText() }}
      </button>
    </div>

      <!-- 错误提示 -->
      <div class="ar-error" v-if="errorMessage && arState === AR_STATES.ERROR">
        <div class="error-content">
          <i class="fas fa-exclamation-triangle me-2"></i>
          {{ errorMessage }}
          </div>
        </div>

      <!-- 调试信息面板 -->
      <div v-if="arState === AR_STATES.RUNNING" class="ar-debug-panel">
        <div class="debug-info">
          <p>AR状态: {{ arState }}</p>
          <p>场景就绪: {{ isSceneReady }}</p>
          <p>标记检测: {{ showStats ? '已检测' : '未检测' }}</p>
          <p>渲染帧率: {{ frameRate }}fps</p>
      </div>
      </div>
      </div>

    <!-- AR使用说明区域 -->
    <div class="ar-instructions">
      <h3>AR使用说明</h3>
      <div class="instruction-grid">
        <div class="instruction-step">
          <div class="step-icon">
            <i class="fas fa-print"></i>
          </div>
          <div class="step-content">
            <h4>第一步：打印标记</h4>
            <p>请打印Hiro标记，您可以点击<a href="#" @click.prevent="downloadMarker">这里</a>下载标记图片。</p>
          </div>
        </div>
        <div class="instruction-step">
          <div class="step-icon">
            <i class="fas fa-camera"></i>
          </div>
          <div class="step-content">
            <h4>第二步：启动AR</h4>
            <p>点击"启动AR视图"按钮，允许使用摄像头。</p>
          </div>
        </div>
        <div class="instruction-step">
          <div class="step-icon">
            <i class="fas fa-crosshairs"></i>
          </div>
          <div class="step-content">
            <h4>第三步：对准标记</h4>
            <p>将摄像头对准打印好的标记，保持标记在视野中。</p>
          </div>
        </div>
        <div class="instruction-step">
          <div class="step-icon">
            <i class="fas fa-eye"></i>
          </div>
          <div class="step-content">
            <h4>第四步：查看模型</h4>
            <p>切割方案的3D模型将显示在标记上方。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import 'aframe'
import 'ar.js/aframe/build/aframe-ar'
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

// 移除全局状态管理
const AR_STATES = {
  INITIAL: 'initial',
  LOADING: 'loading',
  READY: 'ready',
  STARTING: 'starting',
  RUNNING: 'running',
  ERROR: 'error',
  PAUSED: 'paused'
}

// 状态变量
const arState = ref(AR_STATES.INITIAL)
const isSceneReady = ref(false)
const isInAR = ref(false)
const showStats = ref(false)
const progress = ref(0)
const utilization = ref(0)
const remainingLength = ref(0)
const errorMessage = ref('')
const frameRate = ref(0)

// 场景管理
let scene = null
let markerContent = null
let visualizationEntity = null
let arVideo = null
let observer = null

// 优化性能监控
let frameCount = 0
let lastFPSUpdate = performance.now()
let lastRenderTime = 0
let monitoringRAF = null
let isMonitoringActive = false

// 生命周期钩子
onMounted(async () => {
  try {
    console.log('组件已挂载，等待用户启动AR')
  } catch (error) {
    console.error('组件挂载时出错:', error)
  }
})

onUnmounted(() => {
  cleanup()
})

// 监听属性变化
watch(() => props.cuttingPlan, () => {
  if (isSceneReady.value && arState.value === AR_STATES.RUNNING) {
    createVisualization()
  }
}, { deep: true })

// 监听AR状态变化
watch(() => arState.value, (newState, oldState) => {
  console.log(`AR状态变化: ${oldState} -> ${newState}`)
})

// 修改初始化场景函数
const initScene = async () => {
  try {
    console.log('开始初始化场景')
    
    // 等待DOM元素加载
    await new Promise(resolve => setTimeout(resolve, 500))
    
    scene = document.querySelector('a-scene')
    if (!scene) {
      throw new Error('无法找到 a-scene 元素')
    }
    
    // 确保场景已初始化
    if (!scene.hasLoaded) {
      await new Promise((resolve) => {
        scene.addEventListener('loaded', resolve, { once: true })
      })
    }

    // 初始化场景元素
    markerContent = document.querySelector('#marker-content')
    visualizationEntity = document.querySelector('#cutting-visualization')

    if (!markerContent || !visualizationEntity) {
      throw new Error('场景元素未找到')
    }
    
    // 配置标记
    const marker = document.querySelector('a-marker')
    if (marker) {
      // 使用 A-Frame 的事件系统
      marker.addEventListener('markerFound', function() {
        showStats.value = true
        if (markerContent) {
          markerContent.setAttribute('visible', 'true')
        }
      })
      
      marker.addEventListener('markerLost', function() {
        showStats.value = false
        if (markerContent) {
          markerContent.setAttribute('visible', 'false')
        }
      })
    }
    
    isSceneReady.value = true
    arState.value = AR_STATES.READY
    
  } catch (error) {
    console.error('场景初始化错误:', error)
    handleError('场景初始化错误', error)
  }
}

// 设置视频事件监听器
const setupVideoEventListeners = (video) => {
  if (!video) {
    console.warn('setupVideoEventListeners: 视频元素不存在')
    return
  }

  const videoEvents = {
    loadedmetadata: '元数据已加载',
    loadeddata: '首帧已加载',
    canplay: '可以开始播放',
    playing: '正在播放',
    pause: '已暂停',
    waiting: '等待数据',
    error: '发生错误'
  }
  
  const cleanup = []
  
  Object.entries(videoEvents).forEach(([event, description]) => {
    const handler = () => {
      console.log(`视频事件 - ${description}:`, {
        event,
        readyState: video.readyState,
        paused: video.paused,
        currentTime: video.currentTime,
        error: video.error
      })
      
      // 特殊处理某些事件
      if (event === 'pause' && isInAR.value) {
        // 如果在AR模式下意外暂停，尝试恢复播放
        video.play().catch(error => {
          console.error('恢复视频播放失败:', error)
        })
      }
    }
    
    video.addEventListener(event, handler)
    cleanup.push(() => video.removeEventListener(event, handler))
  })
  
  // 返回清理函数
  return () => cleanup.forEach(fn => fn())
}

// 错误处理函数
const handleError = async (type, error) => {
  try {
    const errorDetails = error.message || error.detail || '未知错误'
    console.error(`${type}:`, error)
    
    // 收集错误上下文
    const errorContext = {
      timestamp: new Date().toISOString(),
      type,
      message: errorDetails,
      state: arState.value,
      isInAR: isInAR.value,
      isSceneReady: isSceneReady.value,
      browserInfo: navigator.userAgent,
      hasWebGL: !!document.createElement('canvas').getContext('webgl'),
      hasGetUserMedia: !!navigator.mediaDevices?.getUserMedia,
      isSecureContext: window.isSecureContext,
      videoElement: document.querySelector('#arjs-video') ? '存在' : '不存在',
      sceneElement: document.querySelector('a-scene') ? '存在' : '不存在'
    }
    
    console.log('错误上下文:', errorContext)
    errorMessage.value = `${type}: ${errorDetails}`
    arState.value = AR_STATES.ERROR
    
    // 清理现有资源
    cleanup()
    
    // 等待一段时间后尝试恢复
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 尝试自动恢复
    if (await attemptErrorRecovery()) {
      console.log('系统已自动恢复')
      ElMessage.success('系统已自动恢复')
      return true
    } else {
      console.error('系统恢复失败')
      ElMessage.error(errorMessage.value)
      if (isInAR.value) {
        toggle3DView()
      }
      return false
    }
  } catch (recoveryError) {
    console.error('错误处理过程失败:', recoveryError)
    return false
  }
}

// 检查环境支持
const checkEnvironmentSupport = async () => {
  try {
    // 检查是否支持 getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('您的浏览器不支持摄像头访问，请使用最新版本的Chrome/Firefox/Safari')
    }

    // 检查是否是安全上下文
    if (!window.isSecureContext) {
      throw new Error('请使用 HTTPS 或 localhost 访问以启用摄像头')
    }

    // 检查WebGL支持
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) {
      throw new Error('您的设备不支持WebGL，无法运行AR功能')
    }

    // 检查摄像头权限
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      console.log('摄像头权限检查通过')
    } catch (error) {
      throw new Error('无法访问摄像头，请确保已授予摄像头权限')
    }

    return true
  } catch (error) {
    console.error('环境检查失败:', error)
    throw error
  }
}

// 修改性能监控函数
const monitorPerformance = () => {
  if (!isMonitoringActive) return

  const now = performance.now()
  frameCount++

  if (now - lastFPSUpdate >= 1000) {
    frameRate.value = Math.round(frameCount * 1000 / (now - lastFPSUpdate))
    frameCount = 0
    lastFPSUpdate = now
  }

  if (lastRenderTime > 0) {
    const frameTime = now - lastRenderTime
    if (frameTime > 16.67) {
      console.debug('渲染性能信息: 帧时间', frameTime.toFixed(2), 'ms')
    }
  }
  lastRenderTime = now
  monitoringRAF = requestAnimationFrame(monitorPerformance)
}

// 启动性能监控
const startPerformanceMonitoring = () => {
  if (isMonitoringActive) return
  console.log('启动性能监控')
  isMonitoringActive = true
  lastRenderTime = 0
  monitoringRAF = requestAnimationFrame(monitorPerformance)
}

// 停止性能监控
const stopPerformanceMonitoring = () => {
  if (!isMonitoringActive) return
  console.log('停止性能监控')
  isMonitoringActive = false
  if (monitoringRAF) {
    cancelAnimationFrame(monitoringRAF)
    monitoringRAF = null
  }
  lastRenderTime = 0
}

// 修改视频初始化逻辑
const initVideo = async () => {
  try {
    console.log('开始初始化视频')
    
    // 等待 AR.js 创建视频元素
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const video = document.querySelector('#arjs-video')
    if (!video) {
      throw new Error('未找到视频元素')
    }

    // 停止现有视频流
    if (video.srcObject) {
      const stream = video.srcObject
      stream.getTracks().forEach(track => track.stop())
      video.srcObject = null
    }

    // 设置视频属性
    video.setAttribute('autoplay', '')
    video.setAttribute('playsinline', '')
    video.setAttribute('webkit-playsinline', '')
    video.setAttribute('crossorigin', 'anonymous')
    video.muted = true
    
    // 优化的视频约束
    const constraints = {
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 60 }
      }
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream
    
    // 设置视频样式
    video.style.cssText = `
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      z-index: 0 !important;
      transform: none !important;
      transition: none !important;
      will-change: transform !important;
      pointer-events: none !important;
      background: transparent !important;
    `

    // 等待视频加载
    await new Promise((resolve) => {
      video.addEventListener('loadedmetadata', resolve, { once: true })
    })

    // 强制播放视频
    await video.play()
    
    // 设置视频播放属性
    video.playbackRate = 1.0
    video.defaultPlaybackRate = 1.0
    
    return video
  } catch (error) {
    console.error('视频初始化失败:', error)
    throw error
  }
}

// 修改场景加载完成处理
const handleSceneLoaded = async () => {
  try {
    console.log('场景加载完成')
    isSceneReady.value = true
    arState.value = AR_STATES.READY

    // 确保场景和画布样式正确
    const scene = document.querySelector('a-scene')
    if (scene) {
      scene.style.cssText = `
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        z-index: 2 !important;
        background: none !important;
      `

      const canvas = scene.canvas
      if (canvas) {
        canvas.style.cssText = `
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: none !important;
          pointer-events: none !important;
        `
      }

      // 配置AR.js系统
      if (scene.systems['arjs']) {
        const arSystem = scene.systems['arjs']
        arSystem.arReady = true

        // 配置AR.js上下文
        if (arSystem.arToolkitContext) {
          const context = arSystem.arToolkitContext
          context.arController.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_MONO)
          context.arController.setPattRatio(0.75)

          // 启用调试模式
          context.debug = true
          context.detectionMode = 'mono'
          context.maxDetectionRate = 60

          console.log('AR.js上下文配置完成:', {
            detectionMode: context.detectionMode,
            maxDetectionRate: context.maxDetectionRate,
            debug: context.debug
          })
        }
      }
    }

    // 创建可视化
    if (props.cuttingPlan?.length > 0) {
      await createVisualization()
    }
  } catch (error) {
    console.error('场景加载处理失败:', error)
    handleError('场景加载失败', error)
  }
}

// 修改 startAR 函数
const startAR = async () => {
  try {
    console.log('开始AR初始化流程')
    arState.value = AR_STATES.LOADING

    // 检查环境支持
    await checkEnvironmentSupport()
    console.log('环境检查通过')

    // 初始化场景
    await initScene()
    console.log('场景初始化完成')

    // 初始化视频
    arVideo = await initVideo()
    console.log('视频初始化完成')

    // 启动场景
    if (scene) {
      scene.play()
      arState.value = AR_STATES.RUNNING
      isInAR.value = true

      // 启动性能监控
      startPerformanceMonitoring()
    }

  } catch (error) {
    console.error('AR启动失败:', error)
    handleError('AR启动失败', error)
  }
}

// 修改 toggle3DView 函数
const toggle3DView = () => {
  try {
    if (!isInAR.value) return

    console.log('切换到3D视图')
    isInAR.value = false
    arState.value = AR_STATES.PAUSED
    scene.pause()
    
    // 停止性能监控
    stopPerformanceMonitoring()
    
    // 停止所有视频流
    if (arVideo && arVideo.srcObject) {
      const stream = arVideo.srcObject
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
          console.log('已停止视频轨道:', track.label)
        })
      }
      arVideo.srcObject = null
    }

    ElMessage.success('已退出 AR 模式')
  } catch (error) {
    handleError('切换视图失败', error)
  }
}

// 修改 cleanup 函数
const cleanup = () => {
  try {
    console.log('清理AR资源')
    
    // 停止性能监控
    stopPerformanceMonitoring()
    
    // 停止视频流
    if (arVideo && arVideo.srcObject) {
      const stream = arVideo.srcObject
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
          console.log('停止视频轨道:', track.label)
        })
      }
      arVideo.srcObject = null
    }

    // 执行所有清理函数
    if (window.cleanupFunctions) {
      window.cleanupFunctions.forEach(cleanup => cleanup())
      window.cleanupFunctions = []
    }

    // 移除观察者
    if (observer) {
      observer.disconnect()
      observer = null
    }

    // 重置场景
    if (scene) {
      scene.pause()
    }

    // 重置状态
    arState.value = AR_STATES.INITIAL
    isInAR.value = false
    isSceneReady.value = false
    showStats.value = false
    errorMessage.value = ''

    console.log('AR资源清理完成')
  } catch (error) {
    console.error('清理资源时出错:', error)
  }
}

// 添加切割方案验证函数
const validateCuttingPlan = (plan) => {
  if (!plan || typeof plan !== 'object') {
    console.debug('切割方案无效: 不是有效的对象')
    return false
  }

  // 验证原料规格
  if (typeof plan.originalSpec !== 'number' || plan.originalSpec <= 0) {
    console.debug('切割方案无效: 原料规格无效')
    return false
  }

  // 验证玻璃模式
  if (props.viewType === 'glass') {
    if (!Array.isArray(plan.placements)) {
      console.debug('切割方案无效: 玻璃布局数据无效')
      return false
    }
    // 验证stock属性（对于玻璃模式）
    if (!plan.stock || typeof plan.stock.height !== 'number' || plan.stock.height <= 0) {
      console.debug('切割方案无效: 玻璃原料高度无效')
      return false
    }
  } else {
    // 验证型材模式
    if (typeof plan.cutDetails !== 'string' || plan.cutDetails.trim() === '') {
      console.debug('切割方案无效: 型材切割明细无效')
      return false
    }
  }

  return true
}

// 修改 createVisualization 函数中的错误处理
const createVisualization = () => {
  try {
    // 检查场景状态
    if (!isSceneReady.value) {
      console.debug('场景未就绪，暂不创建可视化')
      return
    }

    // 获取并检查必要的容器元素
    visualizationEntity = visualizationEntity || document.querySelector('#cutting-visualization')
    markerContent = markerContent || document.querySelector('#marker-content')

    if (!visualizationEntity || !markerContent) {
      console.debug('可视化容器未找到，等待DOM更新')
      return
    }

    // 检查切割方案数据
    if (!Array.isArray(props.cuttingPlan) || props.cuttingPlan.length === 0) {
      console.debug('无切割方案数据，跳过可视化创建')
      return
    }

    console.log('开始创建可视化')
    
    // 使用DocumentFragment优化DOM操作
    const visualizationFragment = document.createDocumentFragment()
    const markerFragment = document.createDocumentFragment()

  // 清除现有实体
  while (visualizationEntity.firstChild) {
    visualizationEntity.removeChild(visualizationEntity.firstChild)
  }
  while (markerContent.firstChild) {
    markerContent.removeChild(markerContent.firstChild)
  }

    // 批量处理切割方案
    const processedEntities = props.cuttingPlan.map((plan, planIndex) => {
      try {
        if (!validateCuttingPlan(plan)) {
          console.debug(`切割方案 ${planIndex + 1} 验证失败，跳过处理`)
          return null
        }

        const { stockEntity, pieces } = createPlanEntities(plan, planIndex)
        return { stockEntity, pieces }
      } catch (error) {
        console.error(`处理切割方案 ${planIndex} 时出错:`, error)
        return null
      }
    }).filter(Boolean)

    // 批量添加实体
    processedEntities.forEach(({ stockEntity, pieces }) => {
      if (stockEntity) {
        visualizationFragment.appendChild(stockEntity.cloneNode(true))
        markerFragment.appendChild(stockEntity)
      }
      
      pieces.forEach(piece => {
        if (piece) {
          visualizationFragment.appendChild(piece.cloneNode(true))
          markerFragment.appendChild(piece)
        }
      })
    })

    // 一次性更新DOM
    visualizationEntity.appendChild(visualizationFragment)
    markerContent.appendChild(markerFragment)

    // 更新统计信息
    updateStats()
    
  } catch (error) {
    console.error('创建可视化时出错:', error)
    handleError('创建可视化失败', error)
  }
}

// 优化实体创建
const createPlanEntities = (plan, planIndex) => {
  const originalSpec = Number(plan.originalSpec) || 0
  const stockHeight = props.viewType === 'glass' && plan.stock ? 
    Number(plan.stock.height) || 0 : 0.05

    // 创建原料实体
    const stockEntity = document.createElement('a-entity')
    stockEntity.setAttribute('geometry', {
      primitive: props.viewType === 'glass' ? 'plane' : 'box',
    width: Math.max(0.001, originalSpec) / 500,
    height: props.viewType === 'glass' ? stockHeight / 500 : 0.05,
      depth: props.viewType === 'glass' ? 0.001 : 0.05
    })
    stockEntity.setAttribute('material', {
      color: '#cccccc',
    opacity: 0.5,
    transparent: true,
    side: 'double'
    })
    stockEntity.setAttribute('position', {
      x: 0,
      y: planIndex * (props.viewType === 'glass' ? 0.001 : 0.06),
      z: 0
    })
  stockEntity.setAttribute('visible', 'true')

    // 处理切割片段
  const pieces = []
  if (props.viewType === 'glass' && Array.isArray(plan.placements)) {
    pieces.push(...createGlassPieces(plan.placements, planIndex))
    } else if (props.viewType !== 'glass' && plan.cutDetails) {
    pieces.push(...createBarPieces(plan.cutDetails, planIndex))
  }

  return { stockEntity, pieces }
}

// 批量创建玻璃片段
const createGlassPieces = (placements, planIndex) => {
  return placements
    .map((piece, pieceIndex) => {
      if (!validateGlassPiece(piece)) return null
      return createGlassPiece(piece, planIndex, pieceIndex)
    })
    .filter(Boolean)
}

// 批量创建型材片段
const createBarPieces = (cutDetails, planIndex) => {
  const pieces = parseCutDetails(cutDetails)
  return pieces
    .map((piece, pieceIndex) => {
      if (!validateBarPiece(piece)) return null
      return createBarPiece(piece, planIndex, pieceIndex)
    })
    .filter(Boolean)
}

// 数据验证函数
const validateGlassPiece = (piece) => {
  return piece && 
         typeof piece.width === 'number' && piece.width > 0 &&
         typeof piece.height === 'number' && piece.height > 0 &&
         typeof piece.x === 'number' &&
         typeof piece.y === 'number'
}

const validateBarPiece = (piece) => {
  return piece && 
         typeof piece.length === 'number' && piece.length > 0 &&
         typeof piece.position === 'number'
}

// 创建玻璃切割片段
const createGlassPiece = (piece, planIndex, pieceIndex) => {
  try {
    if (!piece || typeof piece.width !== 'number' || typeof piece.height !== 'number' ||
        typeof piece.x !== 'number' || typeof piece.y !== 'number') {
      throw new Error('无效的玻璃片段数据')
    }

  const entity = document.createElement('a-entity')
  entity.setAttribute('geometry', {
    primitive: 'plane',
      width: Math.max(0.001, piece.width) / 1000,
      height: Math.max(0.001, piece.height) / 1000
  })
  entity.setAttribute('material', {
      color: `hsl(${(pieceIndex * 36) % 360}, 70%, 50%)`,
    opacity: 0.8,
    transparent: true
  })
  entity.setAttribute('position', {
    x: piece.x / 1000,
    y: planIndex * 0.001 + 0.0001,
    z: piece.y / 1000
  })
  return entity
  } catch (error) {
    console.error('创建玻璃片段时出错:', error)
    return null
  }
}

// 创建型材切割片段
const createBarPiece = (piece, planIndex, pieceIndex) => {
  try {
    if (!piece || typeof piece.length !== 'number' || typeof piece.position !== 'number') {
      throw new Error('无效的型材片段数据')
    }

  const entity = document.createElement('a-entity')
  entity.setAttribute('geometry', {
    primitive: 'box',
      width: Math.max(0.001, piece.length) / 1000,
    height: 0.05,
    depth: 0.05
  })
  entity.setAttribute('material', {
      color: `hsl(${(pieceIndex * 36) % 360}, 70%, 50%)`,
    opacity: 0.8,
    transparent: true
  })
  entity.setAttribute('position', {
    x: piece.position / 1000,
    y: planIndex * 0.06,
    z: 0
  })
  return entity
  } catch (error) {
    console.error('创建型材片段时出错:', error)
    return null
  }
}

// 解析切割明细
const parseCutDetails = (cutDetails) => {
  try {
    if (!cutDetails || typeof cutDetails !== 'string') {
      throw new Error('无效的切割明细数据')
    }

  const pieces = []
  let position = 0
  
    cutDetails.split('，').forEach((segment, index) => {
      try {
    const [length, count] = segment.split('×').map(Number)
        if (isNaN(length) || isNaN(count) || length <= 0 || count <= 0) {
          console.warn(`切割明细段 ${index + 1} 数据无效: ${segment}`)
          return
        }

    for (let i = 0; i < count; i++) {
      pieces.push({
        length,
        position: position
      })
          position += length + (props.sawKerf || 0)
        }
      } catch (error) {
        console.error(`解析切割明细段 ${index + 1} 时出错:`, error)
    }
  })
  
  return pieces
  } catch (error) {
    console.error('解析切割明细时出错:', error)
    return []
  }
}

// 更新统计信息
const updateStats = () => {
  try {
    if (!Array.isArray(props.cuttingPlan) || props.cuttingPlan.length === 0) {
      progress.value = 0
      utilization.value = 0
      remainingLength.value = 0
      return
    }

  const totalArea = props.cuttingPlan.reduce((sum, plan) => {
      if (!plan || typeof plan.originalSpec !== 'number') return sum
      const height = props.viewType === 'glass' && plan.stock ? 
        (Number(plan.stock.height) || 0) : 1
      return sum + (plan.originalSpec * height)
  }, 0)

  const usedArea = props.cuttingPlan.reduce((sum, plan) => {
      if (!plan) return sum

      if (props.viewType === 'glass' && Array.isArray(plan.placements)) {
      return sum + plan.placements.reduce((psum, piece) => {
          if (!piece || typeof piece.width !== 'number' || typeof piece.height !== 'number') {
            return psum
          }
        return psum + (piece.width * piece.height)
      }, 0)
    } else if (props.viewType !== 'glass' && plan.cutDetails) {
      const pieces = parseCutDetails(plan.cutDetails)
      return sum + pieces.reduce((psum, piece) => {
          return psum + (piece.length || 0)
      }, 0)
    }
    return sum
  }, 0)

    utilization.value = totalArea > 0 ? 
      Number(((usedArea / totalArea) * 100).toFixed(2)) : 0
    remainingLength.value = Math.max(0, totalArea - usedArea)
    progress.value = utilization.value

    console.log('统计信息更新完成:', {
      totalArea,
      usedArea,
      utilization: utilization.value,
      remainingLength: remainingLength.value
    })

  } catch (error) {
    console.error('更新统计信息时出错:', error)
    progress.value = 0
    utilization.value = 0
    remainingLength.value = 0
  }
}

// 获取开始按钮文本
const getStartButtonText = () => {
  switch (arState.value) {
    case AR_STATES.LOADING:
      return '加载中...'
    case AR_STATES.STARTING:
      return '启动中...'
    case AR_STATES.ERROR:
      return '重试AR'
    default:
      return '启动AR视图'
  }
}

// 获取状态样式类
const getStateClass = () => {
  switch (arState.value) {
    case AR_STATES.RUNNING:
      return 'state-running'
    case AR_STATES.ERROR:
      return 'state-error'
    case AR_STATES.PAUSED:
      return 'state-paused'
    default:
      return ''
  }
}

// 添加错误恢复机制
let errorRecoveryAttempts = 0
const MAX_RECOVERY_ATTEMPTS = 3

const attemptErrorRecovery = async () => {
  if (errorRecoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
    console.error('错误恢复次数超过限制')
    return false
  }
  
  try {
    errorRecoveryAttempts++
    console.log(`尝试错误恢复 (${errorRecoveryAttempts}/${MAX_RECOVERY_ATTEMPTS})`)
    
    // 重置状态
    cleanup()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await initScene()
    
    if (isSceneReady.value) {
      console.log('错误恢复成功')
      errorRecoveryAttempts = 0
      return true
    }
  } catch (error) {
    console.error('错误恢复失败:', error)
  }
  
  return false
}
</script>

<style scoped>
.ar-viewer-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding: 20px;
}

.ar-viewer-aframe {
  position: relative;
  width: 100%;
  height: 600px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform;
}

:deep(video) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  z-index: 0 !important;
  opacity: 1 !important;
  transform: none !important;
  pointer-events: none !important;
  background: transparent !important;
  backface-visibility: hidden !important;
  will-change: transform !important;
  transition: none !important;
}

:deep(.a-canvas) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 1 !important;
  background: transparent !important;
  pointer-events: none !important;
  backface-visibility: hidden !important;
  will-change: transform !important;
  transition: none !important;
}

:deep(a-scene) {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 2 !important;
  background: transparent !important;
  transform-style: preserve-3d !important;
  backface-visibility: hidden !important;
  will-change: transform !important;
}

/* AR使用说明样式 */
.ar-instructions {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.ar-instructions h3 {
  margin: 0 0 20px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.instruction-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.instruction-step {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.instruction-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.step-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #e7f1ff;
  border-radius: 12px;
}

.step-icon i {
  font-size: 24px;
  color: #0d6efd;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  margin: 0 0 8px;
  color: #212529;
  font-size: 18px;
}

.step-content p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.step-content a {
  color: #0d6efd;
  text-decoration: none;
}

.step-content a:hover {
  text-decoration: underline;
}

/* 控制面板样式 */
.ar-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #0d6efd;
  color: white;
}

.btn-primary:hover {
  background: #0b5ed7;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 错误提示样式 */
.ar-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(220, 53, 69, 0.9);
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  z-index: 11;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-content i {
  font-size: 20px;
}

.state-running {
  color: #4CAF50;
}

.state-error {
  color: #f44336;
}

.state-paused {
  color: #ff9800;
}

/* 调试信息面板样式 */
.ar-debug-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
  z-index: 12;
}

.debug-info p {
  margin: 5px 0;
  font-size: 12px;
  line-height: 1.2;
}
</style> 
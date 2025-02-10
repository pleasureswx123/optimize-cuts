<template>
  <div class="glass-cutting">
    <div class="page-subtitle">
      <div class="container">
        <h2>玻璃切割优化</h2>
        <p>智能优化玻璃切割方案，支持多种规格，最大化材料利用率</p>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- 输入区域 -->
        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">原料规格</h3>
              <form @submit.prevent="calculateOptimization">
                <!-- 原料清单 -->
                <div class="mb-3">
                  <label class="form-label">原料清单</label>
                  <div v-for="(stock, index) in stockList" :key="index" class="mb-2">
                    <div class="d-flex stock-item">
                      <div class="flex-grow-1 d-flex">
                        <input
                          type="number"
                          class="form-control"
                          v-model="stock.width"
                          placeholder="宽度(mm)"
                          required
                          min="0"
                          step="1"
                        >
                        <input
                          type="number"
                          class="form-control"
                          v-model="stock.height"
                          placeholder="高度(mm)"
                          required
                          min="0"
                          step="1"
                        >
                        <input
                          type="number"
                          class="form-control"
                          v-model="stock.price"
                          placeholder="单价"
                          required
                          min="0"
                          step="0.01"
                        >
                      </div>
                      <button
                        type="button"
                        class="btn btn-danger ms-2 d-flex align-items-center delete-btn"
                        @click="removeStockItem(index)"
                        :disabled="stockList.length === 1"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-success w-100 mb-3"
                    @click="addStockItem"
                  >
                    <i class="fas fa-plus me-2"></i>添加原料规格
                  </button>
                </div>

                <!-- 切割清单 -->
                <div class="mb-3">
                  <label class="form-label">切割清单</label>
                  <div v-for="(item, index) in cutList" :key="index" class="mb-2">
                    <div class="d-flex cut-item">
                      <div class="flex-grow-1 d-flex">
                        <input
                          type="number"
                          class="form-control"
                          v-model="item.width"
                          placeholder="宽度(mm)"
                          required
                          min="0"
                          step="1"
                        >
                        <input
                          type="number"
                          class="form-control"
                          v-model="item.height"
                          placeholder="高度(mm)"
                          required
                          min="0"
                          step="1"
                        >
                        <input
                          type="number"
                          class="form-control"
                          v-model="item.quantity"
                          placeholder="数量"
                          required
                          min="1"
                          step="1"
                        >
                      </div>
                      <button
                        type="button"
                        class="btn btn-danger ms-2 d-flex align-items-center delete-btn"
                        @click="removeCutItem(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-success w-100"
                    @click="addCutItem"
                  >
                    <i class="fas fa-plus me-2"></i>添加切割项
                  </button>
                </div>

                <!-- 切割损耗 -->
                <div class="mb-3">
                  <label class="form-label">切割损耗</label>
                  <div class="input-group">
                    <input
                      type="number"
                      class="form-control"
                      v-model="cuttingLoss"
                      placeholder="切割损耗(mm)"
                      min="0"
                      step="0.1"
                    >
                    <span class="input-group-text">mm</span>
                  </div>
                  <div class="form-text">设置每次切割的损耗宽度，默认为0mm</div>
                </div>

                <!-- 切割参数配置 -->
                <div class="card mb-3">
                  <div class="card-body p-0">
                    <div class="advanced-settings">
                      <div class="settings-header" @click="showAdvancedSettings = !showAdvancedSettings">
                        <div class="d-flex align-items-center">
                          <i class="fas fa-cog me-2"></i>
                          <h4 class="mb-0">高级参数设置</h4>
                        </div>
                        <i :class="['fas', showAdvancedSettings ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
                      </div>
                      
                      <div class="settings-content" v-show="showAdvancedSettings">
                        <!-- 优化方案选择 -->
                        <div class="parameter-group">
                          <label class="form-label d-flex align-items-center">
                            <i class="fas fa-sliders-h me-2"></i>
                            优化方案选择
                            <i class="fas fa-info-circle ms-2 text-muted" 
                               data-bs-toggle="tooltip" 
                               title="选择不同的优化策略来满足不同的生产需求"></i>
                          </label>
                          <div class="parameter-options">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="optimizationStrategy" value="utilization" id="maxUtilization">
                              <label class="form-check-label" for="maxUtilization">
                                <i class="fas fa-chart-pie utilization-icon"></i>
                                <div class="option-content">
                                  <div class="option-title">利用率最高</div>
                                  <small class="text-muted">适合材料成本高的情况，追求最大化利用率</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="optimizationStrategy" value="minCuts" id="minCutting">
                              <label class="form-check-label" for="minCutting">
                                <i class="fas fa-layer-group mincuts-icon"></i>
                                <div class="option-content">
                                  <div class="option-title">切割图最少</div>
                                  <small class="text-muted">适合批量生产，提高切割效率</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="optimizationStrategy" value="price" id="priceOptimized">
                              <label class="form-check-label" for="priceOptimized">
                                <i class="fas fa-coins price-icon"></i>
                                <div class="option-content">
                                  <div class="option-title">按价格优化</div>
                                  <small class="text-muted">优先使用低成本材料，平衡成本和利用率</small>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        <!-- 排样方案 -->
                        <div class="parameter-group">
                          <label class="form-label d-flex align-items-center">
                            <i class="fas fa-th me-2"></i>
                            排样方案
                            <i class="fas fa-info-circle ms-2 text-muted" 
                               data-bs-toggle="tooltip" 
                               title="选择不同的排样方式来适应不同的切割设备和工艺要求"></i>
                          </label>
                          <div class="parameter-options">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="layoutStrategy" value="any" id="layoutAny">
                              <label class="form-check-label" for="layoutAny">
                                <i class="fas fa-random"></i>
                                <div class="option-content">
                                  <div class="option-title">任意排样</div>
                                  <small class="text-muted">不限制排列方向，追求最优解</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="layoutStrategy" value="horizontal" id="layoutHorizontal">
                              <label class="form-check-label" for="layoutHorizontal">
                                <i class="fas fa-arrows-alt-h"></i>
                                <div class="option-content">
                                  <div class="option-title">横向并齐</div>
                                  <small class="text-muted">适合横向切割设备，便于批量加工</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="layoutStrategy" value="vertical" id="layoutVertical">
                              <label class="form-check-label" for="layoutVertical">
                                <i class="fas fa-arrows-alt-v"></i>
                                <div class="option-content">
                                  <div class="option-title">纵向并齐</div>
                                  <small class="text-muted">适合纵向切割设备，便于连续加工</small>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>

                        <!-- 第一刀方向 -->
                        <div class="parameter-group">
                          <label class="form-label d-flex align-items-center">
                            <i class="fas fa-ruler me-2"></i>
                            第一刀方向
                            <i class="fas fa-info-circle ms-2 text-muted" 
                               data-bs-toggle="tooltip" 
                               title="选择第一刀切割方向，便于后续单人操作"></i>
                          </label>
                          <div class="parameter-options">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="firstCutDirection" value="none" id="noFirstCut">
                              <label class="form-check-label" for="noFirstCut">
                                <i class="fas fa-ban"></i>
                                <div class="option-content">
                                  <div class="option-title">不需要第一刀</div>
                                  <small class="text-muted">材料尺寸合适，无需预切割</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="firstCutDirection" value="vertical" id="firstVertical">
                              <label class="form-check-label" for="firstVertical">
                                <i class="fas fa-arrows-alt-v"></i>
                                <div class="option-content">
                                  <div class="option-title">纵向切割</div>
                                  <small class="text-muted">从中间纵向切开，适合需要减小板材长度的情况</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="firstCutDirection" value="horizontal" id="firstHorizontal">
                              <label class="form-check-label" for="firstHorizontal">
                                <i class="fas fa-arrows-alt-h"></i>
                                <div class="option-content">
                                  <div class="option-title">横向切割</div>
                                  <small class="text-muted">从中间横向切开，适合需要减小板材宽度的情况</small>
                                </div>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100">
                  <i class="fas fa-calculator me-2"></i>计算优化方案
                </button>
              </form>
            </div>
          </div>

          <!-- 导入导出 -->
          <div class="card mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">数据导入导出</h3>
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary" @click="importFromExcel">
                  <i class="fas fa-file-excel me-2"></i>从Excel导入
                </button>
                <button class="btn btn-outline-primary" @click="exportToExcel">
                  <i class="fas fa-download me-2"></i>导出到Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 结果展示区域 -->
        <div class="col-lg-8">
          <!-- 优化结果统计 -->
          <div class="card mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">优化结果统计</h3>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="stats-item text-center">
                    <div class="stats-icon mb-2">
                      <i class="fas fa-percentage"></i>
                    </div>
                    <div class="stats-value">{{ utilization }}%</div>
                    <div class="stats-label">材料利用率</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stats-item text-center">
                    <div class="stats-icon mb-2">
                      <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="stats-value">{{ totalSheets }}</div>
                    <div class="stats-label">需要原料数</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stats-item text-center">
                    <div class="stats-icon mb-2">
                      <i class="fas fa-trash-alt"></i>
                    </div>
                    <div class="stats-value">{{ (wasteArea/1000000).toFixed(2) }}m²</div>
                    <div class="stats-label">总废料面积</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stats-item text-center">
                    <div class="stats-icon mb-2">
                      <i class="fas fa-yen-sign"></i>
                    </div>
                    <div class="stats-value">¥{{ totalCost }}</div>
                    <div class="stats-label">总成本</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 原料使用统计 -->
          <div class="card mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">原料使用统计</h3>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>原料规格</th>
                      <th>单价</th>
                      <th>使用数量</th>
                      <th>总价</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(stat, index) in materialUsageStats" :key="index">
                      <td>{{ stat.spec }}</td>
                      <td>¥{{ stat.price }}</td>
                      <td>{{ stat.quantity }}块</td>
                      <td>¥{{ stat.total }}</td>
                    </tr>
                    <tr class="table-info">
                      <td colspan="2"><strong>合计</strong></td>
                      <td><strong>{{ totalSheets }}块</strong></td>
                      <td><strong>¥{{ totalCost }}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- 切割方案可视化 -->
          <div class="card mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">切割方案可视化</h3>
              <div class="cutting-visualization" ref="visualizationContainer"></div>
            </div>
          </div>

          <!-- 详细切割方案 -->
          <div class="card">
            <div class="card-body">
              <h3 class="card-title mb-4">详细切割方案</h3>
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>原料编号</th>
                      <th>原料规格</th>
                      <th>切割序号</th>
                      <th>尺寸(mm)</th>
                      <th>位置(x,y)</th>
                      <th>是否旋转</th>
                      <th>是否余料</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="cuttingPlan.length">
                      <template v-for="(group, groupIndex) in groupedCuttingPlans" :key="groupIndex">
                        <!-- 原料规格标题行 -->
                        <tr class="table-secondary">
                          <td colspan="7">
                            <strong>原料规格: {{ group.spec }}</strong>
                          </td>
                        </tr>
                        <!-- 切割件信息 -->
                        <template v-for="(cut, cutIndex) in group.cuts" :key="cutIndex">
                          <tr>
                        <td>{{ cut.sheetIndex + 1 }}</td>
                            <td>-</td>
                        <td>{{ cut.sequence }}</td>
                        <td>{{ cut.width }}×{{ cut.height }}</td>
                        <td>({{ cut.x }},{{ cut.y }})</td>
                        <td>{{ cut.rotated ? '是' : '否' }}</td>
                        <td>
                              <template v-if="cut.remainingSpaces && cut.remainingSpaces.length > 0">
                                <div class="waste-info">
                                  <div class="waste-area">
                                    <i class="fas fa-square-full text-danger me-1"></i>
                                    <span>{{ (cut.wasteArea/1000000).toFixed(2) }}m²</span>
                                  </div>
                                  <div class="waste-spaces">
                                    <div class="waste-spaces-header">
                                      <i class="fas fa-th-large text-muted me-1"></i>
                                      <span>余料区域:</span>
                                    </div>
                                    <div class="waste-spaces-list">
                                      <div v-for="(space, spaceIndex) in cut.remainingSpaces" :key="spaceIndex" 
                                           class="waste-space-item">
                                        <span class="space-size">{{ space.width }}×{{ space.height }}</span>
                                        <span class="space-position">({{ space.x }},{{ space.y }})</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </template>
                              <span v-else class="no-waste">
                                <i class="fas fa-check-circle text-success me-1"></i>
                                否
                          </span>
                        </td>
                      </tr>
                        </template>
                      </template>
                    </template>
                    <tr v-else>
                      <td colspan="7" class="text-center">暂无切割方案</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import * as d3 from 'd3'
import * as XLSX from 'xlsx'

// 状态定义
const stockList = ref([
  { width: 1220, height: 2440, price: 1000 }  // 默认一个原料规格
])
const cutList = ref([
  { width: 500, height: 600, quantity: 5, canRotate: true }  // 添加旋转选项
])
const utilization = ref(0)
const totalSheets = ref(0)
const wasteArea = ref(0)
const totalCost = ref(0)
const cuttingPlan = ref([])
const visualizationContainer = ref(null)
const materialUsageStats = ref([])  // 新增：原料使用统计
const cuttingLoss = ref(0)
const optimizationStrategy = ref('utilization')
const layoutStrategy = ref('any')
const firstCutDirection = ref('none')
const showAdvancedSettings = ref(false)

// 添加原料规格
const addStockItem = () => {
  stockList.value.push({
    width: 1220,
    height: 2440,
    price: 1000
  })
}

// 移除原料规格
const removeStockItem = (index) => {
  stockList.value.splice(index, 1)
}

// 添加切割项
const addCutItem = () => {
  cutList.value.push({
    width: 500,
    height: 600,
    quantity: 5,
    canRotate: true  // 保持默认可旋转
  })
}

// 移除切割项
const removeCutItem = (index) => {
  cutList.value.splice(index, 1)
}

// 计算优化方案
const calculateOptimization = () => {
  try {
    console.log('==================== 开始计算优化方案 ====================')
    console.log('输入参数:')
    console.log('原料清单:', JSON.stringify(stockList.value, null, 2))
    console.log('切割清单:', JSON.stringify(cutList.value, null, 2))
    console.log('切割损耗:', cuttingLoss.value)
    console.log('优化策略:', optimizationStrategy.value)
    console.log('排样方案:', layoutStrategy.value)
    console.log('第一刀方向:', firstCutDirection.value)

    // 1. 数据预处理和排序策略
    const allPieces = []
    cutList.value.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        allPieces.push({
          width: item.width,
          height: item.height,
          canRotate: item.canRotate,
          originalIndex: cutList.value.indexOf(item),
          area: item.width * item.height
        })
      }
    })
    console.log('预处理 - 展开所有切割件:', allPieces.length, '个')

    // 按面积降序排序，优先处理大部件
    allPieces.sort((a, b) => b.area - a.area)
    console.log('排序策略 - 按面积降序排序完成')
    console.log('最大切割件:', JSON.stringify(allPieces[0]))
    console.log('最小切割件:', JSON.stringify(allPieces[allPieces.length - 1]))

    // 2. 初始化结果数组和余料列表
    const result = []
    const remainingPieces = [...allPieces]
    const offcuts = [] // 余料列表
    console.log('初始化 - 开始主循环处理', remainingPieces.length, '个切割件')

    // 3. 主要优化循环
    let iterationCount = 0
    while (remainingPieces.length > 0) {
      iterationCount++
      console.log(`\n-------- 开始第 ${iterationCount} 次迭代 --------`)
      console.log(`当前剩余切割件数量: ${remainingPieces.length}`)
      const piece = remainingPieces[0]
      console.log('处理切割件:', JSON.stringify(piece))
      
      let placed = false
      let bestPlacement = { score: -Infinity }
      
      // 首先尝试在余料中放置
      if (offcuts.length > 0) {
        console.log(`尝试在 ${offcuts.length} 个余料区域中放置`)
      }
      for (let i = 0; i < offcuts.length && !placed; i++) {
        const offcut = offcuts[i]
        console.log(`检查余料区域 ${i + 1}/${offcuts.length}, 包含 ${offcut.spaces.length} 个可用空间`)
        
        for (const space of offcut.spaces) {
          // 检查普通方向
          if (canFitPiece(piece, space)) {
            const normalPlacement = evaluatePlacement(result[offcut.stockIndex], space, piece, false)
            console.log(`余料空间 正常放置评分: ${normalPlacement.score}`)
            
            if (normalPlacement.score > bestPlacement.score) {
              bestPlacement = {
                ...normalPlacement,
                stock: result[offcut.stockIndex],
                space,
                rotated: false,
                stockIndex: offcut.stockIndex,
                isOffcut: true,
                offcutIndex: i
              }
              console.log('更新最佳放置方案 - 余料正常放置')
            }
          }
          
          // 检查旋转方向
          if (piece.canRotate && canFitPieceRotated(piece, space)) {
            const rotatedPlacement = evaluatePlacement(result[offcut.stockIndex], space, piece, true)
            console.log(`余料空间 旋转放置评分: ${rotatedPlacement.score}`)
            
            if (rotatedPlacement.score > bestPlacement.score) {
              bestPlacement = {
                ...rotatedPlacement,
                stock: result[offcut.stockIndex],
                space,
                rotated: true,
                stockIndex: offcut.stockIndex,
                isOffcut: true,
                offcutIndex: i
              }
              console.log('更新最佳放置方案 - 余料旋转放置')
            }
          }
        }
      }
      
      // 如果余料中无法放置，尝试在现有板材的主要区域放置
      if (bestPlacement.score === -Infinity) {
        console.log('在余料中未找到合适位置，尝试在现有板材中放置')
        for (let i = 0; i < result.length && !placed; i++) {
          const stock = result[i]
          const spaces = findAvailableSpaces(stock)
          console.log(`检查板材 ${i + 1}/${result.length}, 发现 ${spaces.length} 个可用空间`)
          
          for (const space of spaces) {
            // 检查普通方向
            if (canFitPiece(piece, space)) {
              const normalPlacement = evaluatePlacement(stock, space, piece, false)
              console.log(`板材空间 正常放置评分: ${normalPlacement.score}`)
              
              if (normalPlacement.score > bestPlacement.score) {
                bestPlacement = {
                  ...normalPlacement,
                  stock,
                  space,
                  rotated: false,
                  stockIndex: i,
                  isOffcut: false
                }
                console.log('更新最佳放置方案 - 板材正常放置')
              }
            }
            
            // 检查旋转方向
            if (piece.canRotate && canFitPieceRotated(piece, space)) {
              const rotatedPlacement = evaluatePlacement(stock, space, piece, true)
              console.log(`板材空间 旋转放置评分: ${rotatedPlacement.score}`)
              
              if (rotatedPlacement.score > bestPlacement.score) {
                bestPlacement = {
                  ...rotatedPlacement,
                  stock,
                  space,
                  rotated: true,
                  stockIndex: i,
                  isOffcut: false
                }
                console.log('更新最佳放置方案 - 板材旋转放置')
              }
            }
          }
        }
      }

      // 如果找到合适的位置，放置切割件
      if (bestPlacement.score > -Infinity) {
        console.log('找到最佳放置位置:', JSON.stringify(bestPlacement))
        const cut = {
          x: bestPlacement.space.x,
          y: bestPlacement.space.y,
          width: bestPlacement.rotated ? piece.height : piece.width,
          height: bestPlacement.rotated ? piece.width : piece.height,
          originalIndex: piece.originalIndex,
          rotated: bestPlacement.rotated
        }
        bestPlacement.stock.cuts.push(cut)
        placed = true
        
        // 更新余料区域
        if (bestPlacement.isOffcut) {
          console.log('更新余料区域')
          const offcut = offcuts[bestPlacement.offcutIndex]
          const spaceIndex = offcut.spaces.indexOf(bestPlacement.space)
          offcut.spaces.splice(spaceIndex, 1)
          
          const newSpaces = findRemainingSpaces(bestPlacement.space, cut)
          console.log(`生成 ${newSpaces.length} 个新的余料空间`)
          offcut.spaces.push(...newSpaces)
          
          if (offcut.spaces.length === 0) {
            console.log('移除空余料区域')
            offcuts.splice(bestPlacement.offcutIndex, 1)
          }
        } else {
          console.log('计算新的余料区域')
          const newOffcuts = {
            stockIndex: bestPlacement.stockIndex,
            spaces: findRemainingSpaces(bestPlacement.space, cut)
          }
          if (newOffcuts.spaces.length > 0) {
            console.log(`添加 ${newOffcuts.spaces.length} 个新的余料空间`)
            offcuts.push(newOffcuts)
          }
        }
      }

      // 如果无法放入现有板材和余料，创建新板材
      if (!placed) {
        console.log('需要创建新板材')
        const normalFit = piece.width <= stockList.value[0].width && piece.height <= stockList.value[0].height
        const rotatedFit = piece.canRotate && piece.height <= stockList.value[0].width && piece.width <= stockList.value[0].height
        
        const shouldRotateStock = !normalFit && rotatedFit
        console.log('是否需要旋转原料:', shouldRotateStock)
        
        const newStock = {
          width: shouldRotateStock ? stockList.value[0].height : stockList.value[0].width,
          height: shouldRotateStock ? stockList.value[0].width : stockList.value[0].height,
          price: stockList.value[0].price,
          cuts: [{
            x: 0,
            y: 0,
            width: piece.width,
            height: piece.height,
            originalIndex: piece.originalIndex,
            rotated: false
          }]
        }
        result.push(newStock)
        console.log('创建新板材:', JSON.stringify(newStock))
        
        // 计算新板材的初始余料区域
        const initialSpace = {
          x: 0,
          y: piece.height,
          width: newStock.width,
          height: newStock.height - piece.height
        }
        if (initialSpace.height >= 10) {
          offcuts.push({
            stockIndex: result.length - 1,
            spaces: [initialSpace]
          })
          console.log('添加上方余料空间:', JSON.stringify(initialSpace))
        }
        
        const rightSpace = {
          x: piece.width,
          y: 0,
          width: newStock.width - piece.width,
          height: piece.height
        }
        if (rightSpace.width >= 10) {
          if (offcuts.length > 0 && offcuts[offcuts.length - 1].stockIndex === result.length - 1) {
            offcuts[offcuts.length - 1].spaces.push(rightSpace)
          } else {
            offcuts.push({
              stockIndex: result.length - 1,
              spaces: [rightSpace]
            })
          }
          console.log('添加右侧余料空间:', JSON.stringify(rightSpace))
        }
      }

      remainingPieces.shift()
      console.log(`完成第 ${iterationCount} 次迭代，剩余 ${remainingPieces.length} 个切割件`)
    }

    console.log('\n==================== 优化计算完成 ====================')
    console.log('使用板材数量:', result.length)
    console.log('余料区域数量:', offcuts.length)

    // 4. 更新统计数据
    console.log('\n开始更新统计数据...')
    updateStats(result)
    generateCuttingPlan(result)
    updateVisualization(result)
    
    console.log('计算过程完成!')
  } catch (error) {
    console.error('计算优化方案出错:', error)
  }
}

// 评估放置方案
const evaluatePlacement = (stock, space, piece, isRotated) => {
  console.log('\n评估放置方案:')
  console.log('待放置切割件:', JSON.stringify(piece))
  console.log('目标空间:', JSON.stringify(space))
  console.log('是否旋转:', isRotated)
  
  const pieceWidth = isRotated ? piece.height : piece.width
  const pieceHeight = isRotated ? piece.width : piece.height
  
  // 计算放置后的剩余空间
  const remainingSpaces = findRemainingSpaces(space, {
    x: space.x,
    y: space.y,
    width: pieceWidth,
    height: pieceHeight
  })
  
  // 计算评分
  let score = 0
  
  // 1. 考虑剩余空间的可用性 (40%)
  const usableSpaces = remainingSpaces.filter(s => s.width >= 100 && s.height >= 100)
  const usableArea = usableSpaces.reduce((sum, s) => sum + s.width * s.height, 0)
  const spaceScore = (usableArea / (space.width * space.height)) * 40
  console.log('空间可用性得分:', spaceScore)
  score += spaceScore
  
  // 2. 考虑空间的形状 (30%)
  const aspectRatios = usableSpaces.map(s => Math.min(s.width / s.height, s.height / s.width))
  const averageAspectRatio = aspectRatios.length > 0 ? 
    aspectRatios.reduce((sum, ratio) => sum + ratio, 0) / aspectRatios.length : 0
  const shapeScore = averageAspectRatio * 30
  console.log('空间形状得分:', shapeScore)
  score += shapeScore
  
  // 3. 考虑剩余空间的数量 (30%)
  const fragmentScore = (1 - usableSpaces.length / 10) * 30
  console.log('空间碎片得分:', fragmentScore)
  score += fragmentScore
  
  console.log('总评分:', score)
  return { score }
}

// 计算放置切割件后的剩余空间
const findRemainingSpaces = (space, cut) => {
  const spaces = []
  
  // 上方空间
  if (cut.y > space.y) {
    spaces.push({
      x: space.x,
      y: space.y,
      width: space.width,
      height: cut.y - space.y
    })
  }
  
  // 下方空间
  if (cut.y + cut.height < space.y + space.height) {
    spaces.push({
      x: space.x,
      y: cut.y + cut.height,
      width: space.width,
      height: space.y + space.height - (cut.y + cut.height)
    })
  }
  
  // 左侧空间
  if (cut.x > space.x) {
    spaces.push({
      x: space.x,
      y: cut.y,
      width: cut.x - space.x,
      height: cut.height
    })
  }
  
  // 右侧空间
  if (cut.x + cut.width < space.x + space.width) {
    spaces.push({
      x: cut.x + cut.width,
      y: cut.y,
      width: space.x + space.width - (cut.x + cut.width),
      height: cut.height
    })
  }
  
  // 过滤掉太小的空间
  return spaces.filter(s => s.width >= 10 && s.height >= 10 && s.width * s.height >= 100)
}

// 计算空间浪费
const calculateWaste = (space, piece) => {
  const spaceArea = space.width * space.height
  const pieceArea = piece.width * piece.height
  return spaceArea - pieceArea
}

// 检查piece是否能放入space
const canFitPiece = (piece, space) => {
  return piece.width <= space.width && piece.height <= space.height
}

// 检查旋转后的piece是否能放入space
const canFitPieceRotated = (piece, space) => {
  return piece.height <= space.width && piece.width <= space.height
}

// 查找可用空间
const findAvailableSpaces = (stock) => {
  console.log('开始查找可用空间...')
  
  // 初始化一个大矩形作为可用空间
  const spaces = [{
    x: 0,
    y: 0,
    width: stock.width,
    height: stock.height
  }]
  
  // 对于每个已放置的切割件，分割受影响的空间
  stock.cuts.forEach(cut => {
    const newSpaces = []
    spaces.forEach(space => {
      // 检查当前空间是否与切割件重叠
      if (isOverlap(space, cut)) {
        // 将空间分割成最多4个新的矩形空间
        // 上方空间
        if (space.y < cut.y) {
          newSpaces.push({
            x: space.x,
            y: space.y,
            width: space.width,
            height: cut.y - space.y
          })
        }
        // 下方空间
        if (space.y + space.height > cut.y + cut.height) {
          newSpaces.push({
            x: space.x,
            y: cut.y + cut.height,
            width: space.width,
            height: space.y + space.height - (cut.y + cut.height)
          })
        }
        // 左侧空间
        if (space.x < cut.x) {
          newSpaces.push({
            x: space.x,
            y: cut.y,
            width: cut.x - space.x,
            height: cut.height
          })
        }
        // 右侧空间
        if (space.x + space.width > cut.x + cut.width) {
          newSpaces.push({
            x: cut.x + cut.width,
            y: cut.y,
            width: space.x + space.width - (cut.x + cut.width),
            height: cut.height
          })
        }
      } else {
        // 如果不重叠，保留原空间
        newSpaces.push(space)
      }
    })
    
    // 更新空间列表，移除面积太小的空间
    spaces.length = 0
    spaces.push(...newSpaces.filter(space => 
      space.width >= 10 && space.height >= 10 && space.width * space.height >= 100
    ))
  })
  
  // 合并相邻的矩形空间
  return mergeSpaces(spaces)
}

// 检查两个矩形是否重叠
const isOverlap = (rect1, rect2) => {
  return !(rect1.x + rect1.width <= rect2.x ||
           rect2.x + rect2.width <= rect1.x ||
           rect1.y + rect1.height <= rect2.y ||
           rect2.y + rect2.height <= rect1.y)
}

// 合并相邻的矩形空间
const mergeSpaces = (spaces) => {
  let merged = true
  while (merged) {
    merged = false
    for (let i = 0; i < spaces.length; i++) {
      for (let j = i + 1; j < spaces.length; j++) {
        const space1 = spaces[i]
        const space2 = spaces[j]
        
        // 检查是否可以水平合并
        if (space1.y === space2.y && space1.height === space2.height) {
          if (space1.x + space1.width === space2.x) {
            space1.width += space2.width
            spaces.splice(j, 1)
            merged = true
            break
          }
        }
        // 检查是否可以垂直合并
        else if (space1.x === space2.x && space1.width === space2.width) {
          if (space1.y + space1.height === space2.y) {
            space1.height += space2.height
            spaces.splice(j, 1)
            merged = true
            break
          }
        }
      }
      if (merged) break
    }
  }
  return spaces
}

// 更新统计数据
const updateStats = (result) => {
  console.log('开始更新统计数据...')
  // 重置统计数据
  let totalUsedArea = 0
  let totalStockArea = 0
  let totalStockCost = 0
  
  // 创建原料使用统计
  const usageMap = new Map()
  
  result.forEach(stock => {
    totalStockArea += stock.width * stock.height
    totalStockCost += stock.price
    totalUsedArea += stock.cuts.reduce((sum, cut) => sum + cut.width * cut.height, 0)
    
    // 统计每种规格的使用情况
    const specKey = `${stock.width}×${stock.height}`
    if (!usageMap.has(specKey)) {
      usageMap.set(specKey, {
        spec: specKey,
        price: stock.price,
        quantity: 1,
        total: stock.price
      })
    } else {
      const stat = usageMap.get(specKey)
      stat.quantity++
      stat.total = stat.quantity * stat.price
    }
  })
  
  // 更新统计数据
  totalSheets.value = result.length
  utilization.value = Math.round((totalUsedArea / totalStockArea) * 100)
  wasteArea.value = totalStockArea - totalUsedArea
  totalCost.value = totalStockCost
  materialUsageStats.value = Array.from(usageMap.values())
  
  console.log('统计数据更新完成:', {
    总板材数: totalSheets.value,
    材料利用率: utilization.value + '%',
    废料面积: wasteArea.value,
    总成本: totalCost.value,
    材料使用统计: materialUsageStats.value
  })
}

// 生成切割方案
const generateCuttingPlan = (result) => {
  console.log('开始生成切割方案...')
  
  // 按原料规格分组
  const groupedPlans = {}
  result.forEach((stock, stockIndex) => {
    const specKey = `${stock.width}×${stock.height}`
    if (!groupedPlans[specKey]) {
      groupedPlans[specKey] = []
    }
    
    // 获取该板材的余料区域
    const remainingSpaces = findAvailableSpaces(stock)
    const totalWasteArea = remainingSpaces.reduce((sum, space) => sum + space.width * space.height, 0)
    
    // 添加切割信息和余料信息
    stock.cuts.forEach((cut, cutIndex) => {
      groupedPlans[specKey].push({
      sheetIndex: stockIndex,
      sequence: cutIndex + 1,
      width: cut.width,
      height: cut.height,
      x: cut.x,
      y: cut.y,
      rotated: cut.rotated,
        originalSpec: specKey,
        remainingSpaces: cutIndex === stock.cuts.length - 1 ? remainingSpaces : [],
        wasteArea: cutIndex === stock.cuts.length - 1 ? totalWasteArea : 0
      })
    })
  })
  
  // 转换为数组格式
  cuttingPlan.value = Object.entries(groupedPlans).flatMap(([spec, plans]) => plans)
  console.log('切割方案生成完成:', cuttingPlan.value)
}

// 更新可视化
const updateVisualization = (result) => {
  console.log('开始更新可视化...')
  if (!visualizationContainer.value) {
    console.error('可视化容器不存在!')
    return
  }

  // 清除现有内容
  d3.select(visualizationContainer.value).selectAll('*').remove()

  const margin = { top: 80, right: 120, bottom: 40, left: 80 }
  const containerWidth = visualizationContainer.value.clientWidth - margin.left - margin.right
  console.log('容器宽度:', containerWidth)
  
  // 按规格分组
  const groupedStocks = {}
  result.forEach((stock, index) => {
    const key = `${stock.width}×${stock.height}`
    if (!groupedStocks[key]) {
      groupedStocks[key] = []
    }
    groupedStocks[key].push({ ...stock, originalIndex: index })
  })
  
  // 计算每个规格组的最大数量
  const maxStocksInGroup = Math.max(...Object.values(groupedStocks).map(group => group.length))
  
  // 计算单个原料板的宽度和总高度
  const stockWidth = containerWidth * 0.8  // 留出空间给标注
  const scale = stockWidth / Math.max(...result.map(s => s.width))
  
  // 计算总高度（每组之间留出间距）
  const groupSpacing = 60  // 组间距
  const totalHeight = Object.entries(groupedStocks).reduce((sum, [key, stocks]) => {
    const stockHeight = stocks[0].height * scale
    return sum + stocks.length * (stockHeight + margin.top) + groupSpacing
  }, 0)

  // 创建SVG
  const svg = d3.select(visualizationContainer.value)
    .append('svg')
    .attr('width', containerWidth + margin.left + margin.right)
    .attr('height', totalHeight + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 创建颜色比例尺
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  // 创建图例
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${containerWidth + 20}, 0)`)

  // 获取所有不同的切割件尺寸（考虑旋转）
  const uniqueCuts = new Set()
  const dimensionColorMap = new Map()
  let colorIndex = 0

  result.forEach(stock => {
    stock.cuts.forEach(cut => {
      // 创建标准化的尺寸字符串（宽度和高度按照从小到大排序）
      const normalizedSize = [cut.width, cut.height].sort((a, b) => a - b).join('×')
      if (!dimensionColorMap.has(normalizedSize)) {
        dimensionColorMap.set(normalizedSize, colorIndex++)
      }
      uniqueCuts.add(normalizedSize)
    })
  })

  // 添加图例项
  Array.from(uniqueCuts).forEach((cutSize) => {
    const legendItem = legend.append('g')
      .attr('transform', `translate(0, ${dimensionColorMap.get(cutSize) * 25})`)

    legendItem.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', colorScale(dimensionColorMap.get(cutSize)))

    legendItem.append('text')
      .attr('x', 25)
      .attr('y', 12)
      .text(cutSize)
      .attr('font-size', '12px')
  })

  // 绘制每组原料板
  let yOffset = 0
  Object.entries(groupedStocks).forEach(([spec, stocks]) => {
    const stockHeight = stocks[0].height * scale
    const [width, height] = spec.split('×').map(Number)
    
    // 绘制同规格的原料板
    stocks.forEach((stock, groupIndex) => {
      const stockGroup = svg.append('g')
        .attr('transform', `translate(0,${yOffset + groupIndex * (stockHeight + margin.top)})`)

      // 绘制原料板背景
      stockGroup.append('rect')
        .attr('class', 'stock-sheet')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', stock.width * scale)
        .attr('height', stockHeight)
        .attr('fill', '#f8f9fa')
        .attr('stroke', '#dee2e6')

      // 添加左侧高度标注框
      stockGroup.append('g')
        .attr('class', 'height-label')
        .attr('transform', `translate(-30, ${stockHeight / 2})`)
        .call(g => {
          // 背景框
          g.append('rect')
            .attr('x', -50)
            .attr('y', -10)
            .attr('width', 100)
            .attr('height', 20)
            .attr('fill', '#fff')
            .attr('stroke', '#2196f3')
            .attr('stroke-width', 1.5)
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('transform', 'rotate(-90)')

          // 高度文字
          g.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', '500')
            .attr('fill', '#2196f3')
            .attr('transform', 'rotate(-90)')
            .text(`${stock.height}mm`)

          // 装饰线条
          g.append('line')
            .attr('x1', -60)
            .attr('y1', 0)
            .attr('x2', -40)
            .attr('y2', 0)
            .attr('stroke', '#2196f3')
            .attr('stroke-width', 1.5)
            .attr('transform', 'rotate(-90)')

          g.append('line')
            .attr('x1', 40)
            .attr('y1', 0)
            .attr('x2', 60)
            .attr('y2', 0)
            .attr('stroke', '#2196f3')
            .attr('stroke-width', 1.5)
            .attr('transform', 'rotate(-90)')
        })

      // 添加原料板编号
      stockGroup.append('g')
        .attr('class', 'stock-number')
        .attr('transform', `translate(${stock.width * scale / 2}, -55)`)
        .call(g => {
          // 背景框
          g.append('rect')
            .attr('x', -45)
            .attr('y', -12)
            .attr('width', 90)
            .attr('height', 24)
            .attr('fill', '#f8f9fa')
            .attr('stroke', '#dee2e6')
            .attr('rx', 4)
            .attr('ry', 4)
          
          // 编号文本
          g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', '#495057')
            .text(`原料 ${stock.originalIndex + 1}`)
        })

      // 修改尺寸标注框的位置
      stockGroup.append('rect')
        .attr('x', stock.width * scale / 2 - 50)
        .attr('y', -30)
        .attr('width', 100)
        .attr('height', 20)
        .attr('fill', '#fff')
        .attr('stroke', '#2196f3')
        .attr('stroke-width', 1.5)
        .attr('rx', 4)
        .attr('ry', 4)

      // 调整尺寸文字位置
      stockGroup.append('text')
        .attr('x', stock.width * scale / 2)
        .attr('y', -18)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', '500')
        .attr('fill', '#2196f3')
        .text(`${stock.width}mm`)

      // 调整装饰线条位置
      stockGroup.append('line')
        .attr('x1', stock.width * scale / 2 - 60)
        .attr('y1', -20)
        .attr('x2', stock.width * scale / 2 - 40)
        .attr('y2', -20)
        .attr('stroke', '#2196f3')
        .attr('stroke-width', 1.5)

      stockGroup.append('line')
        .attr('x1', stock.width * scale / 2 + 40)
        .attr('y1', -20)
        .attr('x2', stock.width * scale / 2 + 60)
        .attr('y2', -20)
        .attr('stroke', '#2196f3')
        .attr('stroke-width', 1.5)

    // 绘制切割件
    stock.cuts.forEach((cut, cutIndex) => {
      const piece = stockGroup.append('g')
        .attr('transform', `translate(${cut.x * scale},${cut.y * scale})`)

      // 获取标准化的尺寸颜色索引
      const normalizedSize = [cut.width, cut.height].sort((a, b) => a - b).join('×')
      const colorIdx = dimensionColorMap.get(normalizedSize)

      // 切割件矩形
      piece.append('rect')
        .attr('width', cut.width * scale)
        .attr('height', cut.height * scale)
        .attr('fill', colorScale(colorIdx))
        .attr('stroke', 'white')

      // 尺寸标签
      piece.append('text')
        .attr('x', cut.width * scale / 2)
        .attr('y', cut.height * scale / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .text(`${cut.width}×${cut.height}${cut.rotated ? ' (R)' : ''}`)
    })

      // 标记余料区域
      const remainingSpaces = findAvailableSpaces(stock)
      remainingSpaces.forEach(space => {
        if (space.width >= 10 && space.height >= 10) {
          stockGroup.append('rect')
            .attr('x', space.x * scale)
            .attr('y', space.y * scale)
            .attr('width', space.width * scale)
            .attr('height', space.height * scale)
            .attr('fill', 'none')
            .attr('stroke', '#ff6b6b')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5')

    stockGroup.append('text')
            .attr('x', (space.x + space.width/2) * scale)
            .attr('y', (space.y + space.height/2) * scale)
      .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', '#ff6b6b')
            .attr('font-size', '11px')
            .text(`${space.width}×${space.height}`)
        }
      })
    })
    
    yOffset += stocks.length * (stockHeight + margin.top) + groupSpacing
  })

  // 添加箭头标记定义
  svg.append('defs').append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 5)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#666')
  
  console.log('可视化更新完成')
}

// 导入导出功能
const importFromExcel = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = e => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = e => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      
      // 读取原料清单
      const stockSheet = workbook.Sheets['原料清单']
      if (stockSheet) {
        const stockData = XLSX.utils.sheet_to_json(stockSheet)
        stockList.value = stockData.map(row => ({
          width: row.width || 2000,
          height: row.height || 2400,
          price: row.price || 1000
        }))
      }

      // 读取切割清单
      const cutSheet = workbook.Sheets['切割清单']
      if (cutSheet) {
        const cutData = XLSX.utils.sheet_to_json(cutSheet)
        cutList.value = cutData.map(row => ({
          width: row.width || 0,
          height: row.height || 0,
          quantity: row.quantity || 1,
          canRotate: row.canRotate !== false
        }))
      }
    }
    reader.readAsArrayBuffer(file)
  }
  input.click()
}

const exportToExcel = () => {
  // 创建工作簿
  const workbook = XLSX.utils.book_new()

  // 添加切割方案
  const planSheet = XLSX.utils.json_to_sheet(cuttingPlan.value)
  XLSX.utils.book_append_sheet(workbook, planSheet, '切割方案')

  // 添加统计数据
  const statsData = [{
    总原料数: totalSheets.value,
    材料利用率: `${utilization.value}%`,
    总废料面积: wasteArea.value,
    总成本: totalCost.value
  }]
  const statsSheet = XLSX.utils.json_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, '统计数据')

  // 导出文件
  XLSX.writeFile(workbook, '玻璃切割优化方案.xlsx')
}

// 添加计算属性
const groupedCuttingPlans = computed(() => {
  const groups = {}
  cuttingPlan.value.forEach(cut => {
    if (!groups[cut.originalSpec]) {
      groups[cut.originalSpec] = {
        spec: cut.originalSpec,
        cuts: []
      }
    }
    groups[cut.originalSpec].cuts.push(cut)
  })
  return Object.values(groups)
})

// 组件挂载时初始化
onMounted(() => {
  console.log('组件挂载完成')
  try {
    // 确保容器已经渲染
    nextTick(() => {
      console.log('visualizationContainer:', visualizationContainer.value)
      if (cutList.value.length > 0 && stockList.value.length > 0) {
        console.log('开始初始计算...')
  calculateOptimization()
      } else {
        console.log('无初始数据，跳过计算')
      }
    })
  } catch (error) {
    console.error('初始化出错:', error)
  }
})
</script>

<style scoped>
.cutting-visualization {
  width: 100%;
  overflow-x: auto;
  min-height: 300px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.cutting-visualization svg {
  display: block;
  max-width: 100%;
  height: auto;
}

.stock-sheet {
  fill: #f8f9fa;
  stroke: #dee2e6;
  stroke-width: 1px;
}

.cut-piece {
  stroke: white;
  stroke-width: 1px;
}

.cut-piece text {
  font-size: 12px;
  font-family: Arial, sans-serif;
  pointer-events: none;
}

.stock-label {
  font-size: 14px;
  font-weight: bold;
  fill: #495057;
}

.stats-item {
  padding: 1.5rem;
  background: var(--light-bg);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stats-icon {
  font-size: 2rem;
  color: var(--secondary-color);
}

.stats-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stats-label {
  color: #666;
  font-size: 0.9rem;
}

.table th {
  white-space: nowrap;
}

/* 新增样式 */
.stock-item,
.cut-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  display: flex;
}

.stock-item .flex-grow-1,
.cut-item .flex-grow-1 {
  flex: 1;
  display: flex;
}

.stock-item .form-control,
.cut-item .form-control {
  border: none;
  border-radius: 0;
  padding: 0.75rem;
  flex: 1;
}

.stock-item .form-control + .form-control,
.cut-item .form-control + .form-control {
  border-left: 1px solid #dee2e6;
}

.delete-btn {
  width: 48px;
  margin: 0;
  padding: 0;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #bb2d3b;
}

.delete-btn:disabled {
  opacity: 0.65;
  background: #dc3545;
}

.form-check-input:checked {
  background-color: #2ecc71;
  border-color: #2ecc71;
  visibility: hidden;
}

.input-group .form-control.w-100 {
  border-radius: 0;
  width: 100%;
}

/* 高级设置样式 */
.advanced-settings {
  width: 100%;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.settings-header:hover {
  background-color: #e9ecef;
}

.settings-header h4 {
  color: #2c3e50;
  font-size: 1.1rem;
}

.settings-header i {
  color: #6c757d;
  transition: transform 0.3s ease;
}

.settings-content {
  padding: 1rem;
  border-top: 1px solid #dee2e6;
}

.parameter-group {
  background-color: #fff;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.parameter-group:last-child {
  margin-bottom: 0;
}

/* 参数配置样式更新 */
.parameter-group .form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.75rem;
}

.parameter-options .form-check {
  margin-bottom: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  background-color: #fff;
  position: relative;
  overflow: hidden;
}

.parameter-options .form-check:hover {
  border-color: #2ecc71;
  background-color: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.parameter-options .form-check-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 0;
  position: relative;
  width: 100%;
}

.parameter-options .form-check-label i {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 0.75rem;
  background-color: #f8f9fa;
  color: #6c757d;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.parameter-options .option-content {
  flex: 1;
}

.parameter-options .option-title {
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.parameter-options small {
  color: #6c757d;
  display: block;
  font-size: 0.875rem;
}

/* 选中状态样式优化 */
.parameter-options .form-check-input:checked + .form-check-label {
  color: #2ecc71;
}

.parameter-options .form-check-input:checked + .form-check-label i {
  background-color: #2ecc71;
  color: #fff;
}

.parameter-options .form-check-input:checked + .form-check-label .option-title {
  color: #2ecc71;
  font-weight: 600;
}

.parameter-options .form-check-input:checked ~ .form-check {
  border-color: #2ecc71;
}

/* 选中状态添加左边框效果 */
.parameter-options .form-check-input:checked + .form-check-label::before {
  content: '';
  position: absolute;
  left: -1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 70%;
  background-color: #2ecc71;
  border-radius: 0 4px 4px 0;
}

/* 添加选中状态的微妙背景效果 */
.parameter-options .form-check-input:checked + .form-check-label {
  background: linear-gradient(to right, rgba(46, 204, 113, 0.05), transparent);
}

/* 动画效果优化 */
.parameter-options .form-check {
  transform-origin: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.parameter-options .form-check:hover {
  transform: translateY(-2px);
}

.parameter-options .form-check-input:checked + .form-check-label i {
  transform: scale(1.1);
}

/* 图标大小统一 */
.parameter-options .utilization-icon,
.parameter-options .mincuts-icon,
.parameter-options .price-icon {
  font-size: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .settings-header {
    padding: 0.75rem;
  }
  
  .settings-content {
    padding: 0.75rem;
  }
  
  .parameter-group {
    padding: 0.75rem;
  }
}

/* 添加新的样式 */
.table-secondary {
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
}

.table td {
  vertical-align: middle;
  padding: 0.75rem;
}

.text-danger {
  font-size: 0.9rem;
}

.small {
  font-size: 0.85rem;
  color: #666;
}

/* 余料信息样式 */
.waste-info {
  font-size: 0.9rem;
  padding: 4px 0;
}

.waste-area {
  display: flex;
  align-items: center;
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 6px;
}

.waste-spaces {
  border-left: 2px solid #eee;
  padding-left: 8px;
  margin-left: 2px;
}

.waste-spaces-header {
  display: flex;
  align-items: center;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.waste-spaces-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 4px;
}

.waste-space-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
  background-color: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.space-size {
  color: #dc3545;
  font-weight: 500;
  margin-right: 4px;
}

.space-position {
  color: #6c757d;
  font-size: 0.8rem;
}

.no-waste {
  display: flex;
  align-items: center;
  color: #198754;
  font-size: 0.9rem;
}
</style> 
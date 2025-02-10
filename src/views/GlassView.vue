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
                        <button
                          type="button"
                          class="btn btn-outline-secondary swap-btn"
                          @click="swapDimensions(stock)"
                          title="交换宽高"
                        >
                          <i class="fas fa-exchange-alt"></i>
                        </button>
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
                        <button
                          type="button"
                          class="btn btn-outline-secondary swap-btn"
                          @click="swapDimensions(item)"
                          title="交换宽高"
                        >
                          <i class="fas fa-exchange-alt"></i>
                        </button>
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

    class CuttingOptimizer {
      constructor(stockList, cutList, options = {}) {
        this.stockList = stockList;
        this.cutList = cutList;
        this.options = {
          cuttingLoss: options.cuttingLoss || 0,
          strategy: options.strategy || 'utilization',
          layoutMode: options.layoutMode || 'any',
          firstCutDirection: options.firstCutDirection || 'none'
        };
        this.result = [];
        this.currentStockIndex = 0;
      }

      // 计算两个区域的重叠情况
      static getOverlap(area1, area2) {
        const xOverlap = Math.max(0, Math.min(area1.x + area1.width, area2.x + area2.width) - Math.max(area1.x, area2.x));
        const yOverlap = Math.max(0, Math.min(area1.y + area1.height, area2.y + area2.height) - Math.max(area1.y, area2.y));
        return xOverlap * yOverlap;
      }

      // 检查是否可以放置切割块
      canPlacePiece(piece, space, rotated = false) {
        const pieceWidth = rotated ? piece.height : piece.width;
        const pieceHeight = rotated ? piece.width : piece.height;
        const loss = this.options.cuttingLoss;

        // 考虑切割损耗
        return (pieceWidth + loss <= space.width) && (pieceHeight + loss <= space.height);
      }

      // 寻找最佳放置位置
      findBestPlacement(piece, spaces) {
        let bestScore = -Infinity;
        let bestPlacement = null;

        for (const space of spaces) {
          // 检查普通放置
          if (this.canPlacePiece(piece, space, false)) {
            const score = this.evaluatePlacement(piece, space, false);
            if (score > bestScore) {
              bestScore = score;
              bestPlacement = { space, rotated: false, score };
            }
          }

          // 检查旋转放置
          if (piece.canRotate && this.canPlacePiece(piece, space, true)) {
            const score = this.evaluatePlacement(piece, space, true);
            if (score > bestScore) {
              bestScore = score;
              bestPlacement = { space, rotated: true, score };
            }
          }
        }

        return bestPlacement;
      }

      // 评估放置得分
      evaluatePlacement(piece, space, rotated) {
        const pieceWidth = rotated ? piece.height : piece.width;
        const pieceHeight = rotated ? piece.width : piece.height;
        let score = 0;

        switch (this.options.strategy) {
          case 'utilization':
            // 优先选择最小浪费的位置
            score = -(space.width * space.height - pieceWidth * pieceHeight);
            break;
          case 'minCuts':
            // 优先选择靠近已切割区域的位置
            score = -Math.sqrt(space.x * space.x + space.y * space.y);
            break;
          case 'price':
            // 考虑材料成本
            score = -(space.width * space.height - pieceWidth * pieceHeight) * space.price;
            break;
        }

        // 根据布局策略调整得分
        if (this.options.layoutMode !== 'any') {
          const alignment = this.options.layoutMode === 'horizontal' ? 
            Math.abs(space.y) : Math.abs(space.x);
          score -= alignment * 0.1;
        }

        return score;
      }

      // 更新剩余空间
      updateSpaces(spaces, placement, piece) {
        const { space, rotated } = placement;
        const pieceWidth = rotated ? piece.height : piece.width;
        const pieceHeight = rotated ? piece.width : piece.height;
        const loss = this.options.cuttingLoss;

        // 移除被使用的空间
        const unusedSpaces = spaces.filter(s => s !== space);

        // 创建新的剩余空间
        const newSpaces = [];

        // 右侧空间
        if (space.width > pieceWidth + loss) {
          newSpaces.push({
            x: space.x + pieceWidth + loss,
            y: space.y,
            width: space.width - (pieceWidth + loss),
            height: space.height,
            price: space.price
          });
        }

        // 上方空间
        if (space.height > pieceHeight + loss) {
          newSpaces.push({
            x: space.x,
            y: space.y + pieceHeight + loss,
            width: pieceWidth,
            height: space.height - (pieceHeight + loss),
            price: space.price
          });
        }

        // 合并相邻空间
        return this.mergeSpaces([...unusedSpaces, ...newSpaces]);
      }

      // 合并相邻空间
      mergeSpaces(spaces) {
        const merged = [];
        const used = new Set();

        for (let i = 0; i < spaces.length; i++) {
          if (used.has(i)) continue;
          let current = spaces[i];

          for (let j = i + 1; j < spaces.length; j++) {
            if (used.has(j)) continue;
            const other = spaces[j];

            // 尝试合并水平相邻空间
            if (current.y === other.y && current.height === other.height) {
              if (current.x + current.width === other.x) {
                current = {
                  x: current.x,
                  y: current.y,
                  width: current.width + other.width,
                  height: current.height,
                  price: current.price
                };
                used.add(j);
                continue;
              }
            }

            // 尝试合并垂直相邻空间
            if (current.x === other.x && current.width === other.width) {
              if (current.y + current.height === other.y) {
                current = {
                  x: current.x,
                  y: current.y,
                  width: current.width,
                  height: current.height + other.height,
                  price: current.price
                };
                used.add(j);
                continue;
              }
            }
          }

          merged.push(current);
        }

        return merged;
      }

      // 执行优化
      optimize() {
        // 预处理切割清单
        const pieces = [];
        this.cutList.forEach(cut => {
          for (let i = 0; i < cut.quantity; i++) {
            pieces.push({
              width: cut.width,
              height: cut.height,
              canRotate: cut.canRotate,
              area: cut.width * cut.height
            });
          }
        });

        // 按面积降序排序
        pieces.sort((a, b) => b.area - a.area);

        // 对每个切割件进行处理
        for (const piece of pieces) {
          let placed = false;

          // 首先尝试在现有板材的剩余空间中放置
          for (const stock of this.result) {
            const placement = this.findBestPlacement(piece, stock.spaces);
            if (placement) {
              this.placePiece(stock, piece, placement);
              placed = true;
              break;
            }
          }

          // 如果无法放置，添加新的板材
          if (!placed) {
            const newStock = this.addNewStock();
            const placement = this.findBestPlacement(piece, newStock.spaces);
            if (placement) {
              this.placePiece(newStock, piece, placement);
            } else {
              throw new Error('无法放置所有切割件，请检查原料规格是否足够。');
            }
          }
        }

        return this.result;
      }

      // 添加新的板材
      addNewStock() {
        const stockSpec = this.stockList[this.currentStockIndex % this.stockList.length];
        const newStock = {
          width: stockSpec.width,
          height: stockSpec.height,
          price: stockSpec.price,
          cuts: [],
          spaces: [{
            x: 0,
            y: 0,
            width: stockSpec.width,
            height: stockSpec.height,
            price: stockSpec.price
          }]
        };
        this.result.push(newStock);
        this.currentStockIndex++;
        return newStock;
      }

      // 放置切割件
      placePiece(stock, piece, placement) {
        const { space, rotated } = placement;
        const pieceWidth = rotated ? piece.height : piece.width;
        const pieceHeight = rotated ? piece.width : piece.height;

        // 添加切割信息
        stock.cuts.push({
          x: space.x,
          y: space.y,
          width: pieceWidth,
          height: pieceHeight,
          rotated
        });

        // 更新剩余空间
        stock.spaces = this.updateSpaces(stock.spaces, placement, piece);
      }
    }

    // 创建优化器实例
    const optimizer = new CuttingOptimizer(
      stockList.value,
      cutList.value,
      {
        cuttingLoss: cuttingLoss.value,
        strategy: optimizationStrategy.value,
        layoutMode: layoutStrategy.value,
        firstCutDirection: firstCutDirection.value
      }
    );

    // 执行优化
    const optimizationResult = optimizer.optimize();

    // 更新结果
    cuttingPlan.value = optimizationResult.flatMap((stock, stockIndex) => 
      stock.cuts.map((cut, cutIndex) => ({
        sheetIndex: stockIndex,
        sequence: cutIndex + 1,
        width: cut.width,
        height: cut.height,
        x: cut.x,
        y: cut.y,
        rotated: cut.rotated,
        originalSpec: `${stock.width}×${stock.height}`,
        remainingSpaces: cutIndex === stock.cuts.length - 1 ? 
          stock.spaces.map(space => ({
            width: space.width,
            height: space.height,
            x: space.x,
            y: space.y
          })) : [],
        wasteArea: cutIndex === stock.cuts.length - 1 ? 
          stock.spaces.reduce((sum, space) => sum + space.width * space.height, 0) : 0
      }))
    );

    // 更新统计数据
    updateStats(optimizationResult);
    generateCuttingPlan(optimizationResult);
    updateVisualization(optimizationResult);

  } catch (error) {
    console.error('计算优化方案出错:', error);
  }
}

// 检查piece是否能放入space并返回最优放置方案
const findBestPlacement = (piece, space, stock, isOffcut = false, offcutIndex = -1) => {
  console.log('\n分析最佳放置方案:')
  let bestPlacement = null
  let maxRemainingArea = -Infinity
  
  // 检查普通方向
  if (canFitPiece(piece, space)) {
    console.log('检查普通方向放置')
    // 计算两个主要余料区域
    const topSpace = {
      x: space.x,
      y: space.y + piece.height,
      width: space.width,
      height: space.height - piece.height
    }
    
    const rightSpace = {
      x: space.x + piece.width,
      y: space.y,
      width: space.width - piece.width,
      height: piece.height
    }
    
    // 计算最大余料面积
    const normalMaxArea = Math.max(
      topSpace.width * topSpace.height,
      rightSpace.width * rightSpace.height
    )
    console.log('普通方向余料区域:')
    console.log('- 上方:', topSpace.width, 'x', topSpace.height, '=', topSpace.width * topSpace.height)
    console.log('- 右侧:', rightSpace.width, 'x', rightSpace.height, '=', rightSpace.width * rightSpace.height)
    console.log('普通方向最大余料面积:', normalMaxArea)
    
    if (normalMaxArea > maxRemainingArea) {
      maxRemainingArea = normalMaxArea
      bestPlacement = {
        stock,
        space,
        rotated: false,
        isOffcut,
        offcutIndex,
        score: normalMaxArea,
        remainingSpaces: [topSpace, rightSpace].filter(s => s.width > 0 && s.height > 0)
      }
      console.log('更新最佳方案为普通方向')
    }
  }
  
  // 检查旋转方向
  if (piece.canRotate && canFitPieceRotated(piece, space)) {
    console.log('检查旋转方向放置')
    // 计算旋转后的两个主要余料区域
    const topSpace = {
      x: space.x,
      y: space.y + piece.width,  // 注意这里使用piece.width因为已旋转
      width: space.width,
      height: space.height - piece.width
    }
    
    const rightSpace = {
      x: space.x + piece.height,  // 注意这里使用piece.height因为已旋转
      y: space.y,
      width: space.width - piece.height,
      height: piece.width
    }
    
    // 计算最大余料面积
    const rotatedMaxArea = Math.max(
      topSpace.width * topSpace.height,
      rightSpace.width * rightSpace.height
    )
    console.log('旋转方向余料区域:')
    console.log('- 上方:', topSpace.width, 'x', topSpace.height, '=', topSpace.width * topSpace.height)
    console.log('- 右侧:', rightSpace.width, 'x', rightSpace.height, '=', rightSpace.width * rightSpace.height)
    console.log('旋转方向最大余料面积:', rotatedMaxArea)
    
    if (rotatedMaxArea > maxRemainingArea) {
      maxRemainingArea = rotatedMaxArea
      bestPlacement = {
        stock,
        space,
        rotated: true,
        isOffcut,
        offcutIndex,
        score: rotatedMaxArea,
        remainingSpaces: [topSpace, rightSpace].filter(s => s.width > 0 && s.height > 0)
      }
      console.log('更新最佳方案为旋转方向')
    }
  }
  
  if (bestPlacement) {
    console.log('最终选择:', bestPlacement.rotated ? '旋转放置' : '普通放置')
    console.log('最大余料面积:', maxRemainingArea)
  } else {
    console.log('没有找到合适的放置方案')
    bestPlacement = { score: -Infinity }
  }
  
  return bestPlacement
}

// 计算放置切割件后的剩余空间
const findRemainingSpaces = (space, cut) => {
  const spaces = []
  
  // 上方空间（优先考虑）
  if (cut.y + cut.height < space.y + space.height) {
    spaces.push({
      x: space.x,
      y: cut.y + cut.height,
      width: space.width,
      height: space.y + space.height - (cut.y + cut.height)
    })
  }
  
  // 右侧空间（次要考虑）
  if (cut.x + cut.width < space.x + space.width) {
    spaces.push({
      x: cut.x + cut.width,
      y: space.y,
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

// 在 script setup 部分添加交换函数
const swapDimensions = (item) => {
  const temp = item.width
  item.width = item.height
  item.height = temp
}
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

/* 新增样式 */
.swap-btn {
  width: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  transition: all 0.2s ease;
}

.swap-btn:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.swap-btn i {
  font-size: 0.9rem;
}

.stock-item .form-control,
.cut-item .form-control {
  border: none;
  border-radius: 0;
  padding: 0.75rem;
  flex: 1;
  border-right: 1px solid #dee2e6;
}

.stock-item .form-control:last-child,
.cut-item .form-control:last-child {
  border-right: none;
}
</style> 
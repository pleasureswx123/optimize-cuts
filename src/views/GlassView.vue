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
        <div class="col-lg-4 input-section">
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
                        <input type="number" class="form-control" v-model="stock.width" placeholder="宽度(mm)" required
                          min="0" step="1">
                        <button type="button" class="btn btn-outline-secondary swap-btn" @click="swapDimensions(stock)"
                          title="交换宽高">
                          <i class="fas fa-exchange-alt"></i>
                        </button>
                        <input type="number" class="form-control" v-model="stock.height" placeholder="高度(mm)" required
                          min="0" step="1">
                        <input type="number" class="form-control" v-model="stock.price" placeholder="单价" required
                          min="0" step="0.01">
                      </div>
                      <button type="button" class="btn btn-danger ms-2 d-flex align-items-center delete-btn"
                        @click="removeStockItem(index)" :disabled="stockList.length === 1">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-success w-100 mb-3" @click="addStockItem">
                    <i class="fas fa-plus me-2"></i>添加原料规格
                  </button>
                </div>

                <!-- 切割清单 -->
                <div class="mb-3">
                  <label class="form-label">切割清单</label>
                  <div v-for="(item, index) in cutList" :key="index" class="mb-2">
                    <div class="d-flex cut-item">
                      <div class="flex-grow-1 d-flex">
                        <input type="number" class="form-control" v-model="item.width" placeholder="宽度(mm)" required
                          min="0" step="1">
                        <button type="button" class="btn btn-outline-secondary swap-btn" @click="swapDimensions(item)"
                          title="交换宽高">
                          <i class="fas fa-exchange-alt"></i>
                        </button>
                        <input type="number" class="form-control" v-model="item.height" placeholder="高度(mm)" required
                          min="0" step="1">
                        <input type="number" class="form-control" v-model="item.quantity" placeholder="数量" required
                          min="1" step="1">
                      </div>
                      <button type="button" class="btn btn-danger ms-2 d-flex align-items-center delete-btn"
                        @click="removeCutItem(index)">
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <button type="button" class="btn btn-success w-100" @click="addCutItem">
                    <i class="fas fa-plus me-2"></i>添加切割项
                  </button>
                </div>

                <button type="submit" class="btn btn-primary w-100 mb-3">
                  <i class="fas fa-calculator me-2"></i>计算优化方案
                </button>

                <!-- 切割损耗 -->
                <div class="mb-3">
                  <label class="form-label">切割损耗</label>
                  <div class="input-group">
                    <input type="number" class="form-control" v-model="cuttingLoss" placeholder="切割损耗(mm)" min="0"
                      step="0.1">
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
                            <i class="fas fa-info-circle ms-2 text-muted" data-bs-toggle="tooltip"
                              title="选择不同的优化策略来满足不同的生产需求"></i>
                          </label>
                          <div class="parameter-options">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="optimizationStrategy"
                                value="utilization" id="maxUtilization">
                              <label class="form-check-label" for="maxUtilization">
                                <i class="fas fa-chart-pie utilization-icon"></i>
                                <div class="option-content">
                                  <div class="option-title">利用率最高</div>
                                  <small class="text-muted">适合材料成本高的情况，追求最大化利用率</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="optimizationStrategy"
                                value="minCuts" id="minCutting">
                              <label class="form-check-label" for="minCutting">
                                <i class="fas fa-layer-group mincuts-icon"></i>
                                <div class="option-content">
                                  <div class="option-title">切割图最少</div>
                                  <small class="text-muted">适合批量生产，提高切割效率</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="optimizationStrategy" value="price"
                                id="priceOptimized">
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
                            <i class="fas fa-info-circle ms-2 text-muted" data-bs-toggle="tooltip"
                              title="选择不同的排样方式来适应不同的切割设备和工艺要求"></i>
                          </label>
                          <div class="parameter-options">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="layoutStrategy" value="any"
                                id="layoutAny">
                              <label class="form-check-label" for="layoutAny">
                                <i class="fas fa-random"></i>
                                <div class="option-content">
                                  <div class="option-title">任意排样</div>
                                  <small class="text-muted">不限制排列方向，追求最优解</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="layoutStrategy" value="horizontal"
                                id="layoutHorizontal">
                              <label class="form-check-label" for="layoutHorizontal">
                                <i class="fas fa-arrows-alt-h"></i>
                                <div class="option-content">
                                  <div class="option-title">横向并齐</div>
                                  <small class="text-muted">适合横向切割设备，便于批量加工</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="layoutStrategy" value="vertical"
                                id="layoutVertical">
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
                            <i class="fas fa-info-circle ms-2 text-muted" data-bs-toggle="tooltip"
                              title="选择第一刀切割方向，便于后续单人操作"></i>
                          </label>
                          <div class="parameter-options">
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="firstCutDirection" value="none"
                                id="noFirstCut">
                              <label class="form-check-label" for="noFirstCut">
                                <i class="fas fa-ban"></i>
                                <div class="option-content">
                                  <div class="option-title">不需要第一刀</div>
                                  <small class="text-muted">材料尺寸合适，无需预切割</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="firstCutDirection" value="vertical"
                                id="firstVertical">
                              <label class="form-check-label" for="firstVertical">
                                <i class="fas fa-arrows-alt-v"></i>
                                <div class="option-content">
                                  <div class="option-title">纵向切割</div>
                                  <small class="text-muted">从中间纵向切开，适合需要减小板材长度的情况</small>
                                </div>
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="radio" v-model="firstCutDirection"
                                value="horizontal" id="firstHorizontal">
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

          <!-- 详细切割方案 -->
          <div class="card mb-4">
            <div class="card-body">
              <h3 class="card-title mb-4">详细切割方案</h3>
              <div v-if="cuttingPlan.length">
                <div v-for="(group, groupIndex) in groupedCuttingPlans" :key="groupIndex"
                  class="cutting-plan-group mb-4">
                  <!-- 原料规格标题栏 -->
                  <div class="stock-header">
                    <div class="stock-info">
                      <div class="d-flex align-items-center justify-content-between w-100">
                        <h4 class="stock-title">
                          <i class="fas fa-layer-group"></i>
                          <span>板材</span>
                          <!-- <span>板材 {{ groupIndex + 1 }}</span> -->
                          <span class="stock-dimensions">({{ group.spec }})</span>
                        </h4>
                        <div class="utilization-display" :class="getUtilizationClass(group.utilization)">
                          <i class="fas fa-percentage me-2"></i>
                          <span>利用率: {{ group.utilization }}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 每块板材的切割信息 -->
                  <div v-for="(sheet, sheetKey) in group.sheets" :key="sheetKey">
                    <div class="sheet-header cursor-pointer" style="padding: 0 0.75rem; margin-bottom: 0; gap: 0.5rem;"
                      @click="toggleSheetExpansion(sheet.sheetIndex)">
                      <!-- <i class="fas fa-square me-2"></i> -->
                      #{{ sheet.sheetIndex + 1 }}

                      <div class="sheet-progress-wrapper">
                        <div class="sheet-progress">
                          <div class="progress-bar" :class="getUtilizationClass(sheet.utilization)"
                            :style="{ width: sheet.utilization + '%' }" role="progressbar">
                            <span style="font-size: 12px;">{{ sheet.utilization }}%</span>
                          </div>
                        </div>
                      </div>

                      <i
                        :class="['fas', expandedSheets.has(sheet.sheetIndex) ? 'fa-chevron-up' : 'fa-chevron-down']"></i>


                    </div>

                    <div v-show="expandedSheets.has(sheet.sheetIndex)" class="sheet-content">
                      <div class="cuts-container">
                        <div v-for="(cut, cutKey) in sheet.cuts" :key="cutKey" class="cut-item-card">
                          <div class="cut-header">
                            <div class="cut-header-left">
                              <span class="cut-count">×{{ cut.count }}</span>
                              <span class="cut-dimensions">{{ cut.width }}×{{ cut.height }}mm</span>
                              <span v-if="cut.rotated" class="cut-rotated" title="已旋转">
                                <i class="fas fa-sync-alt"></i>
                              </span>
                            </div>
                          </div>
                          <div class="cut-details">
                            <div class="positions-list">
                              <div v-for="(pos, posIndex) in cut.positions" :key="posIndex" class="position-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>位置 {{ posIndex + 1 }}: ({{ pos.x }},{{ pos.y }})</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 余料信息 -->
                      <div v-if="sheet.remainingSpaces && sheet.remainingSpaces.length > 0" class="waste-spaces mt-3">
                        <div class="waste-area">
                          <i class="fas fa-square-full text-danger me-1"></i>
                          <span>余料: {{ (sheet.wasteArea/1000000).toFixed(2) }}m²</span>
                        </div>
                        <div class="remaining-spaces">
                          <div v-for="(space, spaceIndex) in sheet.remainingSpaces" :key="spaceIndex"
                            class="space-item">
                            <span class="space-dimensions">{{ space.width }}×{{ space.height }}</span>
                            <span class="space-position">({{ space.x }},{{ space.y }})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <i class="fas fa-inbox fa-2x text-muted mb-2"></i>
                <p class="text-muted">暂无切割方案</p>
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
const cutList = ref([{ width: 500, height: 600, quantity: 5, canRotate: true }])  // 添加旋转选项
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
// 修改为响应式的Set
const expandedSheets = ref(new Set())

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
        this.cutLines = new Map(); // 存储切割线信息
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
        
        // 考虑切割损耗的空间检查
        const requiredWidth = pieceWidth + loss;
        const requiredHeight = pieceHeight + loss;
        
        return (requiredWidth <= space.width) && (requiredHeight <= space.height);
      }

      // 记录切割线
      addCutLine(stock, start, end, isHorizontal, loss) {
        const key = `${stock.id}_${isHorizontal ? 'h' : 'v'}_${start.x}_${start.y}_${end.x}_${end.y}`;
        if (!this.cutLines.has(key)) {
          this.cutLines.set(key, {
            stockId: stock.id,  // 添加板材ID
            start: { ...start },
            end: { ...end },
            isHorizontal,
            loss: loss
          });
        }
      }

      // 放置切割件
      placePiece(stock, piece, placement) {
        const { x, y, width, height, rotated, loss, actualWidth, actualHeight } = placement;

        // 添加切割信息
        const cutPiece = {
          x: x,
          y: y,
          width: width,
          height: height,
          rotated: rotated,
          loss: loss,
          // 添加实际占用空间信息
          actualWidth: actualWidth,
          actualHeight: actualHeight
        };
        stock.cuts.push(cutPiece);

        // 记录切割线（考虑切割损耗）
        this.addCutLines(stock, {
          x: x,
          y: y,
          width: width,
          height: height,
          loss: loss,
          actualWidth: actualWidth,
          actualHeight: actualHeight
        });

        // 更新剩余空间（使用实际占用空间）
        this.updateRemainingSpaces(stock, {
          x: x,
          y: y,
          width: actualWidth,  // 使用包含切割损耗的实际宽度
          height: actualHeight, // 使用包含切割损耗的实际高度
          loss: loss
        });
      }

      // 添加切割线
      addCutLines(stock, cut) {
        const { x, y, width, height, loss, actualWidth, actualHeight } = cut;
        
        // 添加垂直切割线（右侧）
        if (x + actualWidth < stock.width) {
          this.addCutLine(stock, 
            { x: x + width, y: y }, 
            { x: x + width, y: y + height },
            false,
            loss
          );
        }
        
        // 添加水平切割线（底部）
        if (y + actualHeight < stock.height) {
          this.addCutLine(stock, 
            { x: x, y: y + height }, 
            { x: x + width, y: y + height },
            true,
            loss
          );
        }
      }

      // 更新剩余空间
      updateRemainingSpaces(stock, cut) {
        const { x, y, width, height, loss } = cut;
        
        // 获取当前所有可用空间
        const currentSpaces = [...stock.spaces];
        stock.spaces = [];
        
        // 处理每个受影响的空间
        for (const space of currentSpaces) {
          if (this.isOverlap(space, cut)) {
            // 创建新的剩余空间
            const newSpaces = this.splitSpace(space, cut);
            stock.spaces.push(...newSpaces);
          } else {
            // 不受影响的空间保持不变
            stock.spaces.push(space);
          }
        }
        
        // 合并相邻空间
        stock.spaces = this.mergeSpaces(stock.spaces);
      }

      // 分割空间
      splitSpace(space, cut) {
        const newSpaces = [];
        const { x, y, width, height, loss } = cut;
        
        // 右侧空间
        if (space.x + space.width > x + width) {
          newSpaces.push({
            x: x + width,
            y: space.y,
            width: space.x + space.width - (x + width),
            height: space.height,
            price: space.price
          });
        }
        
        // 上方空间
        if (space.y + space.height > y + height) {
          newSpaces.push({
            x: space.x,
            y: y + height,
            width: width,
            height: space.y + space.height - (y + height),
            price: space.price
          });
        }
        
        return newSpaces.filter(s => 
          s.width >= 10 && s.height >= 10 && s.width * s.height >= 100
        );
      }

      // 检查重叠
      isOverlap(space, cut) {
        return !(
          space.x >= cut.x + cut.width ||
          space.x + space.width <= cut.x ||
          space.y >= cut.y + cut.height ||
          space.y + space.height <= cut.y
        );
      }

      // 添加新的板材
      addNewStock() {
        const stockSpec = this.stockList[this.currentStockIndex % this.stockList.length];
        const newStock = {
          id: this.currentStockIndex,  // 添加唯一标识
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

      // 获取切割线信息
      getCutLines(stock) {
        return Array.from(this.cutLines.values())
          .filter(line => {
            // 只返回属于当前板材的切割线
            return line.stockId === stock.id &&
                   line.start.x >= 0 && line.start.x <= stock.width &&
                   line.start.y >= 0 && line.start.y <= stock.height;
          });
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

        // 按面积降序排序，并对相同尺寸的件进行分组
        pieces.sort((a, b) => b.area - a.area);
        const groupedPieces = this.groupSimilarPieces(pieces);

        // 对每组切割件进行处理
        for (const group of groupedPieces) {
          let currentStock = null;
          let currentStockSpaces = null;

          // 尝试将同组件放在同一块原料上
          for (const piece of group) {
            let placed = false;

            // 优先使用当前原料
            if (currentStock) {
              const placement = this.findBestPlacement(piece, currentStockSpaces);
              if (placement) {
                this.placePiece(currentStock, piece, placement);
                currentStockSpaces = currentStock.spaces;
                placed = true;
              }
            }

            // 如果当前原料放不下，尝试其他已有原料
            if (!placed) {
              for (const stock of this.result) {
                if (stock !== currentStock) {
                  const placement = this.findBestPlacement(piece, stock.spaces);
                  if (placement) {
                    this.placePiece(stock, piece, placement);
                    placed = true;
                    // 更新当前使用的原料
                    currentStock = stock;
                    currentStockSpaces = stock.spaces;
                    break;
                  }
                }
              }
            }

            // 如果所有已有原料都放不下，添加新的原料
            if (!placed) {
              const newStock = this.addNewStock();
              const placement = this.findBestPlacement(piece, newStock.spaces);
              if (placement) {
                this.placePiece(newStock, piece, placement);
                currentStock = newStock;
                currentStockSpaces = newStock.spaces;
              } else {
                throw new Error('无法放置所有切割件，请检查原料规格是否足够。');
              }
            }
          }
        }

        return this.result;
      }

      // 对相似尺寸的切割件进行分组
      groupSimilarPieces(pieces) {
        const groups = new Map();
        
        for (const piece of pieces) {
          const key = piece.canRotate ? 
            [Math.min(piece.width, piece.height), Math.max(piece.width, piece.height)].join('x') :
            [piece.width, piece.height].join('x');
            
          if (!groups.has(key)) {
            groups.set(key, []);
          }
          groups.get(key).push(piece);
        }
        
        // 将分组结果转换为数组，并按面积降序排序
        return Array.from(groups.values())
          .sort((a, b) => (b[0].area * b.length) - (a[0].area * a.length));
      }

      // 寻找最佳放置位置
      findBestPlacement(piece, spaces) {
        let bestScore = -Infinity;
        let bestPlacement = null;

        // 遍历所有可用空间
        for (const space of spaces) {
          // 检查普通放置
          const normalPlacement = this.tryPlacement(piece, space, false);
          if (normalPlacement && normalPlacement.score > bestScore) {
            bestScore = normalPlacement.score;
            bestPlacement = normalPlacement;
          }

          // 检查旋转放置
          if (piece.canRotate) {
            const rotatedPlacement = this.tryPlacement(piece, space, true);
            if (rotatedPlacement && rotatedPlacement.score > bestScore) {
              bestScore = rotatedPlacement.score;
              bestPlacement = rotatedPlacement;
            }
          }
        }

        return bestPlacement;
      }

      // 尝试在指定空间放置切割件
      tryPlacement(piece, space, rotated) {
        const pieceWidth = rotated ? piece.height : piece.width;
        const pieceHeight = rotated ? piece.width : piece.height;
        const loss = this.options.cuttingLoss;

        // 检查是否能放入空间（考虑切割损耗）
        if (pieceWidth + loss > space.width || pieceHeight + loss > space.height) {
          return null;
        }

        // 计算最优放置位置（左下角优先）
        const placement = {
          x: space.x,
          y: space.y,
          width: pieceWidth,
          height: pieceHeight,
          space: space,
          rotated: rotated,
          loss: loss,  // 添加切割损耗信息
          // 记录实际占用的空间（包含切割损耗）
          actualWidth: pieceWidth + loss,
          actualHeight: pieceHeight + loss
        };

        // 计算放置得分
        const score = this.evaluatePlacement(piece, placement);

        return {
          ...placement,
          score: score
        };
      }

      // 评估放置得分
      evaluatePlacement(piece, placement) {
        const { x, y, width, height, space } = placement;
        const loss = this.options.cuttingLoss;
        
        // 基础利用率得分（越高越好）
        const utilizationScore = (width * height) / (space.width * space.height);
        
        // 边缘对齐得分（优先靠近左下角）
        const edgeScore = 1 / (1 + x + y);
        
        // 切割线复用得分
        const reuseScore = this.calculateReuseScore(x, y, width, height);
        
        // 根据不同策略计算最终得分
        let finalScore = 0;
        switch (this.options.strategy) {
          case 'utilization':
            finalScore = utilizationScore * 0.6 + edgeScore * 0.3 + reuseScore * 0.1;
            break;
          case 'minCuts':
            finalScore = utilizationScore * 0.3 + edgeScore * 0.3 + reuseScore * 0.4;
            break;
          case 'price':
            finalScore = (utilizationScore * 0.5 + edgeScore * 0.3 + reuseScore * 0.2) / space.price;
            break;
          default:
            finalScore = utilizationScore * 0.5 + edgeScore * 0.3 + reuseScore * 0.2;
        }
        
        return finalScore;
      }

      // 计算切割线复用得分
      calculateReuseScore(x, y, width, height) {
        let score = 0;
        
        // 检查是否与已有切割线对齐
        for (const line of this.cutLines.values()) {
          if (line.isHorizontal) {
            // 水平切割线对齐
            if (Math.abs(line.start.y - y) < this.options.cuttingLoss || 
                Math.abs(line.start.y - (y + height)) < this.options.cuttingLoss) {
              score += 1;
            }
          } else {
            // 垂直切割线对齐
            if (Math.abs(line.start.x - x) < this.options.cuttingLoss || 
                Math.abs(line.start.x - (x + width)) < this.options.cuttingLoss) {
              score += 1;
            }
          }
        }
        
        // 边缘对齐额外加分
        if (x === 0 || x + width === this.stockList[0].width) score += 0.5;
        if (y === 0 || y + height === this.stockList[0].height) score += 0.5;
        
        return score;
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
    updateVisualization(optimizationResult, optimizer);  // 传递optimizer实例

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
  
  // 计算总使用面积和总原料面积
  let totalUsedArea = 0
  let totalStockArea = 0
  let totalStockCost = 0
  
  // 创建原料使用统计
  const usageMap = new Map()
  
  result.forEach(stock => {
    // 计算总面积
    totalStockArea += stock.width * stock.height
    totalStockCost += stock.price
    
    // 计算已使用面积
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
    
    // 直接使用stock.spaces作为余料区域
    const totalWasteArea = stock.spaces ? 
      stock.spaces.reduce((sum, space) => sum + space.width * space.height, 0) : 0
    
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
        remainingSpaces: cutIndex === stock.cuts.length - 1 ? 
          (stock.spaces || []).map(space => ({
            width: space.width,
            height: space.height,
            x: space.x,
            y: space.y
          })) : [],
        wasteArea: cutIndex === stock.cuts.length - 1 ? totalWasteArea : 0
      })
    })
  })
  
  // 转换为数组格式
  cuttingPlan.value = Object.entries(groupedPlans).flatMap(([spec, plans]) => plans)
  console.log('切割方案生成完成:', cuttingPlan.value)
}

// 更新可视化
const updateVisualization = (result, optimizer) => {
  console.log('开始更新可视化...')
  if (!visualizationContainer.value) {
    console.error('可视化容器不存在!')
    return
  }

  // 清除现有内容
  d3.select(visualizationContainer.value).selectAll('*').remove()

  // 检测是否为移动端
  const isMobile = window.innerWidth < 992

  // 设置边距和缩放
  const margin = isMobile ? 
    { top: 40, right: 40, bottom: 30, left: 40 } : 
    { top: 60, right: 100, bottom: 40, left: 60 }
    
  const containerWidth = visualizationContainer.value.clientWidth - margin.left - margin.right
  
  // 计算最大原料尺寸
  const maxStockWidth = Math.max(...result.map(s => s.width))
  const maxStockHeight = Math.max(...result.map(s => s.height))
  
  // 计算缩放比例，移动端使用更大的缩放系数
  const scaleFactor = isMobile ? 1.8 : 1.2
  const scale = Math.min(
    (containerWidth / maxStockWidth) * scaleFactor,
    (containerWidth * 0.8 / maxStockHeight) * scaleFactor
  );
  
  // 计算总高度，移动端增加更多间距
  const totalHeight = result.reduce((sum, stock, index) => {
    return sum + (stock.height * scale) + (index > 0 ? margin.top * (isMobile ? 3 : 2) : 0);
  }, margin.top + margin.bottom);

  // 创建SVG，移动端设置更大的最小宽度
  const svg = d3.select(visualizationContainer.value)
    .append('svg')
    .attr('width', Math.max(containerWidth + margin.left + margin.right, isMobile ? 1200 : 900))
    .attr('height', Math.max(totalHeight, isMobile ? 1000 : 800))

  // 调整字体大小
  const fontSize = isMobile ? 16 : 12

  // 创建颜色比例尺
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  // 创建尺寸到颜色的映射
  const dimensionColorMap = new Map()
  let colorIndex = 0
  
  // 收集所有不同的切割尺寸
  const uniqueSizes = new Set()
  result.forEach(stock => {
    stock.cuts.forEach(cut => {
      const size = [cut.width, cut.height].sort((a, b) => a - b).join('×')
      if (!dimensionColorMap.has(size)) {
        dimensionColorMap.set(size, colorIndex++)
      }
      uniqueSizes.add(size)
    })
  })

  // 创建主要绘图区域组
  const mainGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top + 50})`) // 为图例预留空间

  // 创建图例
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${margin.left}, 20)`)

  // 计算每行能放置的图例项数量
  const legendItemWidth = 120 // 每个图例项的宽度
  const legendsPerRow = Math.floor((containerWidth) / legendItemWidth)
  
  Array.from(uniqueSizes).forEach((size, index) => {
    const row = Math.floor(index / legendsPerRow)
    const col = index % legendsPerRow
    
    const legendItem = legend.append('g')
      .attr('transform', `translate(${col * legendItemWidth}, ${row * 25})`)

    legendItem.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', colorScale(dimensionColorMap.get(size)))
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 1)

    legendItem.append('text')
      .attr('x', 25)
      .attr('y', 12)
      .attr('font-size', isMobile ? '14px' : '12px')
      .attr('fill', '#495057')
      .text(size)
  })

  // 绘制每个原料板
  let yOffset = 0
  result.forEach((stock, stockIndex) => {
    const stockGroup = mainGroup.append('g')
      .attr('class', 'stock-group')
      .attr('transform', `translate(0,${yOffset})`)

    // 计算当前板材的利用率
    const totalArea = stock.width * stock.height
    const usedArea = stock.cuts.reduce((sum, cut) => sum + (cut.width * cut.height), 0)
    const stockUtilization = Math.round((usedArea / totalArea) * 100)

    // 绘制原料板背景
    stockGroup.append('rect')
      .attr('class', 'stock-background')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', stock.width * scale)
      .attr('height', stock.height * scale)
      .attr('fill', '#f8f9fa')
      .attr('stroke', '#dee2e6')
      .attr('stroke-width', 1)

    // 添加原料板编号和尺寸标注
    const stockLabel = stockGroup.append('g')
      .attr('class', 'stock-label')
      .attr('transform', `translate(${stock.width * scale / 2}, -25)`)

    // 添加主标题（原料编号和尺寸）
    stockLabel.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#2c3e50')
      .text(`原料 ${stockIndex + 1} (${stock.width}×${stock.height}mm)`)

    // 添加利用率信息
    stockLabel.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', stockUtilization >= 80 ? '#2ecc71' : stockUtilization >= 60 ? '#f1c40f' : '#e74c3c')
      .attr('x', 0)
      .attr('y', 20)
      .text(`利用率: ${stockUtilization}%`)

    // 绘制切割件
    stock.cuts.forEach((cut, cutIndex) => {
      const pieceGroup = stockGroup.append('g')
        .attr('class', 'cut-piece')
        .attr('transform', `translate(${cut.x * scale},${cut.y * scale})`)

      // 获取切割件的颜色
      const normalizedSize = [cut.width, cut.height].sort((a, b) => a - b).join('×')
      const color = colorScale(dimensionColorMap.get(normalizedSize))

      // 绘制切割件矩形
      pieceGroup.append('rect')
        .attr('width', cut.width * scale)
        .attr('height', cut.height * scale)
        .attr('fill', color)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)

      // 添加尺寸标签
      pieceGroup.append('text')
        .attr('x', cut.width * scale / 2)
        .attr('y', cut.height * scale / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', 'white')
        .attr('font-size', `${fontSize}px`)
        .text(`${cut.width}×${cut.height}${cut.rotated ? ' (R)' : ''}`)

      // 如果有切割损耗，显示切割损耗区域
      if (cut.loss > 0) {
        // 右侧切割损耗（只在不是板材边缘时显示）
        if (cut.x + cut.actualWidth < stock.width) {
          pieceGroup.append('rect')
            .attr('class', 'cutting-loss')
            .attr('x', cut.width * scale)
            .attr('y', 0)
            .attr('width', cut.loss * scale)
            .attr('height', cut.height * scale)
            .attr('fill', '#f8d7da')
            .attr('stroke', '#dc3545')
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0.3)
        }

        // 底部切割损耗（只在不是板材边缘时显示）
        if (cut.y + cut.actualHeight < stock.height) {
          pieceGroup.append('rect')
            .attr('class', 'cutting-loss')
            .attr('x', 0)
            .attr('y', cut.height * scale)
            .attr('width', cut.width * scale)
            .attr('height', cut.loss * scale)
            .attr('fill', '#f8d7da')
            .attr('stroke', '#dc3545')
            .attr('stroke-width', 0.5)
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0.3)
        }
      }
    })

    // 绘制切割线
    if (optimizer && optimizer.cutLines) {
      const cutLines = optimizer.getCutLines(stock)
      
      cutLines.forEach(line => {
        // 绘制切割线
        stockGroup.append('line')
          .attr('class', 'cut-line')
          .attr('x1', line.start.x * scale)
          .attr('y1', line.start.y * scale)
          .attr('x2', line.end.x * scale)
          .attr('y2', line.end.y * scale)
          .attr('stroke', '#dc3545')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '5,5')
      })
    }

    // 标记余料区域
    if (stock.spaces) {
      stock.spaces.forEach(space => {
        if (space.width >= 10 && space.height >= 10) {
          const spaceGroup = stockGroup.append('g')
            .attr('class', 'remaining-space')
            .attr('transform', `translate(${space.x * scale},${space.y * scale})`)

          // 绘制余料区域边框
          spaceGroup.append('rect')
            .attr('width', space.width * scale)
            .attr('height', space.height * scale)
            .attr('fill', 'none')
            .attr('stroke', '#ff6b6b')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5')

          // 添加余料尺寸标注
          spaceGroup.append('text')
            .attr('x', space.width * scale / 2)
            .attr('y', space.height * scale / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#ff6b6b')
            .attr('font-size', '11px')
            .text(`${space.width}×${space.height}`)
        }
      })
    }

    // 更新y偏移量
    yOffset += stock.height * scale + margin.top
  })

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
  
  // 首先按原料规格分组
  cuttingPlan.value.forEach(cut => {
    if (!groups[cut.originalSpec]) {
      groups[cut.originalSpec] = {
        spec: cut.originalSpec,
        sheets: {},
        utilization: 0
      }
    }
    
    // 按板材序号分组
    const sheetKey = `sheet_${cut.sheetIndex}`
    if (!groups[cut.originalSpec].sheets[sheetKey]) {
      groups[cut.originalSpec].sheets[sheetKey] = {
        sheetIndex: cut.sheetIndex,
        cuts: {},
        remainingSpaces: cut.remainingSpaces,
        wasteArea: cut.wasteArea,
        utilization: 0,
        isExpanded: expandedSheets.value.has(cut.sheetIndex)  // 使用响应式的expandedSheets
      }
    }
    
    // 按切割件尺寸汇总
    const cutKey = `${cut.width}x${cut.height}${cut.rotated ? '_R' : ''}`
    if (!groups[cut.originalSpec].sheets[sheetKey].cuts[cutKey]) {
      groups[cut.originalSpec].sheets[sheetKey].cuts[cutKey] = {
        width: cut.width,
        height: cut.height,
        rotated: cut.rotated,
        positions: [],  // 存储所有相同尺寸切割件的位置
        count: 0,  // 计数器
        isExpanded: false  // 添加折叠状态属性
      }
    }
    
    // 添加位置信息并增加计数
    groups[cut.originalSpec].sheets[sheetKey].cuts[cutKey].positions.push({
      x: cut.x,
      y: cut.y
    })
    groups[cut.originalSpec].sheets[sheetKey].cuts[cutKey].count++
  })
  
  // 计算每组的利用率
  Object.values(groups).forEach(group => {
    const [width, height] = group.spec.split('×').map(Number)
    const totalArea = width * height
    
    // 计算每块板材的利用率
    Object.values(group.sheets).forEach(sheet => {
      const usedArea = Object.values(sheet.cuts).reduce((sum, cut) => {
        return sum + (cut.width * cut.height * cut.count)
      }, 0)
      sheet.utilization = Math.round((usedArea / totalArea) * 100)
    })
    
    // 计算整体利用率
    const totalUsedArea = Object.values(group.sheets).reduce((sum, sheet) => {
      return sum + Object.values(sheet.cuts).reduce((cutSum, cut) => {
        return cutSum + (cut.width * cut.height * cut.count)
      }, 0)
    }, 0)
    
    group.utilization = Math.round((totalUsedArea / (totalArea * Object.keys(group.sheets).length)) * 100)
  })
  
  return Object.values(groups)
})

// 添加利用率样式计算函数
const getUtilizationClass = (utilization) => {
  if (utilization >= 80) return 'high-utilization'
  if (utilization >= 60) return 'medium-utilization'
  return 'low-utilization'
}

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
  // 交换后自动计算
  calculateOptimization()
}

// 在 script setup 部分添加
const toggleCutDetails = (sheetIndex, cutKey) => {
  const sheet = groupedCuttingPlans.value
    .flatMap(group => Object.values(group.sheets))
    .find(s => s.sheetIndex === sheetIndex);
    
  if (sheet && sheet.cuts[cutKey]) {
    sheet.cuts[cutKey].isExpanded = !sheet.cuts[cutKey].isExpanded;
  }
}

// 修改切换函数
const toggleSheetExpansion = (sheetIndex) => {
  const expanded = expandedSheets.value
  if (expanded.has(sheetIndex)) {
    expanded.delete(sheetIndex)
  } else {
    expanded.add(sheetIndex)
  }
}
</script>

<style scoped>
.cutting-visualization {
  width: 100%;
  overflow-x: auto;
  min-height: 800px; /* 增加最小高度 */
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 2rem; /* 增加内边距 */
  margin-bottom: 2rem; /* 增加底部间距 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.05); /* 添加阴影效果 */
}

.cutting-visualization svg {
  display: block;
  width: 100%; /* 设置宽度为100% */
  height: auto;
  min-width: 800px; /* 设置最小宽度 */
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
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: stretch;
  height: 38px;
}

.stock-item .flex-grow-1,
.cut-item .flex-grow-1 {
  flex: 1;
  display: flex;
  align-items: stretch;
}

.stock-item .form-control,
.cut-item .form-control {
  border: none;
  border-radius: 0;
  padding: 0.5rem;
  flex: 1;
  min-width: 0;
  text-align: center;
}

.swap-btn {
  width: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #f8f9fa;
  color: #6c757d;
  transition: all 0.2s ease;
  border-left: 1px solid #dee2e6;
  border-right: 1px solid #dee2e6;
}

.swap-btn:hover {
  background: #e9ecef;
  color: #2c3e50;
}

.swap-btn i {
  font-size: 0.8rem;
}

.delete-btn {
  width: 38px;
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

/* 新增固定定位样式 */
.input-section {
  /* 默认移动端样式 */
  position: relative;
  top: 0;
  max-height: none;
  overflow-y: visible;
  z-index: 1;
}

/* 桌面端样式 */
@media (min-width: 992px) {
  .input-section {
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    z-index: 100;
  }

  /* 滚动条样式仅在桌面端生效 */
  .input-section::-webkit-scrollbar {
    width: 6px;
  }

  .input-section::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .input-section::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  .input-section::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
}

/* 添加响应式布局 */
@media (max-width: 992px) {
  .cutting-visualization {
    min-height: 800px;
    padding: 0.5rem;
    margin: 0 -1rem; /* 扩展到屏幕边缘 */
    border-radius: 0;
    width: calc(100% + 2rem);
  }
  
  .cutting-visualization svg {
    min-width: 1200px; /* 增加最小宽度 */
    padding: 1rem;
  }

  /* 优化滚动提示 */
  .cutting-visualization::after {
    content: '← 左右滑动查看更多 →';
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    pointer-events: none;
    animation: fadeInOut 2s ease-in-out infinite;
  }

  @keyframes fadeInOut {
    0%, 100% { opacity: 0; }
    50% { opacity: 1; }
  }

  /* 优化滚动条样式 */
  .cutting-visualization::-webkit-scrollbar {
    height: 8px;
  }

  .cutting-visualization::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .cutting-visualization::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .cutting-visualization::-webkit-scrollbar-thumb:hover {
    background: #666;
  }
}

/* 在style部分添加图例样式 */
.legend text {
  fill: #495057;
  font-family: Arial, sans-serif;
}

.legend rect {
  stroke: #dee2e6;
  stroke-width: 1px;
}

@media (max-width: 992px) {
  .legend text {
    font-size: 14px;
  }
}

/* 切割方案组样式 */
.cutting-plan-group {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.stock-header {
  background: #f8f9fa;
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.stock-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stock-title {
  font-size: 1.1rem;
  margin: 0;
  color: #2c3e50;
}

.stock-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #6c757d;
}

.stat-item.high-utilization {
  color: #2ecc71;
}

.stat-item.medium-utilization {
  color: #f1c40f;
}

.stat-item.low-utilization {
  color: #e74c3c;
}

.stock-progress {
  height: 0.5rem;
  background-color: #e9ecef;
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.3s ease;
  text-align: center;
  font-size: 0.75rem;
  line-height: 0.5rem;
  color: white;
}

.progress-bar.high-utilization {
  background-color: #2ecc71;
}

.progress-bar.medium-utilization {
  background-color: #f1c40f;
}

.progress-bar.low-utilization {
  background-color: #e74c3c;
}

.cuts-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
}

.cut-item-card {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.cut-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.5rem;
}

.cut-count {
  background: #2ecc71;
  color: white;
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
  font-weight: bold;
  font-size: 0.85rem;
  margin-right: 0.5rem;
}

.positions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.position-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #6c757d;
  font-size: 0.85rem;
  background: #f8f9fa;
  padding: 0.15rem 0.35rem;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .cuts-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    padding: 0.5rem;
  }

  .cut-item-card {
    padding: 0.35rem;
    font-size: 0.85rem;
  }

  .positions-list {
    grid-template-columns: 1fr;
  }

  .position-item {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .cuts-container {
    grid-template-columns: 1fr;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  background-color: #f8f9fa;
}

.cut-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.cut-header-right {
  color: #6c757d;
}

.cut-header-right i {
  transition: transform 0.3s ease;
}

.cut-details {
  padding: 0.75rem;
  border-top: none;
  background-color: #fff;
  transition: all 0.3s ease;
}

.cut-sequence {
  background: #2c3e50;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: bold;
}

.cut-dimensions {
  font-weight: 500;
  color: #2c3e50;
}

.cut-rotated {
  color: #6c757d;
  font-size: 0.9rem;
}

.cut-details {
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.waste-spaces {
  border-top: 1px dashed #dee2e6;
  padding-top: 0.75rem;
}

.waste-area {
  color: #dc3545;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.remaining-spaces {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.5rem;
}

.space-item {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
}

.space-dimensions {
  color: #2c3e50;
  font-weight: 500;
}

.space-position {
  color: #6c757d;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .stock-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .stock-stats {
    flex-wrap: wrap;
  }
  
  .cuts-container {
    grid-template-columns: 1fr;
  }
}

/* 添加新的样式 */
.sheet-container {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem;
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sheet-title {
  font-size: 1.1rem;
  margin: 0;
  color: #2c3e50;
  display: flex;
  align-items: center;
}

.cut-count {
  background: #2ecc71;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  margin-right: 0.75rem;
}

.positions-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.position-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

/* 添加新的样式 */
.cuts-section {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  margin-top: 1rem;
  background: #fff;
}

.cuts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.cuts-header:hover {
  background: #e9ecef;
}

.cuts-header-left {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #2c3e50;
}

.cuts-header-right i {
  color: #6c757d;
  transition: transform 0.3s ease;
}

.cuts-content {
  transition: all 0.3s ease;
}

.page-subtitle {
  padding: 0.75rem 0;  /* 减小顶部标题区域的padding */
  margin-bottom: 1rem;
}

.page-subtitle h2 {
  font-size: 1.5rem;  /* 减小标题字体 */
  margin-bottom: 0.25rem;
}

.page-subtitle p {
  font-size: 0.9rem;
  margin-bottom: 0;
}

.card {
  margin-bottom: 0.75rem !important;  /* 减小卡片间距 */
}

.card-body {
  padding: 0.75rem;  /* 减小卡片内边距 */
}

.card-title {
  font-size: 1.1rem;
  margin-bottom: 0.75rem !important;
}

.mb-4 {
  margin-bottom: 0.75rem !important;  /* 统一减小间距 */
}

.progress {
  margin: 0.5rem 0 !important;  /* 减小进度条上下间距 */
}

.stock-header {
  padding: 0.5rem 0.75rem;  /* 减小板材标题区域的padding */
}

.stock-title {
  font-size: 1rem;  /* 减小标题字体 */
}

.stock-stats {
  gap: 0.5rem;  /* 减小统计数据之间的间距 */
}

.stat-item {
  font-size: 0.85rem;  /* 减小统计数据字体 */
}

.cuts-container {
  gap: 0.35rem;  /* 减小切割件之间的间距 */
  padding: 0.5rem;
}

.cut-item-card {
  padding: 0.35rem;  /* 减小切割件卡片的内边距 */
}

.cut-header {
  padding: 0.15rem;  /* 减小切割件标题区域的padding */
  margin-bottom: 0.35rem;
}

.positions-list {
  gap: 0.25rem;  /* 减小位置列表的间距 */
  margin-top: 0.35rem;
}

.position-item {
  padding: 0.1rem 0.25rem;  /* 减小位置项的内边距 */
  font-size: 0.8rem;  /* 减小位置信息字体 */
}

/* 优化响应式布局 */
@media (max-width: 768px) {
  .cuts-container {
    gap: 0.25rem;
    padding: 0.35rem;
  }

  .cut-item-card {
    padding: 0.25rem;
  }

  .position-item {
    font-size: 0.75rem;
  }
}

/* 优化板材组件间距 */
.cutting-plan-group {
  margin-bottom: 0.75rem !important;
}

.sheet-container {
  padding: 0.75rem;
  margin: 0.5rem;
}

/* 优化切割信息区域 */
.cuts-section {
  margin-top: 0.5rem;
}

.cuts-header {
  padding: 0.5rem 0.75rem;
}

/* 优化统计卡片 */
.stats-item {
  padding: 1rem;
}

.stats-icon {
  font-size: 1.5rem;
}

.stats-value {
  font-size: 1.25rem;
}

.stats-label {
  font-size: 0.85rem;
}

/* 添加新的切割件信息切换样式 */
.cut-info-toggle {
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.cut-info-toggle:hover {
  background-color: #e9ecef;
}

.cut-info-toggle i {
  color: #6c757d;
}

.cut-info-toggle span {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.cuts-section {
  margin-top: 0.5rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
}

/* 优化切割件容器样式 */
.cuts-container {
  padding: 0.75rem;
  background-color: #fff;
}

/* 添加展开/折叠动画 */
.cuts-section {
  transition: all 0.3s ease-in-out;
}

/* 移除原有的切割件信息头部样式 */
.cuts-header {
  display: none;
}

/* 更新板材标题栏样式 */
.sheet-header {
  padding: 0 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sheet-header:hover {
  background-color: #e9ecef;
}

.sheet-header i.fas.fa-chevron-down,
.sheet-header i.fas.fa-chevron-up {
  color: #6c757d;
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}

.sheet-header .sheet-title {
  font-size: 1rem;
  color: #2c3e50;
  margin: 0;
}

.sheet-stats {
  display: flex;
  gap: 1rem;
}

/* 添加展开/折叠动画 */
.cuts-container {
  transition: all 0.3s ease-in-out;
}

/* 更新样式 */
.sheet-header {
  padding: 0.75rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.sheet-header:hover {
  background-color: #e9ecef;
}

.sheet-content {
  padding: 0 0.75rem;
}

.sheet-progress {
  width: 150px;  /* 增加进度条宽度 */
  height: 12px;  /* 增加进度条高度 */
  margin: 0 8px !important;
  background-color: #f1f1f1;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  display: inline-block;
  vertical-align: middle;
}

.progress-bar {
  height: 100%;
  font-size: 0;
  line-height: 12px;
  text-align: center;
  transition: width 0.6s ease;
  position: relative;
  border-radius: 6px;
  background-image: linear-gradient(45deg, 
    rgba(255,255,255,.15) 25%, 
    transparent 25%, 
    transparent 50%, 
    rgba(255,255,255,.15) 50%, 
    rgba(255,255,255,.15) 75%, 
    transparent 75%, 
    transparent);
  background-size: 1rem 1rem;
  animation: progress-bar-stripes 1s linear infinite;
}

@keyframes progress-bar-stripes {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}

.progress-bar.high-utilization {
  background-color: #2ecc71;
}

.progress-bar.medium-utilization {
  background-color: #f1c40f;
}

.progress-bar.low-utilization {
  background-color: #e74c3c;
}

/* 移除进度条文字 */
.progress-bar::after {
  display: none;
}

/* 新增标题区域样式 */
.stock-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stock-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
}

.stock-title i {
  font-size: 1.25rem;
  color: #3498db;
}

.stock-dimensions {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: normal;
}

/* 新增利用率显示区域样式 */
.stock-utilization {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.sheet-progress-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

/* 优化卡片布局 */
.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.card-body {
  padding: 1.5rem;
}

/* 添加响应式布局 */
@media (max-width: 768px) {
  .stock-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stock-utilization {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
  
  .sheet-progress-wrapper {
    width: 100%;
  }
  
  .sheet-progress {
    width: 100%;
  }
  
  .utilization-display {
    justify-content: center;
  }
}

/* 优化动画效果 */
.progress-bar {
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.stock-header {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加悬停效果 */
.stock-header:hover .progress-bar {
  filter: brightness(1.1);
}

.utilization-display:hover {
  transform: scale(1.02);
}

/* 更新进度条相关样式 */
.stock-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.stock-title-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.stock-utilization {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
}

.utilization-display {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0;
}

.sheet-progress-wrapper {
  width: 100%;
  background: #f8f9fa;
  padding: 0.75rem;
  border-radius: 8px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

.sheet-progress {
  width: 100%;
  height: 16px;
  margin: 0 !important;
  background-color: #f1f1f1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
}

.progress-bar {
  height: 100%;
  font-size: 0;
  line-height: 16px;
  text-align: center;
  transition: width 0.6s ease;
  position: relative;
  border-radius: 8px;
  background-image: linear-gradient(45deg, 
    rgba(255,255,255,.15) 25%, 
    transparent 25%, 
    transparent 50%, 
    rgba(255,255,255,.15) 50%, 
    rgba(255,255,255,.15) 75%, 
    transparent 75%, 
    transparent);
  background-size: 1rem 1rem;
  animation: progress-bar-stripes 1s linear infinite;
}

.utilization-display.high-utilization {
  color: #2ecc71;
}

.utilization-display.medium-utilization {
  color: #f1c40f;
}

.utilization-display.low-utilization {
  color: #e74c3c;
}

/* 响应式布局优化 */
@media (max-width: 768px) {
  .stock-title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .sheet-progress-wrapper {
    padding: 0.5rem;
  }
  
  .sheet-progress {
    height: 12px;
  }
  
  .progress-bar {
    line-height: 12px;
  }
}
</style> 
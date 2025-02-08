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
                      <tr v-for="(cut, index) in cuttingPlan" :key="index">
                        <td>{{ cut.sheetIndex + 1 }}</td>
                        <td>{{ cut.originalSpec }}</td>
                        <td>{{ cut.sequence }}</td>
                        <td>{{ cut.width }}×{{ cut.height }}</td>
                        <td>({{ cut.x }},{{ cut.y }})</td>
                        <td>{{ cut.rotated ? '是' : '否' }}</td>
                        <td>
                          <span v-if="cut.waste > 0" class="text-danger">
                            是 ({{ (cut.waste/1000000).toFixed(2) }}m²)
                          </span>
                          <span v-else>否</span>
                        </td>
                      </tr>
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
import { ref, onMounted, computed } from 'vue'
import * as d3 from 'd3'
import * as XLSX from 'xlsx'

// 状态定义
const stockList = ref([
  { width: 2000, height: 2400, price: 1000 }  // 默认一个原料规格
])
const cutList = ref([
  { width: 1000, height: 800, quantity: 2, canRotate: true }  // 添加旋转选项
])
const utilization = ref(0)
const totalSheets = ref(0)
const wasteArea = ref(0)
const totalCost = ref(0)
const cuttingPlan = ref([])
const visualizationContainer = ref(null)
const materialUsageStats = ref([])  // 新增：原料使用统计

// 添加原料规格
const addStockItem = () => {
  stockList.value.push({
    width: 2000,
    height: 2400,
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
    width: 0,
    height: 0,
    quantity: 1,
    canRotate: true  // 保持默认可旋转
  })
}

// 移除切割项
const removeCutItem = (index) => {
  cutList.value.splice(index, 1)
}

// 计算优化方案
const calculateOptimization = () => {
  // 1. 数据预处理
  const allPieces = []
  cutList.value.forEach(item => {
    for (let i = 0; i < item.quantity; i++) {
      allPieces.push({
        width: item.width,
        height: item.height,
        canRotate: item.canRotate,
        originalIndex: cutList.value.indexOf(item)
      })
    }
  })

  // 2. 按面积降序排序
  allPieces.sort((a, b) => (b.width * b.height) - (a.width * a.height))

  // 3. 计算需要的原料数量
  const result = []
  const remainingPieces = [...allPieces]
  const availableSpaces = [] // 存储可用的余料空间

  while (remainingPieces.length > 0) {
    // 首先尝试在现有余料中找到合适的空间
    let placed = false
    for (let i = 0; i < remainingPieces.length; i++) {
      const piece = remainingPieces[i]
      const { bestSpace, isRotated } = findBestSpace(availableSpaces, piece)
      
      if (bestSpace) {
        // 在余料中找到合适的空间
        const stockIndex = bestSpace.stockIndex
        
        // 添加切割
        result[stockIndex].cuts.push({
          x: bestSpace.x,
          y: bestSpace.y,
          width: isRotated ? piece.height : piece.width,
          height: isRotated ? piece.width : piece.height,
          originalIndex: piece.originalIndex,
          rotated: isRotated
        })
        
        // 更新余料空间
        updateAvailableSpaces(availableSpaces, bestSpace, piece, isRotated)
        
        remainingPieces.splice(i, 1)
        placed = true
        break
      }
    }

    // 如果没有找到合适的余料空间，使用新的原料
    if (!placed) {
      const piece = remainingPieces[0]
      const suitableStock = findBestStock(piece, stockList.value)
      
      const newStock = {
        width: suitableStock.width,
        height: suitableStock.height,
        price: suitableStock.price,
        cuts: [{
          x: 0,
          y: 0,
          width: piece.width,
          height: piece.height,
          originalIndex: piece.originalIndex,
          rotated: false
        }]
      }
      
      // 添加剩余空间到可用空间列表
      const rightSpace = {
        stockIndex: result.length,
        x: piece.width,
        y: 0,
        width: suitableStock.width - piece.width,
        height: piece.height
      }
      
      const bottomSpace = {
        stockIndex: result.length,
        x: 0,
        y: piece.height,
        width: suitableStock.width,
        height: suitableStock.height - piece.height
      }
      
      if (rightSpace.width > 0 && rightSpace.height > 0) {
        availableSpaces.push(rightSpace)
      }
      if (bottomSpace.width > 0 && bottomSpace.height > 0) {
        availableSpaces.push(bottomSpace)
      }
      
      result.push(newStock)
      remainingPieces.shift()
    }
  }

  // 4. 更新统计数据
  updateStats(result)

  // 5. 生成切割方案
  generateCuttingPlan(result)

  // 6. 更新可视化
  updateVisualization(result)
}

// 辅助函数：寻找最合适的原料规格
const findBestStock = (piece, stocks) => {
  let bestStock = stocks[0]
  let minWaste = Infinity

  stocks.forEach(stock => {
    // 检查原始方向是否合适
    if (stock.width >= piece.width && stock.height >= piece.height) {
      const waste = (stock.width * stock.height) - (piece.width * piece.height)
      if (waste < minWaste) {
        minWaste = waste
        bestStock = stock
      }
    }

    // 如果允许旋转，检查旋转后是否更合适
    if (piece.canRotate && stock.width >= piece.height && stock.height >= piece.width) {
      const waste = (stock.width * stock.height) - (piece.width * piece.height)
      if (waste < minWaste) {
        minWaste = waste
        bestStock = stock
      }
    }
  })

  return bestStock
}

// 辅助函数：在余料空间中找到最合适的位置
const findBestSpace = (spaces, piece) => {
  let bestSpace = null
  let minWaste = Infinity
  let bestRotation = false

  spaces.forEach(space => {
    // 检查原始方向
    if (space.width >= piece.width && space.height >= piece.height) {
      const waste = (space.width * space.height) - (piece.width * piece.height)
      if (waste < minWaste) {
        minWaste = waste
        bestSpace = space
        bestRotation = false
      }
    }

    // 如果允许旋转，检查旋转后的方向
    if (piece.canRotate && space.width >= piece.height && space.height >= piece.width) {
      const waste = (space.width * space.height) - (piece.width * piece.height)
      if (waste < minWaste) {
        minWaste = waste
        bestSpace = space
        bestRotation = true
      }
    }
  })

  return { bestSpace, isRotated: bestRotation }
}

// 辅助函数：更新可用空间列表
const updateAvailableSpaces = (spaces, usedSpace, piece, isRotated) => {
  // 移除使用的空间
  const spaceIndex = spaces.indexOf(usedSpace)
  spaces.splice(spaceIndex, 1)

  const pieceWidth = isRotated ? piece.height : piece.width
  const pieceHeight = isRotated ? piece.width : piece.height

  // 添加新的可用空间
  const rightSpace = {
    stockIndex: usedSpace.stockIndex,
    x: usedSpace.x + pieceWidth,
    y: usedSpace.y,
    width: usedSpace.width - pieceWidth,
    height: pieceHeight
  }

  const bottomSpace = {
    stockIndex: usedSpace.stockIndex,
    x: usedSpace.x,
    y: usedSpace.y + pieceHeight,
    width: usedSpace.width,
    height: usedSpace.height - pieceHeight
  }

  if (rightSpace.width > 0 && rightSpace.height > 0) {
    spaces.push(rightSpace)
  }
  if (bottomSpace.width > 0 && bottomSpace.height > 0) {
    spaces.push(bottomSpace)
  }
}

// 更新统计数据
const updateStats = (result) => {
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
}

// 生成切割方案
const generateCuttingPlan = (result) => {
  cuttingPlan.value = result.flatMap((stock, stockIndex) => 
    stock.cuts.map((cut, cutIndex) => ({
      sheetIndex: stockIndex,
      sequence: cutIndex + 1,
      width: cut.width,
      height: cut.height,
      x: cut.x,
      y: cut.y,
      rotated: cut.rotated,
      originalSpec: `${stock.width}×${stock.height}`,
      waste: cutIndex === stock.cuts.length - 1 ? stock.remainingArea : 0
    }))
  )
}

// 更新可视化
const updateVisualization = (result) => {
  if (!visualizationContainer.value) return

  // 清除现有内容
  d3.select(visualizationContainer.value).selectAll('*').remove()

  const margin = { top: 20, right: 20, bottom: 20, left: 60 }
  const containerWidth = visualizationContainer.value.clientWidth - margin.left - margin.right
  const scale = containerWidth / Math.max(...result.map(s => s.width))
  const height = (result.reduce((sum, stock) => sum + stock.height * scale, 0)) + 
    (result.length + 1) * margin.top

  // 创建SVG
  const svg = d3.select(visualizationContainer.value)
    .append('svg')
    .attr('width', containerWidth + margin.left + margin.right)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 创建颜色比例尺
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  // 绘制每个原料板
  let yOffset = 0
  result.forEach((stock, stockIndex) => {
    // 绘制原料板背景
    const stockGroup = svg.append('g')
      .attr('transform', `translate(0,${yOffset})`)

    stockGroup.append('rect')
      .attr('class', 'stock-sheet')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', stock.width * scale)
      .attr('height', stock.height * scale)
      .attr('fill', '#f8f9fa')
      .attr('stroke', '#dee2e6')

    // 绘制切割件
    stock.cuts.forEach((cut, cutIndex) => {
      const piece = stockGroup.append('g')
        .attr('transform', `translate(${cut.x * scale},${cut.y * scale})`)

      // 切割件矩形
      piece.append('rect')
        .attr('width', cut.width * scale)
        .attr('height', cut.height * scale)
        .attr('fill', colorScale(cut.originalIndex))
        .attr('stroke', 'white')

      // 尺寸标签
      piece.append('text')
        .attr('x', cut.width * scale / 2)
        .attr('y', cut.height * scale / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(`${cut.width}×${cut.height}${cut.rotated ? ' (R)' : ''}`)
    })

    // 添加原料板编号
    stockGroup.append('text')
      .attr('x', -10)
      .attr('y', stock.height * scale / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(`原料 ${stockIndex + 1}`)

    yOffset += stock.height * scale + margin.top
  })
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

// 组件挂载时初始化
onMounted(() => {
  calculateOptimization()
})
</script>

<style scoped>
.cutting-visualization {
  width: 100%;
  overflow-x: auto;
  min-height: 300px;
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
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.input-group .form-control.w-100 {
  border-radius: 0;
  width: 100%;
}
</style> 
<template>
  <div class="plastic-steel-cutting">
    <div class="page-subtitle">
      <div class="container">
        <h2>门窗材料切割优化</h2>
        <p>智能优化铝合金型材切割方案，提高材料利用率，降低生产成本</p>
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
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        v-model="stock.length"
                        placeholder="长度(mm)"
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
                      <button
                        type="button"
                        class="btn btn-danger"
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
                    <div class="input-group">
                      <input
                        type="number"
                        class="form-control"
                        v-model="item.length"
                        placeholder="长度(mm)"
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
                      <button
                        type="button"
                        class="btn btn-danger"
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

                <!-- 切割参数 -->
                <div class="mb-3">
                  <label class="form-label">切割损耗 (mm)</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="sawKerf"
                    required
                    min="0"
                    step="0.1"
                  >
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
                      <i class="fas fa-bars"></i>
                    </div>
                    <div class="stats-value">{{ totalBars }}</div>
                    <div class="stats-label">需要原料数</div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="stats-item text-center">
                    <div class="stats-icon mb-2">
                      <i class="fas fa-trash-alt"></i>
                    </div>
                    <div class="stats-value">{{ (wasteLength/10).toFixed(2) }}cm</div>
                    <div class="stats-label">总废料长度</div>
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
                      <td>{{ stat.spec }}mm</td>
                      <td>¥{{ stat.price }}</td>
                      <td>{{ stat.quantity }}根</td>
                      <td>¥{{ stat.total }}</td>
                    </tr>
                    <tr class="table-info">
                      <td colspan="2"><strong>合计</strong></td>
                      <td><strong>{{ totalBars }}根</strong></td>
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
                      <th>长度(mm)</th>
                      <th>起始位置</th>
                      <th>剩余长度</th>
                      <th>是否余料</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="cuttingPlan.length">
                      <tr v-for="(cut, index) in cuttingPlan" :key="index">
                        <td>{{ cut.barIndex + 1 }}</td>
                        <td>{{ cut.originalSpec }}</td>
                        <td>{{ cut.sequence }}</td>
                        <td>{{ cut.length }}</td>
                        <td>{{ cut.position }}</td>
                        <td>{{ cut.remaining }}</td>
                        <td>
                          <span v-if="cut.waste > 0" class="text-danger">
                            是 ({{ (cut.waste/10).toFixed(2) }}cm)
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
  { length: 6000, price: 100 }  // 默认一个原料规格
])
const sawKerf = ref(3)
const cutList = ref([
  { length: 2400, quantity: 2 }  // 移除优先级
])
const utilization = ref(0)
const totalBars = ref(0)
const wasteLength = ref(0)
const totalCost = ref(0)
const cuttingPlan = ref([])
const visualizationContainer = ref(null)
const materialUsageStats = ref([])  // 新增：原料使用统计

// 添加原料规格
const addStockItem = () => {
  stockList.value.push({
    length: 6000,
    price: 100
  })
}

// 移除原料规格
const removeStockItem = (index) => {
  stockList.value.splice(index, 1)
}

// 添加切割项
const addCutItem = () => {
  cutList.value.push({
    length: 0,
    quantity: 1
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
        length: item.length,
        originalIndex: cutList.value.indexOf(item)
      })
    }
  })

  // 2. 按长度降序排序
  allPieces.sort((a, b) => b.length - a.length)

  // 3. 计算需要的原料数量
  const result = []
  const remainingPieces = [...allPieces]
  const availableSpaces = [] // 存储可用的余料空间

  while (remainingPieces.length > 0) {
    // 首先尝试在现有余料中找到合适的空间
    let placed = false
    for (let i = 0; i < remainingPieces.length; i++) {
      const piece = remainingPieces[i]
      const spaceIndex = findBestSpace(availableSpaces, piece.length)
      
      if (spaceIndex !== -1) {
        // 在余料中找到合适的空间
        const space = availableSpaces[spaceIndex]
        const stockIndex = space.stockIndex
        
        // 添加切割
        result[stockIndex].cuts.push({
          length: piece.length,
          position: space.position,
          originalIndex: piece.originalIndex
        })
        
        // 更新余料空间
        const remainingLength = space.length - piece.length - sawKerf.value
        if (remainingLength >= Math.min(...remainingPieces.slice(1).map(p => p.length))) {
          availableSpaces[spaceIndex].length = remainingLength
          availableSpaces[spaceIndex].position = space.position + piece.length + sawKerf.value
        } else {
          availableSpaces.splice(spaceIndex, 1)
        }
        
        remainingPieces.splice(i, 1)
        placed = true
        break
      }
    }

    // 如果没有找到合适的余料空间，使用新的原料
    if (!placed) {
      const piece = remainingPieces[0]
      const suitableStock = findBestStock(piece.length, stockList.value)
      
      const newStock = {
        length: suitableStock.length,
        price: suitableStock.price,
        cuts: [{
          length: piece.length,
          position: 0,
          originalIndex: piece.originalIndex
        }]
      }
      
      // 添加剩余空间到可用空间列表
      const remainingLength = suitableStock.length - piece.length - sawKerf.value
      if (remainingLength >= Math.min(...remainingPieces.slice(1).map(p => p.length))) {
        availableSpaces.push({
          stockIndex: result.length,
          position: piece.length + sawKerf.value,
          length: remainingLength
        })
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
const findBestStock = (pieceLength, stocks) => {
  let bestStock = stocks[0]
  let minWaste = Infinity

  stocks.forEach(stock => {
    // 确保原料长度大于切割件长度
    if (stock.length >= pieceLength) {
      const waste = stock.length - pieceLength
      if (waste < minWaste) {
        minWaste = waste
        bestStock = stock
      }
    }
  })

  return bestStock
}

// 辅助函数：在余料空间中找到最合适的位置
const findBestSpace = (spaces, pieceLength) => {
  let bestSpaceIndex = -1
  let minWaste = Infinity

  spaces.forEach((space, index) => {
    if (space.length >= pieceLength) {
      const waste = space.length - pieceLength
      if (waste < minWaste) {
        minWaste = waste
        bestSpaceIndex = index
      }
    }
  })

  return bestSpaceIndex
}

// 更新统计数据
const updateStats = (result) => {
  // 重置统计数据
  totalBars.value = result.length
  let totalUsedLength = 0
  let totalStockLength = 0
  let totalStockCost = 0
  
  // 创建原料使用统计
  const usageMap = new Map()
  
  result.forEach(stock => {
    totalStockLength += stock.length
    totalStockCost += stock.price
    totalUsedLength += stock.cuts.reduce((sum, cut) => sum + cut.length + sawKerf.value, 0)
    
    // 统计每种规格的使用情况
    const specKey = `${stock.length}`
    if (!usageMap.has(specKey)) {
      usageMap.set(specKey, {
        spec: stock.length,
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
  utilization.value = Math.round((totalUsedLength / totalStockLength) * 100)
  wasteLength.value = totalStockLength - totalUsedLength
  totalCost.value = totalStockCost
  materialUsageStats.value = Array.from(usageMap.values())
}

// 生成切割方案
const generateCuttingPlan = (result) => {
  cuttingPlan.value = result.flatMap((stock, stockIndex) => 
    stock.cuts.map((cut, cutIndex) => ({
      barIndex: stockIndex,
      sequence: cutIndex + 1,
      length: cut.length,
      position: cut.position,
      remaining: stock.length - cut.length - sawKerf.value,
      originalSpec: `${stock.length}mm`,
      waste: cut.length + sawKerf.value - stock.length
    }))
  )
}

// 更新可视化
const updateVisualization = (result) => {
  if (!visualizationContainer.value) return

  // 清除现有内容
  d3.select(visualizationContainer.value).selectAll('*').remove()

  const margin = { top: 20, right: 20, bottom: 20, left: 60 }
  const width = visualizationContainer.value.clientWidth - margin.left - margin.right
  const barHeight = 40
  const height = (result.length * barHeight * 1.5) + margin.top + margin.bottom

  // 创建SVG
  const svg = d3.select(visualizationContainer.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 创建比例尺
  const xScale = d3.scaleLinear()
    .domain([0, d3.max(result, d => d.length)])
    .range([0, width])

  // 创建颜色比例尺
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

  // 绘制每个原料条
  const bars = svg.selectAll('.bar-group')
    .data(result)
    .enter()
    .append('g')
    .attr('class', 'bar-group')
    .attr('transform', (d, i) => `translate(0,${i * barHeight * 1.5})`)

  // 绘制原料条背景
  bars.append('rect')
    .attr('class', 'stock-bar')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', d => xScale(d.length))
    .attr('height', barHeight)
    .attr('fill', '#f8f9fa')
    .attr('stroke', '#dee2e6')

  // 绘制切割段
  bars.each(function(stock, stockIndex) {
    const bar = d3.select(this)
    let accumPosition = 0

    // 绘制切割段
    stock.cuts.forEach((cut, cutIndex) => {
      // 切割段矩形
      bar.append('rect')
        .attr('x', xScale(accumPosition))
        .attr('y', 0)
        .attr('width', xScale(cut.length))
        .attr('height', barHeight)
        .attr('fill', colorScale(cut.originalIndex))
        .attr('stroke', 'white')

      // 切割段标签
      bar.append('text')
        .attr('x', xScale(accumPosition + cut.length/2))
        .attr('y', barHeight/2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text(cut.length)

      accumPosition += cut.length + sawKerf.value
    })

    // 显示余料
    if (stock.length - stock.cuts.reduce((sum, cut) => sum + cut.length + sawKerf.value, 0) > 0) {
      bar.append('rect')
        .attr('x', xScale(accumPosition))
        .attr('y', 0)
        .attr('width', xScale(stock.length - stock.cuts.reduce((sum, cut) => sum + cut.length + sawKerf.value, 0)))
        .attr('height', barHeight)
        .attr('fill', '#f8f9fa')
        .attr('stroke', '#dee2e6')
        .attr('stroke-dasharray', '4,4')

      bar.append('text')
        .attr('x', xScale(accumPosition + (stock.length - stock.cuts.reduce((sum, cut) => sum + cut.length + sawKerf.value, 0))/2))
        .attr('y', barHeight/2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .text(`余料: ${stock.length - stock.cuts.reduce((sum, cut) => sum + cut.length + sawKerf.value, 0)}`)
    }

    // 添加原料编号
    bar.append('text')
      .attr('x', -10)
      .attr('y', barHeight/2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .text(`原料 ${stockIndex + 1}`)
  })

  // 添加刻度
  const xAxis = d3.axisBottom(xScale)
    .ticks(10)
    .tickFormat(d => `${d}mm`)

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(xAxis)
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
          length: row.length || 6000,
          price: row.price || 100
        }))
      }

      // 读取切割清单
      const cutSheet = workbook.Sheets['切割清单']
      if (cutSheet) {
        const cutData = XLSX.utils.sheet_to_json(cutSheet)
        cutList.value = cutData.map(row => ({
          length: row.length || 0,
          quantity: row.quantity || 1
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
    总原料数: totalBars.value,
    材料利用率: `${utilization.value}%`,
    总废料长度: wasteLength.value,
    总成本: totalCost.value
  }]
  const statsSheet = XLSX.utils.json_to_sheet(statsData)
  XLSX.utils.book_append_sheet(workbook, statsSheet, '统计数据')

  // 导出文件
  XLSX.writeFile(workbook, '切割优化方案.xlsx')
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
</style> 
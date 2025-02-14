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
        <div class="col-lg-4 input-section">
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
                <button class="btn btn-outline-primary" @click="exportToImage">
                  <i class="fas fa-image me-2"></i>导出到图片
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
                      <th>切割明细</th>
                      <th>剩余长度</th>
                      <th>利用率</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="cuttingPlan.length">
                      <tr v-for="(plan, index) in cuttingPlan" :key="index">
                        <td>{{ plan.barIndex }}</td>
                        <td>{{ plan.originalSpec }}</td>
                        <td>{{ plan.cutDetails }}</td>
                        <td>
                          <span :class="{'text-danger': plan.isWaste}">
                            {{ plan.remainingLength }}mm
                          </span>
                        </td>
                        <td>
                          <span class="utilization-badge" :class="{
                            'bg-success': plan.utilization >= 90,
                            'bg-warning': plan.utilization < 90 && plan.utilization >= 70,
                            'bg-danger': plan.utilization < 70
                          }">
                            {{ plan.utilization }}%
                          </span>
                        </td>
                      </tr>
                    </template>
                    <tr v-else>
                      <td colspan="5" class="text-center">暂无切割方案</td>
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
const sawKerf = ref(4)  // 修改默认切割损耗为4mm
const cutList = ref([
  { length: 2990, quantity: 2 }  // 更新默认切割项以便测试
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
  // 1. 数据预处理：按长度分组并记录需求数量
  const requirements = new Map()
  cutList.value.forEach(item => {
    const key = item.length
    requirements.set(key, (requirements.get(key) || 0) + item.quantity)
  })

  // 2. 获取所有切割长度并按降序排序
  const cutLengths = Array.from(requirements.keys()).sort((a, b) => b - a)
  
  // 3. 计算单个原料的最优切割方案
  const findBestPattern = (stockLength, reqs) => {
    const patterns = []
    
    const tryPattern = (remaining, current = [], usedLengths = new Set()) => {
      // 计算当前方案的总长度（包含切割损耗）
      const totalLength = current.reduce((sum, cut) => {
        return sum + cut.length + (current.length > 1 ? sawKerf.value : 0)
      }, 0)
      
      patterns.push({
        cuts: [...current],
        remaining: stockLength - totalLength,
        efficiency: totalLength / stockLength
      })
      
      for (const length of cutLengths) {
        // 考虑切割损耗进行判断
        const needSpace = length + (current.length > 0 ? sawKerf.value : 0)
        if (reqs.get(length) > 0 && needSpace <= remaining) {
          reqs.set(length, reqs.get(length) - 1)
          current.push({ length, position: stockLength - remaining })
          tryPattern(remaining - needSpace, current, new Set([...usedLengths, length]))
          current.pop()
          reqs.set(length, reqs.get(length) + 1)
        }
      }
    }
    
    tryPattern(stockLength)
    return patterns.sort((a, b) => b.efficiency - a.efficiency)[0]
  }
  
  // 4. 生成切割方案
  const result = []
  const remainingReqs = new Map(requirements)
  
  // 记录已使用的方案效率
  const usedPatterns = new Map()
  
  while (Array.from(remainingReqs.values()).some(qty => qty > 0)) {
    let bestStock = null
    let bestPattern = null
    let maxEfficiency = 0
    
    // 为每种规格的原料生成切割方案
    for (const stock of stockList.value) {
      const pattern = findBestPattern(stock.length, remainingReqs)
      
      // 计算方案效率
      const efficiency = pattern.efficiency
      
      // 如果效率更高，更新最佳方案
      if (efficiency > maxEfficiency) {
        maxEfficiency = efficiency
        bestStock = stock
        bestPattern = pattern
      }
    }
    
    // 如果找到可行方案
    if (bestPattern) {
      // 更新剩余需求
      bestPattern.cuts.forEach(cut => {
        remainingReqs.set(cut.length, remainingReqs.get(cut.length) - 1)
      })
      
      // 添加到结果中
      result.push({
        stock: bestStock,
        cuts: bestPattern.cuts,
        efficiency: bestPattern.efficiency,
        waste: bestPattern.remaining
      })
    } else {
      // 如果没有找到可行方案，说明所有需求已满足
      break
    }
  }

  // 5. 更新统计数据
  updateStats(result)

  // 6. 生成切割方案
  generateCuttingPlan(result)

  // 7. 更新可视化
  updateVisualization(result)
}

// 更新统计数据
const updateStats = (result) => {
  totalBars.value = result.length
  let totalUsedLength = 0
  let totalLossLength = 0
  let totalStockLength = 0
  let totalStockCost = 0
  
  const usageMap = new Map()
  
  result.forEach(plan => {
    const stock = plan.stock
    totalStockLength += stock.length
    totalStockCost += stock.price
    
    // 计算实际使用长度（包括切割损耗）
    const usedLength = plan.cuts.reduce((sum, cut) => sum + cut.length, 0)
    const lossLength = (plan.cuts.length - 1) * sawKerf.value
    
    totalUsedLength += usedLength
    totalLossLength += lossLength
    
    // 更新使用统计
    const key = stock.length
    if (!usageMap.has(key)) {
      usageMap.set(key, {
        spec: key,
        price: stock.price,
        quantity: 1,
        total: stock.price
      })
    } else {
      const stat = usageMap.get(key)
      stat.quantity++
      stat.total = stat.quantity * stat.price
    }
  })
  
  // 更新统计数据 - 修改利用率计算
  const totalUsed = totalUsedLength + totalLossLength // 总使用长度（包含切割损耗）
  utilization.value = Number(((totalUsed / totalStockLength) * 100).toFixed(2))
  wasteLength.value = totalStockLength - totalUsed // 总废料长度 = 总长度 - 使用长度（包含切割损耗）
  totalCost.value = totalStockCost
  materialUsageStats.value = Array.from(usageMap.values())
}

// 生成切割方案
const generateCuttingPlan = (result) => {
  // 按原料规格分组整理切割方案
  const groupedPlan = result.map((stock, stockIndex) => {
    // 统计每种长度的数量
    const lengthCounts = new Map()
    stock.cuts.forEach(cut => {
      const key = cut.length
      lengthCounts.set(key, (lengthCounts.get(key) || 0) + 1)
    })
    
    // 计算当前原料的利用率 - 修改计算逻辑
    const totalCutLength = stock.cuts.reduce((sum, cut) => sum + cut.length, 0) // 实际切割长度
    const totalLoss = (stock.cuts.length - 1) * sawKerf.value // 切割损耗总长度
    const totalUsed = totalCutLength + totalLoss // 总使用长度（包含切割损耗）
    const utilization = Number(((totalUsed / stock.stock.length) * 100).toFixed(2)) // 计算利用率，保留两位小数
    
    // 计算实际剩余长度
    const remainingLength = stock.stock.length - totalUsed
    
    // 转换为显示格式
    const cutDetails = Array.from(lengthCounts.entries())
      .sort((a, b) => b[0] - a[0]) // 按长度降序排序
      .map(([length, count]) => `${length}mm×${count}`)
      .join('，')
    
    return {
      barIndex: stockIndex + 1,
      originalSpec: `${stock.stock.length}mm`,
      cutDetails: cutDetails,
      remainingLength: remainingLength,
      isWaste: remainingLength > 0,
      utilization: utilization,
      sawKerfLoss: totalLoss
    }
  })
  
  cuttingPlan.value = groupedPlan
}

// 更新可视化
const updateVisualization = (result) => {
  if (!visualizationContainer.value) return

  // 清除现有内容
  d3.select(visualizationContainer.value).selectAll('*').remove()

  const margin = { top: 20, right: 120, bottom: 20, left: 100 }
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
    .domain([0, d3.max(result, d => d.stock.length)])
    .range([0, width])

  // 获取所有不同的切割长度
  const uniqueLengths = new Set()
  result.forEach(plan => {
    plan.cuts.forEach(cut => {
      uniqueLengths.add(cut.length)
    })
  })
  
  // 创建颜色映射
  const colorMap = new Map()
  Array.from(uniqueLengths).sort((a, b) => b - a).forEach((length, index) => {
    colorMap.set(length, d3.schemeCategory10[index % 10])
  })

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
    .attr('width', d => xScale(d.stock.length))
    .attr('height', barHeight)
    .attr('fill', '#e9ecef')  // 更深的背景色
    .attr('stroke', '#ced4da')
    .attr('stroke-width', 1.5)  // 更粗的边框

  // 绘制切割段
  bars.each(function(plan) {
    const bar = d3.select(this)
    let accumPosition = 0

    // 绘制切割段
    plan.cuts.forEach(cut => {
      const cutWidth = xScale(cut.length)
      const cutX = xScale(accumPosition)
      
      if (isNaN(cutWidth) || isNaN(cutX)) return

      // 切割段矩形
      bar.append('rect')
        .attr('x', cutX)
        .attr('y', 0)
        .attr('width', cutWidth)
        .attr('height', barHeight)
        .attr('fill', colorMap.get(cut.length))
        .attr('stroke', 'white')

      // 切割段标签
      if (cutWidth > 40) {
        bar.append('text')
          .attr('x', cutX + cutWidth/2)
          .attr('y', barHeight/2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .attr('class', 'cut-label')
          .text(cut.length)
      }

      accumPosition += cut.length + sawKerf.value
    })

    // 显示余料
    const remainingLength = plan.waste
    if (remainingLength > 0) {
      const remainingX = xScale(accumPosition)
      const remainingWidth = xScale(remainingLength)
      
      if (!isNaN(remainingX) && !isNaN(remainingWidth)) {
        // 余料矩形
        bar.append('rect')
          .attr('x', remainingX)
          .attr('y', 0)
          .attr('width', remainingWidth)
          .attr('height', barHeight)
          .attr('fill', '#f8f9fa')
          .attr('stroke', '#dee2e6')
          .attr('stroke-dasharray', '4,4')

        // 余料文本背景
        const remainingText = `余料: ${remainingLength}mm`
        bar.append('rect')
          .attr('x', xScale(plan.stock.length) + 10)
          .attr('y', 0)
          .attr('width', 100)
          .attr('height', barHeight)
          .attr('fill', '#f8f9fa')
          .attr('rx', 4)
          .attr('ry', 4)

        // 余料文本
        bar.append('text')
          .attr('x', xScale(plan.stock.length) + 60)
          .attr('y', barHeight/2)
          .attr('dy', '0.35em')
          .attr('text-anchor', 'middle')
          .attr('fill', '#666')
          .attr('class', 'remaining-label')
          .text(remainingText)
      }
    }
  })

  // 添加原料编号和规格
  bars.append('g')
    .attr('class', 'spec-label')
    .attr('transform', d => `translate(-10, 0)`)
    .append('rect')
    .attr('x', -80)
    .attr('y', 5)
    .attr('width', 80)
    .attr('height', 30)
    .attr('fill', '#f8f9fa')
    .attr('stroke', '#dee2e6')
    .attr('rx', 4)

  bars.select('.spec-label')
    .append('text')
    .attr('x', -40)
    .attr('y', barHeight/2)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', '#333')
    .attr('font-size', '12px')
    .text((d, i) => `${d.stock.length}mm`)

  // 添加图例
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 20}, 0)`)
    .append('rect')
    .attr('width', 100)
    .attr('height', uniqueLengths.size * 25 + 10)
    .attr('fill', '#f8f9fa')
    .attr('stroke', '#dee2e6')
    .attr('rx', 4)
    .attr('ry', 4)

  const legendGroup = svg.select('.legend')
    .append('g')
    .attr('transform', 'translate(10, 10)')

  const legendItems = legendGroup.selectAll('.legend-item')
    .data(Array.from(colorMap.entries()))
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 25})`)

  legendItems.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', d => d[1])
    .attr('stroke', 'white')

  legendItems.append('text')
    .attr('x', 25)
    .attr('y', 12)
    .text(d => `${d[0]}mm`)
    .style('font-size', '12px')
    .style('font-weight', '500')

  // 添加刻度
  const xAxis = d3.axisBottom(xScale)
    .ticks(10)
    .tickFormat(d => `${d}mm`)

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(xAxis)
}

// 添加样式
const style = document.createElement('style')
style.textContent = `
  .cut-label {
    font-size: 12px;
    font-weight: 500;
  }
  .remaining-label {
    font-size: 12px;
    font-weight: 500;
  }
  .utilization-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    color: white;
    font-weight: 500;
    min-width: 60px;
    text-align: center;
  }
  .bg-success {
    background-color: #28a745;
  }
  .bg-warning {
    background-color: #ffc107;
    color: #000; /* 黄色背景使用黑色文字更易读 */
  }
  .bg-danger {
    background-color: #dc3545;
  }
`
document.head.appendChild(style)

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

// 在script部分添加导出图片方法
const exportToImage = () => {
  if (!visualizationContainer.value) return;
  
  try {
    // 获取SVG元素
    const svg = visualizationContainer.value.querySelector('svg');
    if (!svg) {
      console.warn('未找到SVG元素');
      return;
    }

    // 创建一个SVG的克隆，以便修改而不影响原始SVG
    const clonedSvg = svg.cloneNode(true);
    
    // 设置白色背景
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', 'white');
    clonedSvg.insertBefore(rect, clonedSvg.firstChild);

    // 将SVG转换为字符串
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(clonedSvg);
    
    // 创建Blob
    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 创建图片对象
    const img = new Image();
    img.onload = () => {
      // 设置Canvas尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制图片
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // 转换为PNG并下载
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `门窗切割方案_${new Date().toISOString().slice(0,10)}.png`;
      downloadLink.click();
      
      // 清理
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  } catch (error) {
    console.error('导出图片时出错:', error);
  }
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
</style> 
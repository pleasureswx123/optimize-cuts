// 优化后的切割算法
function optimizeCutting(requirements, stockSpecs, sawKerf = 0) {
  console.log('输入参数：');
  console.log('切割需求:', JSON.stringify(requirements));
  console.log('原料规格:', JSON.stringify(stockSpecs));
  console.log('切割损耗:', sawKerf, 'mm');

  // 1. 预处理数据
  const startTime = performance.now();
  
  // 按长度降序排序切割需求并合并相同长度
  const cutLengths = new Map();
  requirements.forEach(req => {
    const length = req.length;
    cutLengths.set(length, (cutLengths.get(length) || 0) + req.quantity);
  });

  // 按性价比（长度/价格）降序排序原料规格
  const sortedStocks = [...stockSpecs].sort((a, b) => (b.length / b.price) - (a.length / a.price));

  // 2. 优化算法实现
  const result = [];
  const remainingCuts = new Map(cutLengths);

  while ([...remainingCuts.values()].some(qty => qty > 0)) {
    let bestStock = null;
    let bestPattern = null;
    let bestEfficiency = -1;

    // 对每种原料规格尝试切割方案
    for (const stock of sortedStocks) {
      const pattern = findBestPattern(remainingCuts, stock.length, sawKerf);
      
      if (pattern && pattern.efficiency > bestEfficiency) {
        bestEfficiency = pattern.efficiency;
        bestPattern = pattern;
        bestStock = stock;
      }
    }

    if (bestPattern && bestStock) {
      result.push({
        stock: bestStock,
        pattern: bestPattern.cuts,
        efficiency: bestPattern.efficiency,
        waste: bestPattern.waste
      });

      // 更新剩余切割需求
      bestPattern.cuts.forEach(cut => {
        const remaining = remainingCuts.get(cut) - 1;
        if (remaining > 0) {
          remainingCuts.set(cut, remaining);
        } else {
          remainingCuts.delete(cut);
        }
      });
    } else {
      console.error('无法找到合适的切割方案');
      break;
    }
  }

  // 3. 计算统计数据
  const totalLength = result.reduce((sum, r) => sum + r.stock.length, 0);
  const totalUsedLength = result.reduce((sum, r) => sum + r.pattern.reduce((s, c) => s + c, 0), 0);
  const totalEfficiency = (totalUsedLength / totalLength) * 100;

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  // 4. 输出结果
  console.log('\n优化结果:');
  console.log('1. 总方案数:', result.length);
  console.log('2. 详细方案:');
  result.forEach((r, i) => {
    console.log(
      `方案 ${i + 1}: `,
      `原料: ${r.stock.length} mm；`,
      `切割: ${r.pattern.join(', ')} mm；`,
      `利用率: ${r.efficiency.toFixed(2)}%；`,
      `剩余: ${r.waste} mm；`
    );
  });
  console.log(`总利用率: ${totalEfficiency.toFixed(2)}%；`);
  console.log(`执行时间: ${executionTime.toFixed(2)}ms`);

  return {
    plans: result,
    totalEfficiency,
    executionTime
  };
}

// 辅助函数：找到最佳切割方案
function findBestPattern(remainingCuts, stockLength, sawKerf) {
  let bestPattern = {
    cuts: [],
    waste: stockLength,
    efficiency: 0
  };

  // 获取所有可用的切割长度，按降序排序
  const availableCuts = [...remainingCuts.entries()]
    .filter(([_, qty]) => qty > 0)
    .map(([length]) => length)
    .sort((a, b) => b - a);

  // 使用迭代方法而不是递归，避免栈溢出
  const stack = [{
    cuts: [],
    currentLength: 0,
    startIndex: 0
  }];

  while (stack.length > 0) {
    const { cuts, currentLength, startIndex } = stack.pop();

    // 计算当前方案的效率
    const efficiency = (currentLength / stockLength) * 100;
    const waste = stockLength - currentLength;

    // 如果当前方案更好，更新最佳方案
    if (efficiency > bestPattern.efficiency || 
        (efficiency === bestPattern.efficiency && waste < bestPattern.waste)) {
      bestPattern = {
        cuts: [...cuts],
        waste,
        efficiency
      };
    }

    // 如果已经达到最大切割数或无法继续切割，跳过
    if (cuts.length >= 10 || startIndex >= availableCuts.length) {
      continue;
    }

    // 尝试添加新的切割
    for (let i = startIndex; i < availableCuts.length; i++) {
      const cut = availableCuts[i];
      const newLength = currentLength + cut + (cuts.length > 0 ? sawKerf : 0);

      if (newLength <= stockLength && remainingCuts.get(cut) > 
          cuts.filter(c => c === cut).length) {
        stack.push({
          cuts: [...cuts, cut],
          currentLength: newLength,
          startIndex: i
        });
      }
    }
  }

  return bestPattern;
}

// 测试用例
function runTests() {
  console.log('开始运行测试用例...\n');

  // 测试用例1
  console.log('测试用例1:');
  const test1Result = optimizeCutting(
    [
      { length: 550, quantity: 5 },
      { length: 700, quantity: 5 },
      { length: 800, quantity: 5 }
    ],
    [
      { length: 6000, price: 60 },
      { length: 4250, price: 42.5 }
    ],
    0
  );

  // 测试用例2
  console.log('\n测试用例2:');
  const test2Result = optimizeCutting(
    [
      { length: 500, quantity: 5 },
      { length: 700, quantity: 5 },
      { length: 800, quantity: 5 },
      { length: 600, quantity: 3 }
    ],
    [
      { length: 6000, price: 60 }
    ],
    0
  );

  // 验证结果
  function validateResult(result, expectedEfficiency, testCase) {
    console.log(`\n验证测试用例${testCase}结果:`);
    console.log(`期望利用率: ${expectedEfficiency}%`);
    console.log(`实际利用率: ${result.totalEfficiency.toFixed(2)}%`);
    console.log(`执行时间: ${result.executionTime.toFixed(2)}ms`);
    
    const passed = Math.abs(result.totalEfficiency - expectedEfficiency) < 0.01;
    console.log(`测试${passed ? '通过' : '失败'}`);
    
    return passed;
  }

  const test1Passed = validateResult(test1Result, 100, 1);
  const test2Passed = validateResult(test2Result, 98.33, 2);

  console.log('\n测试总结:');
  console.log(`测试用例1: ${test1Passed ? '通过' : '失败'}`);
  console.log(`测试用例2: ${test2Passed ? '通过' : '失败'}`);
}

// 运行测试
runTests();

module.exports = {
  optimizeCutting,
  findBestPattern
}; 
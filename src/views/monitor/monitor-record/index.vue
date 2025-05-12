<template>
  <div class="page-container">
    <div class="monitor-record-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">Hash：</span>
            <el-input v-model="queryParams.hash" placeholder="输入关键词" clearable style="width: 220px" />
          </div>
          
          <div class="search-item">
            <span class="search-label">类型：</span>
            <el-select v-model="queryParams.type" placeholder="全部" clearable style="width: 168px">
              <el-option 
                v-for="item in transactionTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">公链：</span>
            <el-select v-model="queryParams.chain" placeholder="全部" clearable style="width: 168px">
              <el-option 
                v-for="item in chainOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">币种：</span>
            <el-input v-model="queryParams.tokenName" placeholder="输入关键词" clearable style="width: 220px" />
          </div>
          
          <div class="search-item">
            <span class="search-label">监听地址：</span>
            <el-input v-model="queryParams.monitorAddress" placeholder="输入关键词" clearable style="width: 220px" />
          </div>
          
          <div class="search-item">
            <span class="search-label">对象地址：</span>
            <el-input v-model="queryParams.targetAddress" placeholder="输入关键词" clearable style="width: 220px" />
          </div>
          
          <!-- 添加二次列表筛选 -->
          <div class="search-item">
            <span class="search-label">二次列表：</span>
            <el-select v-model="queryParams.isBySecondaryList" placeholder="全部" clearable style="width: 120px">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">交易时间：</span>
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              :default-time="['00:00:00', '23:59:59']"
              style="width: 380px"
            />
          </div>
          
          <div class="search-buttons">
            <el-button type="primary" @click="handleQuery">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button @click="handleExport">导出</el-button>
          </div>
        </div>
      </el-card>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="recordList"
        style="width: 100%"
        border
      >
        <el-table-column prop="hash" label="Hash" min-width="120" />
        <el-table-column prop="monitorAddress" label="监听地址" min-width="160">
          <template #default="{ row }">
            <el-tooltip :content="row.monitorAddress" placement="top">
              <span class="ellipsis-text">{{ row.monitorAddress }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="targetAddress" label="对象地址" min-width="160">
          <template #default="{ row }">
            <el-tooltip :content="row.targetAddress" placement="top">
              <span class="ellipsis-text">{{ row.targetAddress }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="80" />
        <el-table-column prop="chain" label="公链" width="80" />
        <el-table-column prop="tokenName" label="币种" width="100" />
        <el-table-column prop="amount" label="转账数量" width="100">
          <template #default="{ row }">
            <span :class="row.amount.startsWith('+') ? 'amount-positive' : 'amount-negative'">{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customer" label="客户" min-width="120" />
        <el-table-column prop="callbackTime" label="交易时间" min-width="160" />
        
        <!-- 新增字段：是否命中监控 -->
        <el-table-column label="是否命中监控" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isTriggered ? 'danger' : 'info'" size="small">
              {{ row.isTriggered ? '已命中' : '未命中' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 新增字段：命中规则描述 -->
        <el-table-column label="命中规则描述" min-width="200">
          <template #default="{ row }">
            <span v-if="row.isTriggered">单笔金额≥1000USDT 且 达到历史最大金额的110%</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 新增字段：异常记录ID -->
        <el-table-column label="异常记录ID" width="120">
          <template #default="{ row }">
            <el-button 
              v-if="row.isTriggered && row.triggerId" 
              type="primary" 
              link 
              @click="viewTriggerRecord(row)"
            >
              {{ row.triggerId }}
            </el-button>
            <span v-else>-</span>
          </template>
        </el-table-column>
        
        <!-- 新增字段：是否二次列表自动触发 -->
        <el-table-column label="二次列表" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.isBySecondaryList" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { CallbackRecord } from '@/types/monitor'
import { chainOptions, transactionTypeOptions } from '@/constants/options'
import { useRoute, useRouter } from 'vue-router'
import { appState } from '@/constants/appState'

// 查询参数
const queryParams = reactive({
  hash: '',
  monitorAddress: '',
  targetAddress: '',
  type: '',
  chain: '',
  tokenName: '',
  customer: '',
  isBySecondaryList: undefined as boolean | undefined,
  pageNum: 1,
  pageSize: 10,
  timeRange: [] as string[]
})

// 日期范围
const dateRange = ref<string[]>([])

// 监听日期范围变化，更新查询参数中的时间范围
watch(dateRange, (val) => {
  queryParams.timeRange = val
})

// 数据加载状态
const loading = ref(false)
// 记录列表
const recordList = ref<EnhancedCallbackRecord[]>([])
// 总条数
const total = ref(0)

// 查询表单引用
const queryFormRef = ref()
const queryFormRef2 = ref()

// 路由相关
const route = useRoute()
const router = useRouter()

// 扩展CallbackRecord类型，添加监控相关字段
interface EnhancedCallbackRecord extends CallbackRecord {
  isTriggered?: boolean;
  triggerDesc?: string;
  triggerId?: string;
  isBySecondaryList?: boolean;
  secondaryListMode?: 'auto' | 'manual';
}

// 获取监听记录列表
const getList = () => {
  loading.value = true
  recordList.value = [] // 确保在开始加载前清空数据
  total.value = 0 // 重置总数
  
  try {
    // 使用回调记录数据作为监听记录数据的示例
    let filteredData = [...appState.callbackData]
    
    // 应用过滤
    if (queryParams.hash) {
      filteredData = filteredData.filter(item => item.hash.includes(queryParams.hash))
    }
    
    if (queryParams.type) {
      filteredData = filteredData.filter(item => item.type === queryParams.type)
    }
    
    if (queryParams.chain) {
      filteredData = filteredData.filter(item => item.chain === queryParams.chain)
    }
    
    if (queryParams.tokenName) {
      filteredData = filteredData.filter(item => 
        item.tokenName && item.tokenName.includes(queryParams.tokenName))
    }
    
    if (queryParams.monitorAddress) {
      filteredData = filteredData.filter(item => 
        item.monitorAddress && item.monitorAddress.includes(queryParams.monitorAddress))
    }
    
    if (queryParams.targetAddress) {
      filteredData = filteredData.filter(item => 
        item.targetAddress && item.targetAddress.includes(queryParams.targetAddress))
    }
    
    // 添加二次列表筛选
    if (queryParams.isBySecondaryList !== undefined) {
      filteredData = filteredData.filter(item => {
        // 使用hash值倒数第二位数字判断是否为二次列表自动触发
        const hashSecondLastDigit = parseInt(item.hash.slice(-2, -1), 16)
        const isBySecondaryList = hashSecondLastDigit % 4 === 0 // 约1/4的命中记录是二次列表触发
        return isBySecondaryList === queryParams.isBySecondaryList
      })
    }
    
    if (queryParams.timeRange && queryParams.timeRange.length === 2) {
      const startTime = new Date(queryParams.timeRange[0]).getTime()
      const endTime = new Date(queryParams.timeRange[1]).getTime()
      
      filteredData = filteredData.filter(item => {
        const callbackTime = new Date(item.callbackTime).getTime()
        return callbackTime >= startTime && callbackTime <= endTime
      })
    }
    
    // 为每条记录增加监控相关字段
    filteredData = filteredData.map((item, index) => {
      // 使用hash值最后一位数字作为是否命中监控的判断依据
      const hashLastDigit = parseInt(item.hash.slice(-1), 16)
      const isTriggered = hashLastDigit % 3 !== 2 // 约2/3的记录命中监控
      
      // 根据索引位置设置二次列表状态
      let isBySecondaryList = false
      if (index === 1) { // 第二条记录
        isBySecondaryList = false
      } else if (index === 2) { // 第三条记录
        isBySecondaryList = true
      } else {
        // 其他记录保持原来的随机逻辑
        const hashSecondLastDigit = parseInt(item.hash.slice(-2, -1), 16)
        isBySecondaryList = hashSecondLastDigit % 4 === 0 && isTriggered // 约1/4的命中记录是二次列表触发
      }
      
      const secondaryListMode = 'manual' // 统一设置为手动模式
      
      // 为命中记录生成触发描述和异常记录ID
      let triggerDesc = ''
      let triggerId = ''
      
      if (isTriggered) {
        // 所有命中的记录都使用相同的规则描述
        triggerDesc = '单笔金额≥1000USDT 且 达到历史最大金额的110%'
        
        // 生成模拟的异常记录ID，确保与异常触发记录页面的ID格式一致
        // 从异常触发记录中找到与当前记录的hash匹配的记录，使用其ID
        const matchedTriggerRecord = appState.triggerData.find(record => record.hash === item.hash)
        if (matchedTriggerRecord) {
          triggerId = matchedTriggerRecord.id
        } else {
          // 如果没有找到匹配的记录，生成一个1000-9999之间的四位数字ID
          triggerId = (1000 + (hashLastDigit * 123 + new Date(item.callbackTime).getTime()) % 9000).toString()
        }
      }
      
      return {
        ...item,
        isTriggered,
        isBySecondaryList,
        secondaryListMode,
        triggerDesc,
        triggerId
      }
    })
    
    // 分页处理
    const start = (queryParams.pageNum - 1) * queryParams.pageSize
    const end = start + queryParams.pageSize
    
    recordList.value = filteredData.slice(start, Math.min(end, filteredData.length))
    total.value = filteredData.length
  } catch (error) {
    console.error('获取监听记录列表失败', error)
    ElMessage.error('获取监听记录列表失败')
  } finally {
    loading.value = false
  }
}

// 监听路由变化，确保每次进入页面时数据都会重新加载
watch(() => route.fullPath, () => {
  // 检查URL中是否有hash参数
  const hashParam = route.query.hash
  if (hashParam) {
    queryParams.hash = hashParam as string
  }
  getList()
}, { immediate: true })

// 查询按钮点击事件
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置按钮点击事件
const handleReset = () => {
  queryFormRef.value?.resetFields()
  queryFormRef2.value?.resetFields()
  dateRange.value = []
  queryParams.pageNum = 1
  getList()
}

// 导出按钮点击事件
const handleExport = () => {
  ElMessage.success('导出功能已触发')
}

// 每页条数变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  getList()
}

// 页码变化
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  getList()
}

// 页面挂载时加载数据
onMounted(() => {
  // 检查URL中是否有hash参数
  const hashParam = route.query.hash
  if (hashParam) {
    queryParams.hash = hashParam as string
  }
  getList()
})

// 新增的viewTriggerRecord函数
const viewTriggerRecord = (row: EnhancedCallbackRecord) => {
  // 实现跳转到异常触发记录页面的逻辑
  router.push({
    path: '/monitor/trigger-record',
    query: {
      id: row.triggerId // 使用id作为参数名，与异常触发记录页面接收的参数名一致
    }
  })
  ElMessage.success(`跳转到异常记录ID: ${row.triggerId}`)
}
</script>

<style scoped>
.monitor-record-container {
  padding: 20px;
}

.card-container {
  margin-bottom: 16px;
}

.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.search-item {
  display: flex;
  align-items: center;
}

.search-label {
  white-space: nowrap;
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.search-buttons {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.ellipsis-text {
  display: inline-block;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-positive {
  color: #67C23A;
  font-weight: bold;
}

.amount-negative {
  color: #F56C6C;
  font-weight: bold;
}
</style> 
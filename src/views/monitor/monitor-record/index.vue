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
import { useRoute } from 'vue-router'
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
const recordList = ref<CallbackRecord[]>([])
// 总条数
const total = ref(0)

// 查询表单引用
const queryFormRef = ref()
const queryFormRef2 = ref()

// 路由相关
const route = useRoute()

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
    
    if (queryParams.timeRange && queryParams.timeRange.length === 2) {
      const startTime = new Date(queryParams.timeRange[0]).getTime()
      const endTime = new Date(queryParams.timeRange[1]).getTime()
      
      filteredData = filteredData.filter(item => {
        const callbackTime = new Date(item.callbackTime).getTime()
        return callbackTime >= startTime && callbackTime <= endTime
      })
    }
    
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
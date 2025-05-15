<template>
  <div class="page-container">
    <div class="callback-record-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">回调ID：</span>
            <el-input v-model="queryParams.id" placeholder="输入关键词" clearable style="width: 220px" />
          </div>
          
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
            <span class="search-label">客户ID：</span>
            <el-input v-model="queryParams.customerId" placeholder="请输入客户ID" clearable style="width: 168px" />
          </div>
          
          <div class="search-item">
            <span class="search-label">客户名称：</span>
            <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable style="width: 168px" />
          </div>
          
          <div class="search-item">
            <span class="search-label">回调时间：</span>
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
          
          <div class="search-item">
            <span class="search-label">回调状态：</span>
            <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 168px">
              <el-option 
                v-for="item in callbackStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
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
        v-if="recordList.length > 0 || !loading"
        v-loading="loading"
        :data="recordList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="回调ID" min-width="100" />
        <el-table-column prop="hash" label="Hash" min-width="100" />
        <el-table-column prop="monitorAddress" label="监听地址" min-width="180" />
        <el-table-column prop="targetAddress" label="对象地址" min-width="180" />
        <el-table-column prop="type" label="类型" min-width="80" />
        <el-table-column prop="chain" label="公链" min-width="80" />
        <el-table-column prop="tokenName" label="币种" min-width="100" />
        <el-table-column prop="amount" label="转账数量" min-width="100">
          <template #default="{ row }">
            <span :class="row.amount.startsWith('+') ? 'amount-positive' : 'amount-negative'">{{ row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customer" label="客户" min-width="100" />
        <el-table-column prop="callbackTime" label="回调时间" min-width="160" />
        <el-table-column prop="status" label="回调状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" link :icon="refreshRightIcon" @click="handleDetail(row)">手动回调</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CallbackRecord, CallbackRecordQueryParams } from '@/types/monitor'
import { chainOptions, transactionTypeOptions, callbackStatusOptions } from '@/constants/options'
import { useRoute } from 'vue-router'
import { appState } from '@/constants/appState'
import { RefreshRight } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive<CallbackRecordQueryParams>({
  id: '',
  hash: '',
  monitorAddress: '',
  targetAddress: '',
  type: '',
  chain: '',
  tokenName: '',
  customerId: '',
  customerName: '',
  status: '',
  pageNum: 1,
  pageSize: 10
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

// 路由相关
const route = useRoute()

// 图标
const refreshRightIcon = RefreshRight

// 获取回调记录列表
const getList = () => {
  loading.value = true
  recordList.value = [] // 确保在开始加载前清空数据
  total.value = 0 // 重置总数
  
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.callbackData]
    
    // 应用过滤
    if (queryParams.id) {
      filteredData = filteredData.filter(item => item.id.includes(queryParams.id as string))
    }
    
    if (queryParams.hash) {
      filteredData = filteredData.filter(item => item.hash.includes(queryParams.hash as string))
    }
    
    if (queryParams.type) {
      filteredData = filteredData.filter(item => item.type === queryParams.type)
    }
    
    if (queryParams.chain) {
      filteredData = filteredData.filter(item => item.chain === queryParams.chain)
    }
    
    if (queryParams.tokenName) {
      filteredData = filteredData.filter(item => 
        item.tokenName && item.tokenName.includes(queryParams.tokenName as string))
    }
    
    if (queryParams.customerId || queryParams.customerName) {
      filteredData = filteredData.filter(item => 
        (item.customer && item.customer.includes(queryParams.customerId as string)) ||
        (item.customer && item.customer.includes(queryParams.customerName as string)))
    }
    
    if (queryParams.status) {
      filteredData = filteredData.filter(item => item.status === queryParams.status)
    }
    
    recordList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取回调记录列表失败', error)
    ElMessage.error('获取回调记录列表失败')
  } finally {
    loading.value = false
  }
}

// 监听路由变化，确保每次进入页面时数据都会重新加载
watch(() => route.fullPath, () => {
  getList()
}, { immediate: true })

// 查询按钮点击事件
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置搜索
const handleReset = () => {
  queryParams.id = ''
  queryParams.hash = ''
  queryParams.monitorAddress = ''
  queryParams.targetAddress = ''
  queryParams.type = ''
  queryParams.chain = ''
  queryParams.tokenName = ''
  queryParams.customerId = ''
  queryParams.customerName = ''
  queryParams.status = ''
  dateRange.value = []
  queryParams.pageNum = 1
  getList()
}

// 导出按钮点击事件
const handleExport = () => {
  ElMessage.success('导出功能正在开发中...')
}

// 手动回调点击事件
const handleDetail = (row: CallbackRecord) => {
  ElMessageBox.confirm(`是否将该条交易记录再次推送给客户Id (客户名称)?`, '系统提示', {
    confirmButtonText: '再次推送',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('操作成功!')
  }).catch(() => {
    // 取消操作
  })
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
  getList()
})
</script>

<style scoped>
.callback-record-container {
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

.amount-positive {
  color: #F56C6C;
  font-weight: bold;
}

.amount-negative {
  color: #67C23A;
  font-weight: bold;
}
</style> 
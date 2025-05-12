<template>
  <div class="page-container">
    <div class="trigger-record-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">监听地址：</span>
            <el-input v-model="queryParams.monitorAddress" placeholder="输入关键词" clearable style="width: 220px" />
          </div>
          
          <div class="search-item">
            <span class="search-label">客户：</span>
            <el-input v-model="queryParams.customer" placeholder="输入客户ID/名称" clearable style="width: 220px" />
          </div>
          
          <div class="search-item">
            <span class="search-label">触发动作：</span>
            <el-select v-model="queryParams.triggerAction" placeholder="全部" clearable style="width: 168px">
              <el-option 
                v-for="item in triggerActionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">动作状态：</span>
            <el-select v-model="queryParams.actionStatus" placeholder="全部" clearable style="width: 168px">
              <el-option 
                v-for="item in actionStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <!-- 新增二次列表筛选 -->
          <div class="search-item">
            <span class="search-label">二次列表：</span>
            <el-select v-model="queryParams.isSecondaryList" placeholder="全部" clearable style="width: 120px">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">触发时间：</span>
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
        v-if="recordList.length > 0 || !loading"
        v-loading="loading"
        :data="recordList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="记录ID" min-width="80" />
        <el-table-column prop="triggerTime" label="触发时间" min-width="160" />
        <el-table-column prop="monitorAddress" label="监听地址" min-width="180" />
        <el-table-column prop="customer" label="客户" min-width="120" />
        <el-table-column prop="hash" label="交易哈希" min-width="180">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewTransaction(row)">{{ row.hash.slice(0, 10) }}...{{ row.hash.slice(-8) }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="交易金额" min-width="120" />
        <el-table-column label="触发条件描述" min-width="200">
          <template #default="{ row }">
            <span v-if="row.isSecondaryList">二次列表自动触发</span>
            <span v-else>{{ row.triggerDesc }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="triggerAction" label="触发动作" min-width="100" />
        
        <!-- 新增二次列表列 -->
        <el-table-column label="二次列表" min-width="120">
          <template #default="{ row }">
            <el-tag v-if="row.isSecondaryList" type="success">是</el-tag>
            <el-tag v-else type="info">否</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="actionStatus" label="动作状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.actionStatus)">{{ row.actionStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="180" align="left" class-name="operation-column">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button 
                v-if="row.actionStatus === '提交失败'" 
                type="primary" 
                link 
                :icon="Warning"
                @click="showFailReason(row)"
              >
                查看原因
              </el-button>
              <el-button type="primary" link :icon="View" @click="viewActionRecords(row)">查看动作执行</el-button>
            </div>
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
import type { TriggerRecord, TriggerRecordQueryParams } from '@/types/monitor'
import { triggerActionOptions, actionStatusOptions } from '@/constants/options'
import { useRoute, useRouter } from 'vue-router'
import { appState } from '@/constants/appState'
import { Warning, View } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive<TriggerRecordQueryParams>({
  monitorAddress: '',
  customer: '',
  triggerAction: '',
  actionStatus: '',
  isSecondaryList: undefined,
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
const recordList = ref<TriggerRecord[]>([])
// 总条数
const total = ref(0)

// 路由相关
const route = useRoute()
const router = useRouter()

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '提交成功':
      return 'success'
    case '提交失败':
      return 'danger'
    case '未提交':
      return 'info'
    default:
      return ''
  }
}

// 获取异常触发记录列表
const getList = () => {
  loading.value = true
  recordList.value = [] // 确保在开始加载前清空数据
  total.value = 0 // 重置总数
  
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.triggerData]
    
    // 检查是否有ID查询参数
    const queryId = route.query.id
    if (queryId) {
      filteredData = filteredData.filter(item => item.id === queryId)
    } else {
      // 如果没有ID查询参数，则应用其他过滤条件
      if (queryParams.monitorAddress) {
        filteredData = filteredData.filter(item => 
          item.monitorAddress.includes(queryParams.monitorAddress as string))
      }
      
      if (queryParams.customer) {
        filteredData = filteredData.filter(item => 
          item.customer.includes(queryParams.customer as string))
      }
      
      if (queryParams.triggerAction) {
        filteredData = filteredData.filter(item => item.triggerAction === queryParams.triggerAction)
      }
      
      if (queryParams.actionStatus) {
        filteredData = filteredData.filter(item => item.actionStatus === queryParams.actionStatus)
      }
      
      if (queryParams.isSecondaryList) {
        filteredData = filteredData.filter(item => item.isSecondaryList === queryParams.isSecondaryList)
      }
      
      // 时间范围过滤
      if (queryParams.timeRange && queryParams.timeRange.length === 2) {
        const startDate = new Date(queryParams.timeRange[0]).getTime()
        const endDate = new Date(queryParams.timeRange[1]).getTime()
        filteredData = filteredData.filter(item => {
          const itemTime = new Date(item.triggerTime).getTime()
          return itemTime >= startDate && itemTime <= endDate
        })
      }
    }
    
    recordList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取异常触发记录列表失败', error)
    ElMessage.error('获取异常触发记录列表失败')
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

// 重置按钮点击事件
const handleReset = () => {
  dateRange.value = []
  Object.keys(queryParams).forEach(key => {
    if (key !== 'pageNum' && key !== 'pageSize') {
      (queryParams as any)[key] = ''
    }
  })
  queryParams.pageNum = 1
  getList()
}

// 导出按钮点击事件
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 每页条数变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val
  getList()
}

// 查看交易详情
const viewTransaction = (row: TriggerRecord) => {
  // 跳转到监听记录页面，传递交易哈希作为查询参数
  router.push({
    path: '/monitor/monitor-record',
    query: { hash: row.hash }
  })
}

// 查看失败原因
const showFailReason = (row: TriggerRecord) => {
  if (row.failReason) {
    ElMessageBox.alert(row.failReason, '失败原因', {
      confirmButtonText: '确定'
    })
  } else {
    ElMessage.info('没有详细的失败原因')
  }
}

// 查看动作执行记录
const viewActionRecords = (row: TriggerRecord) => {
  // 跳转到动作执行记录页面，传递关联的触发记录ID作为查询参数
  router.push({
    path: '/monitor/action-record',
    query: { triggerId: row.id }
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.card-container {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.search-item {
  display: flex;
  align-items: center;
}

.search-label {
  white-space: nowrap;
  margin-right: 8px;
}

.search-buttons {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

:deep(.operation-column) {
  padding-left: 8px !important;
}

:deep(.operation-column .el-button) {
  margin-left: 0 !important;
  padding-left: 0 !important;
}
</style> 
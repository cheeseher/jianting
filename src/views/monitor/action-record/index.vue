<template>
  <div class="page-container">
    <div class="action-record-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">监听地址：</span>
            <el-input v-model="queryParams.monitorAddress" placeholder="输入关键词" clearable style="width: 220px" />
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
            <span class="search-label">动作类型：</span>
            <el-select v-model="queryParams.actionType" placeholder="全部" clearable style="width: 168px">
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
                v-for="item in actionExecuteStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <!-- 新增触发来源筛选 -->
          <div class="search-item">
            <span class="search-label">触发来源：</span>
            <el-select v-model="queryParams.triggerSource" placeholder="全部" clearable style="width: 168px">
              <el-option label="二次列表" value="二次列表" />
              <el-option label="监控条件命中" value="监控条件命中" />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">执行时间：</span>
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
        <el-table-column prop="executeTime" label="执行时间" min-width="160" />
        <el-table-column prop="monitorAddress" label="监听地址" min-width="180" />
        <el-table-column prop="customer" label="客户" min-width="120">
          <template #default="{ row }">
            <div class="customer-cell">
              <div>
                {{ formatCustomerInfo(row.customer, 2) }}
                <span v-if="getCustomerCount(row.customer) > 2" class="view-all" @click.stop="(e) => showCustomerDetails(row, e)">
                  全部
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="relatedTriggerId" label="关联异常记录" min-width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="viewTriggerRecord(row)">{{ row.relatedTriggerId }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="actionType" label="动作类型" min-width="100" />
        
        <!-- 新增触发来源列 -->
        <el-table-column label="触发来源" min-width="120">
          <template #default="{ row }">
            <el-tag 
              :type="row.triggerSource === '二次列表' ? 'success' : 'info'"
            >
              {{ row.triggerSource || '监控条件命中' }}
            </el-tag>
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
              <el-button type="primary" link :icon="Document" @click="handleDetail(row)">查看详情</el-button>
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
      
      <!-- 客户详情弹窗 -->
      <el-dialog
        v-model="customerDetailsVisible"
        :title="`客户列表`"
        width="500px"
      >
        <div v-if="currentRecord">
          <el-table
            :data="customerList"
            border
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column label="客户ID" min-width="120">
              <template #default="{ row }">
                {{ row.id }}
              </template>
            </el-table-column>
            <el-table-column label="客户名称" min-width="180">
              <template #default="{ row }">
                {{ row.name }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ActionRecord, ActionRecordQueryParams } from '@/types/monitor'
import { triggerActionOptions, actionExecuteStatusOptions } from '@/constants/options'
import { useRoute, useRouter } from 'vue-router'
import { appState } from '@/constants/appState'
import { Document } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive<ActionRecordQueryParams>({
  monitorAddress: '',
  customerId: '',
  customerName: '',
  actionType: '',
  actionStatus: '',
  triggerSource: '',
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
const recordList = ref<ActionRecord[]>([])
// 总条数
const total = ref(0)

// 路由相关
const route = useRoute()
const router = useRouter()

// 客户详情弹窗相关
const customerDetailsVisible = ref(false)
const currentRecord = ref<any>(null)
const customerList = ref<any[]>([])

// 初始化时检查是否有传入的triggerId查询参数
onMounted(() => {
  const triggerId = route.query.triggerId
  if (triggerId) {
    // 如果有，则将关联的触发记录ID添加到查询参数中
    getListByTriggerId(triggerId as string)
  }
})

// 获取状态标签类型
const getStatusType = (status: string) => {
  switch (status) {
    case '完成':
      return 'success'
    case '处理中':
      return 'warning'
    case '失败':
      return 'danger'
    case '提交成功':
      return 'info'
    default:
      return ''
  }
}

// 根据关联的触发记录ID获取动作执行记录
const getListByTriggerId = (triggerId: string) => {
  loading.value = true
  recordList.value = []
  total.value = 0
  
  try {
    const filteredData = appState.actionData.filter(item => item.relatedTriggerId === triggerId)
    recordList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取动作执行记录失败', error)
    ElMessage.error('获取动作执行记录失败')
  } finally {
    loading.value = false
  }
}

// 获取动作执行记录列表
const getList = () => {
  loading.value = true
  recordList.value = [] // 确保在开始加载前清空数据
  total.value = 0 // 重置总数
  
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.actionData]
    
    // 应用过滤
    if (queryParams.monitorAddress) {
      filteredData = filteredData.filter(item => 
        item.monitorAddress.includes(queryParams.monitorAddress as string))
    }
    
    if (queryParams.customerId || queryParams.customerName) {
      filteredData = filteredData.filter(item => 
        (item.customer && item.customer.includes(queryParams.customerId as string)) ||
        (item.customer && item.customer.includes(queryParams.customerName as string)))
    }
    
    if (queryParams.actionType) {
      filteredData = filteredData.filter(item => item.actionType === queryParams.actionType)
    }
    
    if (queryParams.actionStatus) {
      filteredData = filteredData.filter(item => item.actionStatus === queryParams.actionStatus)
    }
    
    // 添加按触发来源过滤
    if (queryParams.triggerSource) {
      filteredData = filteredData.filter(item => item.triggerSource === queryParams.triggerSource)
    }
    
    // 时间范围过滤
    if (queryParams.timeRange && queryParams.timeRange.length === 2) {
      const startDate = new Date(queryParams.timeRange[0]).getTime()
      const endDate = new Date(queryParams.timeRange[1]).getTime()
      filteredData = filteredData.filter(item => {
        const itemTime = new Date(item.executeTime).getTime()
        return itemTime >= startDate && itemTime <= endDate
      })
    }
    
    recordList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取动作执行记录列表失败', error)
    ElMessage.error('获取动作执行记录列表失败')
  } finally {
    loading.value = false
  }
}

// 监听路由变化，确保每次进入页面时数据都会重新加载
watch(() => route.fullPath, () => {
  const triggerId = route.query.triggerId
  if (triggerId) {
    getListByTriggerId(triggerId as string)
  } else {
    getList()
  }
}, { immediate: true })

// 查询按钮点击事件
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置按钮点击事件
const handleReset = () => {
  queryParams.monitorAddress = ''
  queryParams.customerId = ''
  queryParams.customerName = ''
  queryParams.actionType = ''
  queryParams.actionStatus = ''
  queryParams.triggerSource = ''
  dateRange.value = []
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

// 查看关联的异常触发记录
const viewTriggerRecord = (row: ActionRecord) => {
  router.push({
    path: '/monitor/trigger-record',
    query: { id: row.relatedTriggerId }
  })
}

// 查看详情
const handleDetail = (row: ActionRecord) => {
  ElMessageBox.alert(
    `
    <p><strong>执行时间：</strong>${row.executeTime}</p>
    <p><strong>监听地址：</strong>${row.monitorAddress}</p>
    <p><strong>客户：</strong>${row.customer}</p>
    <p><strong>关联异常记录ID：</strong>${row.relatedTriggerId}</p>
    <p><strong>动作类型：</strong>${row.actionType}</p>
    <p><strong>动作状态：</strong>${row.actionStatus}</p>
    <p><strong>触发来源：</strong>${row.triggerSource || '监控条件命中'}</p>
    ${row.failReason ? `<p><strong>失败原因：</strong>${row.failReason}</p>` : ''}
    `,
    '动作执行详情',
    {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    }
  )
}

// 格式化客户信息，只显示最多maxCount个客户
const formatCustomerInfo = (customerInfo: string | undefined, maxCount: number): string => {
  if (!customerInfo) return '-'
  
  const customers = customerInfo.split(',')
  if (customers.length <= maxCount) return customerInfo
  
  return customers.slice(0, maxCount).join(',')
}

// 获取客户数量
const getCustomerCount = (customerInfo: string | undefined): number => {
  if (!customerInfo) return 0
  return customerInfo.split(',').length
}

// 显示客户详情
const showCustomerDetails = (row: any, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  
  currentRecord.value = row
  
  // 解析客户字符串，格式如："张三 (100001),李四 (100002),王五 (100003)"
  const customerStr = row.customer || ''
  const customers = customerStr.split(',').map((item: string) => {
    const matches = item.match(/(.+)\s*\((.+)\)/)
    if (matches && matches.length >= 3) {
      return {
        name: matches[1].trim(),
        id: matches[2].trim()
      }
    }
    return { name: item.trim(), id: '' }
  })
  
  customerList.value = customers
  customerDetailsVisible.value = true
}
</script>

<style scoped>
.action-record-container {
  padding: 20px;
}

.customer-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.customer-cell > div {
  white-space: pre-line;
}

.view-all {
  color: #409EFF;
  cursor: pointer;
  margin-left: 5px;
  font-weight: 500;
}

.view-all:hover {
  color: #66b1ff;
  text-decoration: underline;
}
</style>
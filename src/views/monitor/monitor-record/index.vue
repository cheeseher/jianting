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
        <el-table-column label="对象地址" min-width="180">
          <template #default="{ row }">
            <!-- BTC UTXO模型的特殊处理 -->
            <template v-if="row.chain === 'BTC'">
              <div class="address-with-details">
                <el-button type="primary" link size="small" @click="showBtcDetails(row)">详情</el-button>
              </div>
            </template>
            <!-- 其他币种的常规处理 -->
            <template v-else>
              <el-tooltip :content="row.targetAddress" placement="top">
                <span class="ellipsis-text">{{ row.targetAddress }}</span>
              </el-tooltip>
            </template>
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
      
      <!-- BTC交易详情弹窗 -->
      <el-dialog
        v-model="btcDetailsVisible"
        :title="`交易详情`"
        width="500px"
        class="btc-details-dialog"
      >
        <div v-if="currentBtcRecord" class="btc-dialog-simplified">
          <!-- 转出交易 -->
          <template v-if="currentBtcRecord.type === '转出'">
            <div class="tx-type-badge">{{ currentBtcRecord.type }}</div>
            
            <div class="tx-amount-card">
              <div class="tx-amount-value">{{ currentBtcRecord.netAmount }}</div>
              <div class="tx-amount-label">净转出金额</div>
            </div>
            
            <div class="tx-addresses">
              <div class="tx-addr-section">
                <div class="tx-addr-title">
                  <span>发送地址</span>
                </div>
                <div class="tx-addr-content single-addr">
                  <div class="addr-row">
                    <div class="addr-text">{{ currentBtcRecord.fromAddresses?.[0] }}</div>
                    <div class="addr-amount">{{ currentBtcRecord.fromAmounts?.[0] }}</div>
                  </div>
                </div>
              </div>
              
              <div class="tx-addr-section">
                <div class="tx-addr-title">
                  <span>接收地址</span>
                </div>
                <div class="tx-addr-content">
                  <div v-for="(addr, index) in currentBtcRecord.toAddresses" :key="'to-'+index" class="addr-row">
                    <div class="addr-text">{{ addr }}</div>
                    <div class="addr-amount">{{ currentBtcRecord.toAmounts?.[index] }}</div>
                  </div>
                </div>
              </div>
              
              <div v-if="currentBtcRecord.changeAddress" class="tx-addr-section">
                <div class="tx-addr-title">
                  <span>找零地址</span>
                </div>
                <div class="tx-addr-content single-addr">
                  <div class="addr-row">
                    <div class="addr-text">{{ currentBtcRecord.changeAddress }}</div>
                    <div class="addr-amount">{{ currentBtcRecord.changeAmount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <!-- 转入交易 -->
          <template v-else-if="currentBtcRecord.type === '转入' && currentBtcRecord.utxoData">
            <div class="tx-type-badge receive">{{ currentBtcRecord.type }}</div>
            
            <div class="tx-amount-card receive">
              <div class="tx-amount-value">{{ currentBtcRecord.utxoData.receivedAmount }}</div>
              <div class="tx-amount-label">收到金额</div>
            </div>
            
            <div class="tx-addresses">
              <div class="tx-addr-section">
                <div class="tx-addr-title">
                  <span>来源地址</span>
                </div>
                <div class="tx-addr-content">
                  <div v-for="(addr, index) in currentBtcRecord.utxoData.fromAddresses" :key="'from-'+index" class="addr-row">
                    <div class="addr-text">{{ addr }}</div>
                    <div class="addr-amount">{{ currentBtcRecord.utxoData.fromAmounts?.[index] }}</div>
                  </div>
                </div>
              </div>
              
              <div class="tx-addr-section">
                <div class="tx-addr-title">
                  <span>接收地址</span>
                </div>
                <div class="tx-addr-content single-addr">
                  <div class="addr-row">
                    <div class="addr-text">{{ currentBtcRecord.monitorAddress || currentBtcRecord.utxoData.toAddresses?.[0] }}</div>
                    <div class="addr-amount">{{ currentBtcRecord.utxoData.receivedAmount }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </el-dialog>
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
import { ZoomIn } from '@element-plus/icons-vue'

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

// 客户详情弹窗相关
const customerDetailsVisible = ref(false)
const currentRecord = ref<any>(null)
const customerList = ref<any[]>([])

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

// BTC交易详情弹窗相关
const btcDetailsVisible = ref(false)
const currentBtcRecord = ref<any>(null)

// 显示BTC交易详情
const showBtcDetails = (row: any) => {
  currentBtcRecord.value = row
  btcDetailsVisible.value = true
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

.customer-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.customer-cell > div {
  white-space: pre-line;
}

/* UTXO模型相关样式 */
.btc-address {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.address-label {
  margin-right: 8px;
  color: #909399;
  font-size: 13px;
}

.address-count {
  margin-left: 5px;
  background-color: #409EFF;
  color: white;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 12px;
}

.utxo-detail-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EBEEF5;
  color: #303133;
}

.utxo-detail {
  font-size: 13px;
}

.utxo-from, .utxo-to, .utxo-change {
  margin-bottom: 12px;
}

.utxo-label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
}

.utxo-addr {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px dashed #EBEEF5;
}

.utxo-amount {
  color: #409EFF;
  font-weight: bold;
}

.utxo-net {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #EBEEF5;
}

.utxo-amount-large {
  font-size: 16px;
  font-weight: bold;
  color: #F56C6C;
  margin-top: 5px;
}

.clickable {
  cursor: pointer;
  transition: all 0.3s;
}

.clickable:hover {
  color: #409EFF;
}

.view-details-icon {
  margin-left: 5px;
  color: #409EFF;
  font-size: 14px;
}

.address-count-from {
  background-color: #67C23A;
}

.btc-dialog-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #EBEEF5;
}

.btc-dialog-item {
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
}

.btc-dialog-label {
  min-width: 80px;
  color: #606266;
  font-weight: bold;
}

.btc-dialog-value {
  word-break: break-all;
  color: #303133;
}

.btc-dialog-content {
  margin-bottom: 20px;
}

.btc-dialog-footer {
  margin-top: 20px;
  text-align: right;
}

.address-with-details {
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-with-details .el-button {
  margin-left: 8px;
  padding: 2px 5px;
}

/* 新的简化弹窗样式 */
.btc-dialog-simplified {
  padding: 15px;
}

/* 交易类型标签 */
.tx-type-badge {
  display: inline-block;
  background-color: #f56c6c;
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 15px;
}

.tx-type-badge.receive {
  background-color: #67c23a;
}

/* 金额卡片 */
.tx-amount-card {
  background-color: #fef0f0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  text-align: center;
}

.tx-amount-card.receive {
  background-color: #f0f9eb;
}

.tx-amount-value {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
  margin-bottom: 5px;
}

.tx-amount-card.receive .tx-amount-value {
  color: #67c23a;
}

.tx-amount-label {
  font-size: 14px;
  color: #606266;
}

/* 地址部分 */
.tx-addresses {
  background-color: white;
  border-radius: 8px;
}

.tx-addr-section {
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
}

.tx-addr-section:last-child {
  margin-bottom: 0;
  border-bottom: none;
}

.tx-addr-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.tx-addr-icon {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
}

.from-icon {
  background-color: #ecf5ff;
}

.from-icon:after {
  content: '';
  position: absolute;
  top: 6px;
  left: 5px;
  width: 8px;
  height: 6px;
  border-left: 2px solid #409eff;
  border-bottom: 2px solid #409eff;
  transform: rotate(45deg);
}

.to-icon {
  background-color: #f0f9eb;
}

.to-icon:after {
  content: '';
  position: absolute;
  top: 6px;
  left: 5px;
  width: 8px;
  height: 6px;
  border-right: 2px solid #67c23a;
  border-top: 2px solid #67c23a;
  transform: rotate(45deg);
}

.change-icon {
  background-color: #fdf6ec;
}

.change-icon:after {
  content: '↻';
  position: absolute;
  color: #e6a23c;
  font-size: 12px;
  top: -2px;
  left: 5px;
}

.tx-addr-content {
  font-family: monospace;
  font-size: 13px;
  color: #606266;
  word-break: break-all;
}

.single-addr {
  padding: 5px 0;
}

.addr-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  border-bottom: 1px dashed #ebeef5;
}

.addr-row:last-child {
  border-bottom: none;
}

.addr-text {
  word-break: break-all;
  max-width: 70%;
}

.addr-amount {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}
</style> 
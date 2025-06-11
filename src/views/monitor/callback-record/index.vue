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
              <span class="ellipsis-text">{{ row.targetAddress }}</span>
            </template>
          </template>
        </el-table-column>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CallbackRecord, CallbackRecordQueryParams } from '@/types/monitor'
import { chainOptions, transactionTypeOptions, callbackStatusOptions } from '@/constants/options'
import { useRoute } from 'vue-router'
import { appState } from '@/constants/appState'
import { RefreshRight, ZoomIn } from '@element-plus/icons-vue'

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

.ellipsis-text {
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  vertical-align: middle;
}

/* UTXO模型相关样式 */
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
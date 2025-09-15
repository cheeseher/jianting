<template>
  <div class="page-container">
    <el-card shadow="never" class="card-container">
      <div class="search-container">
        <div class="search-item">
          <el-select v-model="searchForm.region" placeholder="全部代币" clearable style="width: 120px">
            <el-option label="全部代币" value="" />
            <el-option label="BTC" value="btc" />
            <el-option label="ETH" value="eth" />
            <el-option label="USDT" value="usdt" />
          </el-select>
        </div>
        <div class="search-item">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            placeholder="创建开始日期"
            style="width: 140px"
            clearable
          />
        </div>
        <div class="search-item">
          <el-date-picker
            v-model="searchForm.endDate"
            type="date"
            placeholder="创建结束日期"
            style="width: 140px"
            clearable
          />
        </div>
        <div class="search-buttons">
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
      
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAddConfig">
            新增配置
          </el-button>
        </div>
        <div class="right">
          <el-button @click="handleRefresh" :loading="tableLoading">刷新</el-button>
        </div>
      </div>
      
      <el-table 
        :data="tableData" 
        border 
        stripe 
        style="margin-bottom: 16px" 
        v-loading="tableLoading"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="index" label="序号" width="70" align="center" />
        <el-table-column prop="coinName" label="币种名称" width="120" />
        <el-table-column prop="withdrawAmount" label="组出金额" width="150" />
        <el-table-column prop="syncAddress" label="同步地址" width="200" show-overflow-tooltip />
        <el-table-column prop="remark" label="备注" width="150" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    
    <!-- 新增配置弹窗 -->
    <el-dialog v-model="configDialogVisible" title="新增配置" width="500px">
      <el-form :model="configForm" :rules="configRules" ref="configFormRef" label-width="100px">
        <el-form-item label="币种" prop="coinType">
          <el-select v-model="configForm.coinType" placeholder="请选择要监控的币种" style="width: 100%">
            <el-option label="BTC" value="btc" />
            <el-option label="ETH" value="eth" />
            <el-option label="USDT" value="usdt" />
            <el-option label="BNB" value="bnb" />
          </el-select>
        </el-form-item>
        <el-form-item label="超出金额" prop="exceedAmount">
          <el-input-number
            v-model="configForm.exceedAmount"
            :min="0"
            :precision="8"
            :step="0.00000001"
            placeholder="0.00000000"
            style="width: 100%"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="同步地址" prop="syncAddress">
          <el-input v-model="configForm.syncAddress" placeholder="请输入同步地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="configForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="configDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmConfig">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  region: '',
  startDate: '',
  endDate: ''
})

// 表格数据
const tableData = ref<any[]>([])
const tableLoading = ref(false)
const selectedRows = ref<any[]>([])

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 弹窗相关
const detailsDialogVisible = ref(false)
const logDialogVisible = ref(false)
const configDialogVisible = ref(false)
const currentCustomer = ref<any>(null)
const customerAddressList = ref<any[]>([])
const syncLogList = ref<any[]>([])

// 新增配置表单
const configForm = reactive({
  coinType: '',
  exceedAmount: 0,
  syncAddress: '',
  remark: ''
})

// 表单验证规则
const configRules = {
  coinType: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  exceedAmount: [
    { required: true, message: '请输入超出金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额不能小于0', trigger: 'blur' }
  ],
  syncAddress: [
    { required: true, message: '请输入同步地址', trigger: 'blur' }
  ]
}

const configFormRef = ref<any>(null)

// 模拟数据
const mockData: any[] = []

// 获取同步状态类型
const getSyncStatusType = (status: string) => {
  switch (status) {
    case 'synced':
      return 'success'
    case 'failed':
      return 'danger'
    case 'unsynced':
      return 'warning'
    default:
      return 'info'
  }
}

// 获取同步状态文本
const getSyncStatusText = (status: string) => {
  switch (status) {
    case 'synced':
      return '已同步'
    case 'failed':
      return '同步失败'
    case 'unsynced':
      return '未同步'
    default:
      return '未知'
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchForm.region = ''
  searchForm.startDate = ''
  searchForm.endDate = ''
  pagination.pageNum = 1
  fetchData()
}

// 刷新
const handleRefresh = () => {
  fetchData()
}

// 获取数据
const fetchData = () => {
  tableLoading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    let filteredData = [...mockData]
    
    // 应用搜索过滤
    if (searchForm.region) {
      filteredData = filteredData.filter(item => 
        item.region && item.region.toLowerCase().includes(searchForm.region.toLowerCase())
      )
    }
    if (searchForm.startDate) {
      filteredData = filteredData.filter(item => 
        item.createDate && new Date(item.createDate) >= new Date(searchForm.startDate)
      )
    }
    if (searchForm.endDate) {
      filteredData = filteredData.filter(item => 
        item.createDate && new Date(item.createDate) <= new Date(searchForm.endDate)
      )
    }
    
    pagination.total = filteredData.length
    
    // 分页
    const start = (pagination.pageNum - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filteredData.slice(start, end)
    
    tableLoading.value = false
  }, 500)
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// 单个同步
const handleSync = async (row: any) => {
  row.syncing = true
  
  try {
    // 模拟同步操作
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    row.syncStatus = 'synced'
    row.lastSyncTime = new Date().toLocaleString()
    row.syncResult = `同步成功，共同步${row.monitorAddressCount}个地址`
    
    ElMessage.success('同步成功')
  } catch (error) {
    row.syncStatus = 'failed'
    row.syncResult = '同步失败：' + (error as Error).message
    ElMessage.error('同步失败')
  } finally {
    row.syncing = false
  }
}



// 新增配置
const handleAddConfig = () => {
  // 重置表单
  Object.assign(configForm, {
    coinType: '',
    exceedAmount: 0,
    syncAddress: '',
    remark: ''
  })
  configDialogVisible.value = true
}

// 确认配置
const handleConfirmConfig = async () => {
  if (!configFormRef.value) return
  
  try {
    await configFormRef.value.validate()
    
    // 模拟保存配置
    console.log('保存配置:', configForm)
    
    ElMessage.success('配置保存成功')
    configDialogVisible.value = false
    
    // 重置表单
    Object.assign(configForm, {
      coinType: '',
      exceedAmount: 0,
      syncAddress: '',
      remark: ''
    })
    
    // 刷新列表
    fetchData()
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 编辑
const handleEdit = (row: any) => {
  ElMessage.info('编辑功能待开发')
}

// 查看详情
const handleViewDetails = (row: any) => {
  currentCustomer.value = row
  
  // 模拟获取客户地址列表
  customerAddressList.value = [
    { chain: 'ETH', address: '0x1234...abcd', syncStatus: 'synced' },
    { chain: 'BSC', address: '0x5678...efgh', syncStatus: 'synced' },
    { chain: 'BTC', address: 'bc1q...xyz', syncStatus: 'failed' }
  ]
  
  detailsDialogVisible.value = true
}

// 查看日志
const handleViewLog = (row: any) => {
  currentCustomer.value = row
  
  // 模拟获取同步日志
  syncLogList.value = [
    {
      time: '2024-01-15 14:30:00',
      operation: '同步',
      status: 'success',
      message: '成功同步5个监听地址'
    },
    {
      time: '2024-01-15 14:25:00',
      operation: '同步',
      status: 'failed',
      message: '网络连接超时，同步失败'
    },
    {
      time: '2024-01-15 14:20:00',
      operation: '同步',
      status: 'success',
      message: '成功同步3个监听地址'
    }
  ]
  
  logDialogVisible.value = true
}

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  pagination.pageNum = 1
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchData()
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container {
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
  margin-bottom: 16px;
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
  display: flex;
  gap: 8px;
}

.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar .left {
  display: flex;
  gap: 10px;
}

.table-toolbar .right {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.success-text {
  color: #67c23a;
}

.error-text {
  color: #f56c6c;
}

.info-text {
  color: #909399;
}

.customer-info h4,
.address-list h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.log-header {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-weight: 500;
}
</style>
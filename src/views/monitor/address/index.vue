<template>
  <div class="page-container">
    <div class="address-list-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">公链：</span>
            <el-select
              v-model="searchForm.chain"
              placeholder="全部"
              clearable
              class="filter-dropdown"
            >
              <el-option
                v-for="item in chainOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">地址：</span>
            <el-input
              v-model="searchForm.address"
              placeholder="输入关键词"
              clearable
              style="width: 220px"
            />
          </div>
          
          <div class="search-item">
            <span class="search-label">客户：</span>
            <el-input
              v-model="searchForm.customerId"
              placeholder="输入客户ID/名称"
              clearable
              style="width: 220px"
            />
          </div>
          
          <div class="search-item">
            <span class="search-label">时间：</span>
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :shortcuts="dateShortcuts"
              style="width: 380px"
            />
          </div>
          
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-card>
      
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAddAddress">添加地址</el-button>
          
          <!-- 批量操作下拉菜单 -->
          <el-dropdown :disabled="!selectedRows.length" @command="handleBatchCommand">
            <el-button :disabled="!selectedRows.length">
              批量操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="delete" :disabled="!selectedRows.length">批量删除</el-dropdown-item>
                <el-dropdown-item command="export" :disabled="!selectedRows.length">批量导出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <el-button @click="handleExport">导出全部</el-button>
        </div>
        <div class="right">
          <span class="selected-count" v-if="selectedRows.length">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <el-table
        v-if="tableData.length > 0 || !tableLoading"
        ref="tableRef"
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="地址" prop="address" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.address" placement="top">
              <span class="ellipsis-text">{{ row.address }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="公链" prop="chain" width="100" />
        <el-table-column label="主币余额" prop="mainBalance" width="100" />
        <el-table-column label="代币余额" min-width="180">
          <template #default="{ row }">
            <div @click="showTokenDetails(row)" class="token-balance-cell">
              <div style="white-space: pre-line">{{ row.tokenBalance }}</div>
              <el-icon><zoom-in /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="添加时间" prop="addTime" width="180" />
        <el-table-column label="更新时间" prop="updateTime" width="180" />
        <el-table-column label="客户" prop="customer" width="100" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除?" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
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
      
      <!-- 添加/编辑地址弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加地址' : '编辑地址'"
        width="550px"
        @closed="resetForm"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="地址" prop="address" required>
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
          
          <el-form-item label="公链" prop="chain" required>
            <el-select v-model="form.chain" placeholder="请选择公链" class="filter-dropdown">
              <el-option
                v-for="item in chainOptions.filter(item => item.value)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="客户ID" prop="customer">
            <el-input v-model="form.customer" placeholder="请输入客户ID" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </template>
      </el-dialog>
      
      <!-- 代币余额详情弹窗 -->
      <el-dialog
        v-model="tokenDetailsVisible"
        title="代币余额详情"
        width="500px"
      >
        <div v-if="currentAddress">
          <div class="token-details-header">
            <div><strong>地址：</strong> {{ currentAddress.address }}</div>
            <div><strong>公链：</strong> {{ currentAddress.chain }}</div>
          </div>
          
          <el-divider />
          
          <div class="token-details-content">
            <div class="token-details-item" v-for="(balance, token) in parsedTokenBalances" :key="token">
              <span class="token-name">{{ token }}:</span>
              <span class="token-value">{{ balance }}</span>
            </div>
            
            <div class="no-tokens" v-if="Object.keys(parsedTokenBalances).length === 0">
              暂无代币余额数据
            </div>
          </div>
        </div>
      </el-dialog>
      
      <!-- 地址详情说明 -->
      <div class="address-info-tips">
        <p><strong>地址：</strong> 监听地址</p>
        <p><strong>公链：</strong> 监听地址所属公链</p>
        <p><strong>主币余额：</strong> 该地址的主币余额（包含手续费）</p>
        <p><strong>代币余额：</strong> 该地址全部代币的剩余金额</p>
        <p><strong>添加时间：</strong> 监听地址的添加时间（日期）</p>
        <p><strong>更新时间：</strong> 每次监听到该地址变化时更新</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import type { MonitorAddress } from '@/types/monitor'
import { chainOptions } from '@/constants/options'
import { deleteAddress, batchDeleteAddress, addAddress } from '@/constants/mockApi'
import { ArrowDown, ZoomIn } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { appState } from '@/constants/appState'

// 搜索表单
const searchForm = reactive({
  chain: '',
  address: '',
  customerId: '',
  timeRange: [] as string[]
})

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 表格数据
const tableData = ref<MonitorAddress[]>([])
const tableLoading = ref(false)
const selectedRows = ref<MonitorAddress[]>([])

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 代币余额详情相关
const tokenDetailsVisible = ref(false)
const currentAddress = ref<MonitorAddress | null>(null)
const parsedTokenBalances = computed(() => {
  if (!currentAddress.value || !currentAddress.value.tokenBalance) return {}
  
  const result: Record<string, string> = {}
  const lines = currentAddress.value.tokenBalance.split('\n')
  
  lines.forEach(line => {
    const parts = line.split(':')
    if (parts.length === 2) {
      const token = parts[0].trim()
      const balance = parts[1].trim()
      result[token] = balance
    }
  })
  
  return result
})

// 表单数据
const form = reactive({
  id: '',
  address: '',
  chain: '',
  customer: '',
  addTime: '',
  updateTime: ''
})

// 表单校验规则
const rules = {
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' },
    { min: 10, message: '地址长度不能少于10个字符', trigger: 'blur' }
  ],
  chain: [
    { required: true, message: '请选择公链', trigger: 'change' }
  ]
}

// 路由相关
const route = useRoute()

// 获取地址列表
const fetchAddressList = () => {
  tableLoading.value = true
  
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.addressData]
    
    // 应用过滤器
    if (searchForm.chain) {
      filteredData = filteredData.filter(item => item.chain === searchForm.chain)
    }
    
    if (searchForm.address) {
      filteredData = filteredData.filter(item => item.address.includes(searchForm.address as string))
    }
    
    if (searchForm.customerId) {
      filteredData = filteredData.filter(item => item.customer === searchForm.customerId)
    }
    
    tableData.value = filteredData
    pagination.total = filteredData.length
  } catch (error) {
    console.error('获取数据失败', error)
    tableData.value = []
    pagination.total = 0
  } finally {
    tableLoading.value = false
  }
}

// 监听路由变化，确保每次进入页面时数据都会重新加载
watch(() => route.fullPath, () => {
  fetchAddressList()
}, { immediate: true })

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchAddressList()
}

// 重置搜索
const handleReset = () => {
  searchForm.chain = ''
  searchForm.address = ''
  searchForm.customerId = ''
  searchForm.timeRange = []
  pagination.pageNum = 1
  fetchAddressList()
}

// 分页事件处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchAddressList()
}

const handleCurrentChange = (current: number) => {
  pagination.pageNum = current
  fetchAddressList()
}

// 表格选择事件
const handleSelectionChange = (rows: MonitorAddress[]) => {
  selectedRows.value = rows
}

// 批量操作命令处理
const handleBatchCommand = (command: string) => {
  if (command === 'delete') {
    handleBatchDelete()
  } else if (command === 'export') {
    handleBatchExport()
  }
}

// 批量导出
const handleBatchExport = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessage.success(`已导出${selectedRows.value.length}条记录`)
}

// 添加地址
const handleAddAddress = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑地址
const handleEdit = (row: MonitorAddress) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除地址
const handleDelete = async (row: MonitorAddress) => {
  try {
    if (!row.id) return
    await deleteAddress(row.id)
    ElMessage.success('删除成功')
    fetchAddressList()
  } catch (error) {
    console.error('删除失败', error)
    ElMessage.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认批量删除选中的地址?', '提示', {
      type: 'warning'
    })
    
    const ids = selectedRows.value
      .filter(row => row.id)
      .map(row => row.id as string)
      
    if (ids.length === 0) return
    
    await batchDeleteAddress(ids)
    ElMessage.success('批量删除成功')
    fetchAddressList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 查看代币余额详情
const showTokenDetails = (row: MonitorAddress) => {
  currentAddress.value = row
  tokenDetailsVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
      const data: MonitorAddress = {
        ...form,
        mainBalance: '0',
        tokenBalance: '',
        addTime: form.addTime || now,
        updateTime: now
      }
      
      await addAddress(data)
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchAddressList()
    } catch (error) {
      console.error('操作失败', error)
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  form.id = ''
  form.address = ''
  form.chain = ''
  form.customer = ''
  form.addTime = ''
  form.updateTime = ''
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 初始化
onMounted(() => {
  fetchAddressList()
})
</script>

<style scoped>
.address-list-container {
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

.filter-dropdown {
  width: 120px;
}

.table-toolbar {
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar .left {
  display: flex;
  gap: 10px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.ellipsis-text {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.token-balance-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  cursor: pointer;
}

.token-balance-cell:hover {
  background-color: #f5f7fa;
}

.token-details-header {
  margin-bottom: 16px;
}

.token-details-content {
  max-height: 300px;
  overflow-y: auto;
}

.token-details-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.token-details-item:last-child {
  border-bottom: none;
}

.token-name {
  font-weight: 500;
  color: #303133;
}

.token-value {
  color: #606266;
}

.no-tokens {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.address-info-tips {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 4px;
  color: #606266;
}

.address-info-tips p {
  margin: 8px 0;
}
</style> 
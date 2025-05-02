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
        <el-table-column label="单笔触发金额" width="120">
          <template #default="{ row }">
            {{ row.triggerAmount || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="历史最大单笔金额百分比" width="180">
          <template #default="{ row }">
            {{ row.maxPercentage ? `${row.maxPercentage}%` : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="触发动作" width="150">
          <template #default="{ row }">
            {{ row.triggerAction ? formatTriggerAction(row.triggerAction) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="代币余额" min-width="180">
          <template #default="{ row }">
            <div class="token-balance-cell">
              <div>
                {{ formatTokenBalance(row.tokenBalance, 2) }}
                <span v-if="getTokenCount(row.tokenBalance) > 2" class="view-all" @click.stop="(e) => showTokenDetails(row, e)">
                  全部
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="添加时间" prop="addTime" width="180" />
        <el-table-column label="更新时间" prop="updateTime" width="180" />
        <el-table-column label="客户" width="100">
          <template #default="{ row }">
            <span 
              v-if="row.customers && row.customers.length > 0"
              class="customer-number"
              @click="showCustomerRelationDialog(row)"
            >
              {{ row.customers.length }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
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
        width="800px"
        @closed="resetForm"
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basicInfo">
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
              
              <el-form-item label="客户" prop="customers">
                <el-select
                  v-model="form.customers"
                  placeholder="请选择客户"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in customerOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          
          <el-tab-pane label="监控条件" name="monitorCondition" v-if="dialogType === 'edit'">
            <div class="monitor-condition-container">
              <el-form
                ref="conditionFormRef"
                :model="conditionForm"
                :rules="conditionRules"
                label-width="180px"
                label-position="left"
              >
                <el-form-item label="单笔触发金额" prop="triggerAmount">
                  <el-input-number
                    v-model="conditionForm.triggerAmount"
                    :min="0"
                    :precision="2"
                    style="width: 220px"
                  />
                </el-form-item>
                <el-form-item label="历史最大单笔金额百分比" prop="maxPercentage">
                  <el-input-number
                    v-model="conditionForm.maxPercentage"
                    :min="0"
                    :precision="0"
                    style="width: 220px"
                    placeholder="请输入，如110表示110%"
                  >
                    <template #suffix>%</template>
                  </el-input-number>
                </el-form-item>
                <el-form-item label="触发动作" prop="triggerAction">
                  <el-select v-model="conditionForm.triggerAction" style="width: 220px">
                    <el-option label="提交闪电转账" value="transfer" />
                    <el-option label="提交多签" value="multi-sign" />
                  </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                  <el-switch
                    v-model="conditionForm.status"
                    active-text="启用"
                    inactive-text="禁用"
                  />
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>
        </el-tabs>
        
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </template>
      </el-dialog>
      
      <!-- 代币余额详情弹窗 -->
      <el-dialog
        v-model="tokenDetailsVisible"
        :title="`[${tokenDetailAddress?.address || '监听地址'}]代币余额`"
        width="500px"
      >
        <div v-if="tokenDetailAddress">
          <div class="search-area">
            <div class="search-input">
              <span class="label">代币：</span>
              <el-input
                v-model="tokenSearchKeyword"
                placeholder="输入代币名称"
                style="width: 220px"
              />
            </div>
            <div class="search-buttons">
              <el-button type="primary" @click="searchTokens">搜索</el-button>
              <el-button @click="resetTokenSearch">重置</el-button>
            </div>
          </div>
          
          <el-table
            :data="filteredTokens"
            border
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column label="代币名称" prop="token" min-width="140" />
            <el-table-column label="余额" prop="balance" min-width="120" align="right" />
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="tokenPagination.pageNum"
              :page-size="tokenPagination.pageSize"
              layout="total, prev, pager, next"
              :total="tokenPagination.total"
              @current-change="handleTokenPageChange"
            />
          </div>
        </div>
      </el-dialog>
      
      <!-- 客户关联弹窗 -->
      <el-dialog
        v-model="customerRelationVisible"
        :title="`[${customerRelationAddress?.address || ''}]关联客户`"
        width="700px"
      >
        <div v-if="customerRelationAddress" class="customer-relation-dialog">
          <div class="search-area">
            <div class="search-input">
              <span class="label">客户：</span>
              <el-input
                v-model="customerSearchKeyword"
                placeholder="输入客户ID/名称"
                style="width: 220px"
              />
            </div>
            <div class="search-buttons">
              <el-button type="primary" @click="searchCustomerRelation">搜索</el-button>
              <el-button @click="resetCustomerSearch">重置</el-button>
            </div>
          </div>
          
          <el-table
            v-loading="customerRelationLoading"
            :data="customerCount"
            border
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column label="客户ID" prop="id" min-width="120" />
            <el-table-column label="客户名称" prop="name" min-width="180" />
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="danger" @click="removeCustomerRelation(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-if="customerCount.length > 0"
              v-model:current-page="customerPagination.pageNum"
              :page-size="customerPagination.pageSize"
              layout="total, prev, pager, next"
              :total="customerPagination.total"
              @current-change="handleCustomerPageChange"
            />
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import type { MonitorAddress } from '@/types/monitor'
import { chainOptions } from '@/constants/options'
import { deleteAddress, batchDeleteAddress, addAddress } from '@/constants/mockApi'
import { ArrowDown, ZoomIn } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
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

// 标签页状态
const activeTab = ref('basicInfo')

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 监控条件相关
const conditionFormRef = ref<FormInstance>()
const conditionForm = reactive({
  triggerAmount: 0,
  maxPercentage: 110,
  triggerAction: 'transfer' as 'transfer' | 'multi-sign',
  status: true
})
const conditionRules = reactive<FormRules>({
  triggerAmount: [
    { required: true, message: '请输入单笔触发金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '金额必须大于等于0', trigger: 'blur' }
  ],
  maxPercentage: [
    { required: true, message: '请输入历史最大单笔金额百分比', trigger: 'blur' },
    { type: 'number', min: 0, message: '百分比必须大于等于0', trigger: 'blur' }
  ],
  triggerAction: [
    { required: true, message: '请选择触发动作', trigger: 'change' }
  ]
})

// 代币余额详情相关
const tokenDetailsVisible = ref(false)
const tokenDetailAddress = ref<MonitorAddress | null>(null)
const tokenSearchKeyword = ref('')
const tokenPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 解析代币余额为数组格式
const tokenBalanceArray = computed(() => {
  if (!tokenDetailAddress.value || !tokenDetailAddress.value.tokenBalance) return []
  
  const result: { token: string, balance: string }[] = []
  const lines = tokenDetailAddress.value.tokenBalance.split('\n')
  
  lines.forEach(line => {
    const parts = line.split(':')
    if (parts.length === 2) {
      const token = parts[0].trim()
      const balance = parts[1].trim()
      result.push({ token, balance })
    }
  })
  
  return result
})

// 根据搜索关键词过滤代币
const filteredTokens = computed(() => {
  const keyword = tokenSearchKeyword.value.toLowerCase()
  let result = tokenBalanceArray.value
  
  if (keyword) {
    result = result.filter(item => 
      item.token.toLowerCase().includes(keyword)
    )
  }
  
  // 更新分页总数
  tokenPagination.total = result.length
  
  // 应用分页
  const start = (tokenPagination.pageNum - 1) * tokenPagination.pageSize
  const end = Math.min(start + tokenPagination.pageSize, result.length)
  return result.slice(start, end)
})

// 搜索代币
const searchTokens = () => {
  tokenPagination.pageNum = 1
}

// 重置代币搜索
const resetTokenSearch = () => {
  tokenSearchKeyword.value = ''
  tokenPagination.pageNum = 1
}

// 处理代币分页
const handleTokenPageChange = (page: number) => {
  tokenPagination.pageNum = page
}

// 表单数据
const form = reactive({
  id: '',
  address: '',
  chain: '',
  customers: [] as string[],
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
const router = useRouter()

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
      filteredData = filteredData.filter(item => {
        // 检查客户ID是否在customers数组中或等于customer字段
        return (
          (item.customers && item.customers.includes(searchForm.customerId)) || 
          item.customer === searchForm.customerId
        )
      })
    }
    
    // 为每个地址填充监控条件数据和客户数据
    filteredData = filteredData.map(item => {
      // 模拟每个地址的监控条件数据
      const monitorCondition = generateMockMonitorCondition(item.id || '')
      
      // 模拟每个地址的客户数据
      const customers = item.customers || (item.customer ? [item.customer] : generateRandomCustomers(item.id || ''))
      
      return {
        ...item,
        ...monitorCondition,
        customers
      }
    })
    
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

// 生成模拟监控条件数据
const generateMockMonitorCondition = (addressId: string) => {
  // 基于地址ID生成一些模拟属性
  const firstChar = addressId.charCodeAt(0) || 0
  const hasCondition = firstChar % 4 !== 3 // 25%的地址没有监控条件
  
  if (!hasCondition) {
    return {}
  }
  
  return {
    triggerAmount: 100 * ((firstChar % 5) + 1),
    maxPercentage: 110 + (firstChar % 5) * 10, // 保证每个地址都有百分比值
    triggerAction: firstChar % 3 === 0 ? 'transfer' : 'multi-sign' as 'transfer' | 'multi-sign',
    monitorStatus: true
  }
}

// 生成随机客户列表
const generateRandomCustomers = (addressId: string): string[] => {
  const firstChar = addressId.charCodeAt(0) || 0
  const customersCount = appState.customerData.length
  
  if (customersCount === 0) {
    return []
  }
  
  // 根据地址ID生成一致的随机客户数量（1-3个）
  const count = (firstChar % 3) + 1
  const result: string[] = []
  
  for (let i = 0; i < count; i++) {
    const index = (firstChar + i) % customersCount
    const customer = appState.customerData[index]
    if (customer && !result.includes(customer.id)) {
      result.push(customer.id)
    }
  }
  
  return result
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
  
  // 复制基本信息
  form.id = row.id || ''
  form.address = row.address
  form.chain = row.chain
  form.addTime = row.addTime
  form.updateTime = row.updateTime
  
  // 处理客户信息
  if (row.customers && row.customers.length > 0) {
    form.customers = [...row.customers]
  } else if (row.customer) {
    // 兼容旧数据
    form.customers = [row.customer]
  } else {
    form.customers = []
  }
  
  dialogVisible.value = true
  
  // 填充监控条件表单
  conditionForm.triggerAmount = row.triggerAmount || 0
  conditionForm.maxPercentage = row.maxPercentage || 110
  conditionForm.triggerAction = row.triggerAction || 'transfer'
  conditionForm.status = row.monitorStatus !== undefined ? row.monitorStatus : true
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
const showTokenDetails = (row: MonitorAddress, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  tokenDetailAddress.value = row
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
        id: form.id,
        address: form.address,
        chain: form.chain,
        customers: form.customers,
        mainBalance: '0',
        tokenBalance: '',
        addTime: form.addTime || now,
        updateTime: now,
        maxPercentage: 110 // 确保有默认值
      }
      
      // 如果是编辑模式且当前在监控条件标签页，保存监控条件
      if (dialogType.value === 'edit' && activeTab.value === 'monitorCondition') {
        if (conditionFormRef.value) {
          const validCondition = await conditionFormRef.value.validate()
            .then(() => true)
            .catch(() => false)
          
          if (validCondition) {
            // 将监控条件数据合并到地址数据中
            Object.assign(data, {
              triggerAmount: conditionForm.triggerAmount,
              maxPercentage: conditionForm.maxPercentage,
              triggerAction: conditionForm.triggerAction,
              monitorStatus: conditionForm.status
            })
          } else {
            submitLoading.value = false
            return
          }
        }
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
  form.customers = []
  form.addTime = ''
  form.updateTime = ''
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置监控条件表单
  conditionForm.triggerAmount = 0
  conditionForm.maxPercentage = 110
  conditionForm.triggerAction = 'transfer'
  conditionForm.status = true
  
  // 切换到基本信息标签
  activeTab.value = 'basicInfo'
}

// 格式化触发动作
const formatTriggerAction = (action: string) => {
  const actionMap: Record<string, string> = {
    'transfer': '提交闪电转账',
    'multi-sign': '提交多签'
  }
  return actionMap[action] || action
}

// 客户选项
const customerOptions = computed(() => {
  return appState.customerData.map(item => ({
    value: item.id,
    label: `(${item.id}) ${item.name}`
  }))
})

// 获取客户名称
const getCustomerName = (id: string) => {
  const customer = appState.customerData.find(item => item.id === id)
  return customer ? `(${customer.id}) ${customer.name}` : id
}

// 用于地址关联客户弹窗的数据
const customerRelationVisible = ref(false)
const customerRelationAddress = ref<MonitorAddress | null>(null)
const customerSearchKeyword = ref('')
const customerRelationLoading = ref(false)
const customerPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 过滤后的客户列表
const filteredCustomers = computed(() => {
  if (!customerRelationAddress.value || !customerRelationAddress.value.customers) return []
  
  // 获取客户详细信息
  const customers = customerRelationAddress.value.customers.map(id => {
    const customer = appState.customerData.find(c => c.id === id)
    return customer || { id, name: id }
  })
  
  // 根据关键词筛选
  const keyword = customerSearchKeyword.value.toLowerCase()
  if (!keyword) return customers
  
  return customers.filter(c => 
    c.id.toLowerCase().includes(keyword) || 
    c.name.toLowerCase().includes(keyword)
  )
})

// 显示关联客户弹窗
const showCustomerRelationDialog = (row: MonitorAddress) => {
  customerRelationAddress.value = row
  customerSearchKeyword.value = ''
  customerPagination.pageNum = 1
  customerRelationVisible.value = true
  
  // 计算总数
  if (row.customers) {
    customerPagination.total = row.customers.length
  }
}

// 搜索关联客户
const searchCustomerRelation = () => {
  customerPagination.pageNum = 1
  // 实际项目中这里需要重新加载数据
}

// 重置客户搜索
const resetCustomerSearch = () => {
  customerSearchKeyword.value = ''
  customerPagination.pageNum = 1
  // 实际项目中这里需要重新加载数据
}

// 移除客户关联
const removeCustomerRelation = (customerId: string) => {
  if (!customerRelationAddress.value || !customerRelationAddress.value.customers) return
  
  ElMessageBox.confirm(
    '删除后，该客户将无法收到此地址的交易通知。',
    '系统提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中这里需要调用API
    if (customerRelationAddress.value && customerRelationAddress.value.customers) {
      customerRelationAddress.value.customers = customerRelationAddress.value.customers.filter(id => id !== customerId)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 处理客户分页
const handleCustomerPageChange = (page: number) => {
  customerPagination.pageNum = page
  // 实际项目中这里需要重新加载数据
}

const customerCount = computed(() => {
  const start = (customerPagination.pageNum - 1) * customerPagination.pageSize
  const end = Math.min(start + customerPagination.pageSize, filteredCustomers.value.length)
  return filteredCustomers.value.slice(start, end)
})

// 格式化代币余额，只显示最多maxCount种代币
const formatTokenBalance = (tokenBalance: string | undefined, maxCount: number): string => {
  if (!tokenBalance) return '-'
  
  const lines = tokenBalance.split('\n')
  if (lines.length <= maxCount) return tokenBalance
  
  return lines.slice(0, maxCount).join('\n')
}

// 获取代币数量
const getTokenCount = (tokenBalance: string | undefined): number => {
  if (!tokenBalance) return 0
  return tokenBalance.split('\n').length
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

.customer-tags {
  display: flex;
  align-items: center;
  gap: 5px;
}

.customer-count {
  cursor: pointer !important;
  transition: all 0.3s;
  background-color: #909399 !important;
  color: white !important;
}

.customer-count:hover {
  background-color: #409EFF !important;
  transform: scale(1.05);
}

.token-balance-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.token-balance-cell > div {
  white-space: pre-line;
}

.token-balance-cell .view-all {
  color: #409EFF;
  cursor: pointer;
  margin-left: 5px;
  font-weight: 500;
}

.token-balance-cell .view-all:hover {
  color: #66b1ff;
  text-decoration: underline;
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

/* 监控条件相关样式 */
.monitor-condition-container {
  margin-top: 10px;
  padding: 0 20px;
}

.customer-relation-dialog {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  display: flex;
  align-items: center;
}

.label {
  white-space: nowrap;
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.search-buttons {
  display: flex;
  gap: 8px;
}

.customer-display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.customer-display span {
  margin-right: 5px;
}

.clickable-customer {
  cursor: pointer;
  color: #409EFF;
  text-decoration: underline;
}

.customer-number {
  cursor: pointer;
  color: #409EFF;
  font-weight: bold;
}

.customer-number:hover {
  color: #66b1ff;
}
</style> 
<template>
  <div class="page-container">
    <div class="customer-list-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">客户ID：</span>
            <el-input 
              v-model="searchForm.customerId" 
              placeholder="请输入客户ID" 
              clearable 
              style="width: 168px" 
            />
          </div>
          
          <div class="search-item">
            <span class="search-label">客户名称：</span>
            <el-input 
              v-model="searchForm.customerName" 
              placeholder="请输入客户名称" 
              clearable 
              style="width: 168px" 
            />
          </div>
          
          <div class="search-item">
            <span class="search-label">状态：</span>
            <el-select 
              v-model="searchForm.status" 
              placeholder="全部" 
              clearable 
              class="filter-dropdown"
            >
              <el-option label="启用" value="1" />
              <el-option label="禁用" value="0" />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">时间：</span>
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :default-time="defaultTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              :shortcuts="dateShortcuts"
              style="width: 380px"
            />
          </div>
          
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </div>
      </el-card>
      
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAdd">添加</el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
        
        <div class="right">
          <el-dropdown @command="handleCommand">
            <el-button>
              <span>批量操作</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="batchEnable">批量启用</el-dropdown-item>
                <el-dropdown-item command="batchDisable">批量禁用</el-dropdown-item>
                <el-dropdown-item command="batchDelete" divided>批量删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
        <el-table-column prop="id" label="客户ID" min-width="120" />
        <el-table-column prop="name" label="客户名称" min-width="120" />
        <el-table-column prop="monitorAddressCount" label="监听地址数量" min-width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="openAddressDialog(row)">
              {{ row.monitorAddressCount }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="serverId" label="服务器ID" min-width="120" />
        <el-table-column prop="callbackUrl" label="回调地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="privateKey" label="私钥" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              @change="(val: boolean) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-dropdown @command="(command) => handleRowCommand(command, row)">
              <el-button link type="primary">
                操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="transfer">转账管理</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
      
      <!-- 添加/编辑客户弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加客户' : '编辑客户'"
        width="500px"
        @closed="resetForm"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          label-position="right"
        >
          <el-form-item label="客户名称" prop="name" required>
            <el-input v-model="form.name" placeholder="请输入客户名称" />
          </el-form-item>
          
          <el-form-item label="回调地址" prop="callbackUrl" required>
            <el-input v-model="form.callbackUrl" placeholder="请输入回调地址" />
          </el-form-item>
          
          <el-form-item label="通知地址" prop="notifyUrl" required>
            <el-input v-model="form.notifyUrl" placeholder="请输入通知地址" />
          </el-form-item>
          
          <el-form-item label="服务器ID" prop="serverId" required>
            <el-input v-model="form.serverId" placeholder="请输入服务器ID" />
          </el-form-item>
          
          <el-form-item label="私钥" prop="privateKey" required>
            <el-input v-model="form.privateKey" placeholder="请输入私钥" />
          </el-form-item>
          
          <el-form-item label="状态" prop="status">
            <el-switch v-model="form.status" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">
            确定
          </el-button>
        </template>
      </el-dialog>
      
      <!-- 监听地址弹窗 -->
      <el-dialog
        v-model="addressDialogVisible"
        :title="`[${currentCustomer.id}]监听地址`"
        width="800px"
      >
        <div class="address-search-bar">
          <div class="search-input">
            <span class="label">监听地址</span>
            <el-input v-model="addressSearch" placeholder="请输入" style="width: 220px" />
          </div>
          <div class="search-buttons">
            <el-button type="primary" @click="searchAddresses">搜索</el-button>
            <el-button @click="resetAddressSearch">重置</el-button>
          </div>
        </div>
        
        <el-table :data="addressList" border stripe style="margin-top: 16px;">
          <el-table-column label="序号" type="index" width="70" align="center" />
          <el-table-column prop="address" label="监听地址" min-width="160" />
          <el-table-column prop="addTime" label="添加时间" min-width="160" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="danger" :icon="Delete" @click="confirmDeleteAddress(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container" style="margin-top: 16px;">
          <el-pagination
            v-model:current-page="addressPagination.pageNum"
            v-model:page-size="addressPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="addressPagination.total"
            @size-change="handleAddressSizeChange"
            @current-change="handleAddressCurrentChange"
          />
        </div>
      </el-dialog>

      <!-- 转账地址弹窗 -->
      <el-dialog
        v-model="transferAddressDialogVisible"
        :title="`[${currentCustomer.id}]转账地址`"
        width="800px"
      >
        <div class="transfer-address-header">
          <el-button type="primary" @click="openAddTransferAddressDialog">新增转账地址</el-button>
        </div>
        
        <el-table :data="transferAddressList" border stripe style="margin-top: 16px;">
          <el-table-column label="序号" type="index" width="70" align="center" />
          <el-table-column prop="chain" label="公链" width="100" />
          <el-table-column prop="toAddress" label="to地址" min-width="200" show-overflow-tooltip />
          <el-table-column prop="addTime" label="添加时间" min-width="160" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="danger" @click="confirmDeleteTransferAddress(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container" style="margin-top: 16px;">
          <el-pagination
            v-model:current-page="transferAddressPagination.pageNum"
            v-model:page-size="transferAddressPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="transferAddressPagination.total"
            @size-change="handleTransferAddressSizeChange"
            @current-change="handleTransferAddressCurrentChange"
          />
        </div>
      </el-dialog>

      <!-- 新增转账地址弹窗 -->
      <el-dialog
        v-model="addTransferAddressDialogVisible"
        title="新增转账地址"
        width="500px"
        @closed="resetTransferAddressForm"
      >
        <el-form
          ref="transferAddressFormRef"
          :model="transferAddressForm"
          :rules="transferAddressRules"
          label-width="100px"
        >
          <el-form-item label="公链" prop="chain" required>
            <el-select v-model="transferAddressForm.chain" placeholder="请选择公链" style="width: 100%">
              <el-option label="TRX" value="TRX" />
              <el-option label="POLYGON" value="POLYGON" />
              <el-option label="BSC" value="BSC" />
              <el-option label="ETH" value="ETH" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="to地址" prop="toAddress" required>
            <el-input v-model="transferAddressForm.toAddress" placeholder="请输入to地址" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="addTransferAddressDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitTransferAddressForm" :loading="transferAddressSubmitLoading">
            确定
          </el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import type { Customer, TransferAddress } from '@/types/customer'
import { customerList } from '@/constants/mockData'
import { addCustomer, updateCustomer, deleteCustomer } from '@/constants/mockApi'
import { useRoute } from 'vue-router'
import { appState } from '@/constants/appState'
import { Edit, Delete, ArrowDown } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  customerId: '',
  customerName: '',
  status: '',
  timeRange: [] as [string, string] | []
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
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 默认时间
const defaultTime = [
  new Date(2000, 1, 1, 0, 0, 0),
  new Date(2000, 1, 1, 23, 59, 59)
]

// 表格数据
const tableData = ref<Customer[]>([])
const tableLoading = ref(false)
const selectedRows = ref<Customer[]>([])

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  callbackUrl: '',
  notifyUrl: '',
  serverId: '',
  privateKey: '',
  status: true
})

// 表单校验规则
const rules = {
  name: [
    { required: true, message: '请输入客户名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度应为2-50个字符', trigger: 'blur' }
  ],
  callbackUrl: [
    { required: true, message: '请输入回调地址', trigger: 'blur' },
    { 
      pattern: /^https?:\/\/.+/, 
      message: '回调地址必须以http://或https://开头', 
      trigger: 'blur' 
    }
  ],
  notifyUrl: [
    { required: true, message: '请输入通知地址', trigger: 'blur' },
    { 
      pattern: /^https?:\/\/.+/, 
      message: '通知地址必须以http://或https://开头', 
      trigger: 'blur' 
    }
  ],
  serverId: [
    { required: true, message: '请输入服务器ID', trigger: 'blur' },
    { min: 3, max: 20, message: '长度应为3-20个字符', trigger: 'blur' }
  ],
  privateKey: [
    { required: true, message: '请输入私钥', trigger: 'blur' },
    { min: 16, message: '私钥长度不能小于16个字符', trigger: 'blur' }
  ]
}

// 监听地址弹窗相关
const addressDialogVisible = ref(false)
const currentCustomer = ref<Customer>({} as Customer)
const addressSearch = ref('')
const addressList = ref<any[]>([])
const addressPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 转账地址弹窗相关
const transferAddressDialogVisible = ref(false)
const transferAddressList = ref<TransferAddress[]>([])
const transferAddressPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 新增转账地址弹窗相关
const addTransferAddressDialogVisible = ref(false)
const transferAddressFormRef = ref<FormInstance>()
const transferAddressSubmitLoading = ref(false)
const transferAddressForm = reactive({
  chain: '',
  toAddress: ''
})

// 转账地址表单校验规则
const transferAddressRules = {
  chain: [
    { required: true, message: '请选择公链', trigger: 'change' }
  ],
  toAddress: [
    { required: true, message: '请输入to地址', trigger: 'blur' },
    { min: 10, message: '地址长度不能少于10个字符', trigger: 'blur' }
  ]
}

// 路由相关
const route = useRoute()

// 获取表格数据
const fetchTableData = () => {
  tableLoading.value = true
  
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.customerData]
    
    // 应用过滤
    if (searchForm.customerId) {
      const id = searchForm.customerId.toLowerCase()
      filteredData = filteredData.filter(item => item.id.toLowerCase().includes(id))
    }
    
    if (searchForm.customerName) {
      const name = searchForm.customerName.toLowerCase()
      filteredData = filteredData.filter(item => item.name.toLowerCase().includes(name))
    }
    
    if (searchForm.status !== '') {
      const status = searchForm.status === 'true'
      filteredData = filteredData.filter(item => item.status === status)
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
  fetchTableData()
}, { immediate: true })

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchTableData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.customerId = ''
  searchForm.customerName = ''
  searchForm.status = ''
  searchForm.timeRange = []
  pagination.pageNum = 1
  fetchTableData()
}

// 分页事件处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchTableData()
}

const handleCurrentChange = (current: number) => {
  pagination.pageNum = current
  fetchTableData()
}

// 表格选择事件
const handleSelectionChange = (rows: Customer[]) => {
  selectedRows.value = rows
}

// 添加客户
const handleAdd = () => {
  dialogType.value = 'add'
  resetForm()
  dialogVisible.value = true
}

// 编辑客户
const handleEdit = (row: Customer) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除客户
const handleDelete = async (row: Customer) => {
  try {
    await deleteCustomer(row.id)
    ElMessage.success('删除成功')
    fetchTableData()
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
    await ElMessageBox.confirm('确认批量删除选中的客户?', '提示', {
      type: 'warning'
    })
    
    const ids = selectedRows.value.map(row => row.id)
    const promises = ids.map(id => deleteCustomer(id))
    
    await Promise.all(promises)
    ElMessage.success('批量删除成功')
    fetchTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  if (command === 'batchEnable') {
    confirmBatchEnable()
  } else if (command === 'batchDisable') {
    confirmBatchDisable()
  } else if (command === 'batchDelete') {
    confirmBatchDelete()
  }
}

// 行操作下拉菜单命令处理
const handleRowCommand = (command: string, row: Customer) => {
  if (command === 'edit') {
    handleEdit(row)
  } else if (command === 'transfer') {
    openTransferAddressDialog(row)
  } else if (command === 'delete') {
    confirmDelete(row)
  }
}

// 批量删除确认
const confirmBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除这${selectedRows.value.length}条客户的全部数据吗？`,
    '系统提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      handleBatchDelete()
    })
    .catch(() => {
      // 用户点击取消，不执行任何操作
    })
}

// 批量启用确认
const confirmBatchEnable = () => {
  ElMessageBox.confirm(
    `确定要启用这${selectedRows.value.length}条客户数据吗？`,
    '系统提示',
    {
      confirmButtonText: '启用',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--primary',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      ElMessage.success('批量启用成功')
    })
    .catch(() => {
      // 用户点击取消，不执行任何操作
    })
}

// 批量禁用确认
const confirmBatchDisable = () => {
  ElMessageBox.confirm(
    `确定要禁用这${selectedRows.value.length}条客户数据吗？`,
    '系统提示',
    {
      confirmButtonText: '禁用',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--primary',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      ElMessage.success('批量禁用成功')
    })
    .catch(() => {
      // 用户点击取消，不执行任何操作
    })
}

// 状态变更处理
const handleStatusChange = (row: Customer, value: boolean) => {
  if (value) {
    confirmEnable(row);
  } else {
    confirmDisable(row);
  }
}

// 确认删除客户
const confirmDelete = (row: Customer) => {
  ElMessageBox.confirm(
    `确定要删除${row.id} (${row.name})的全部数据吗？删除后客户的监听地址也会一并清除。`,
    '系统提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      handleDelete(row)
    })
    .catch(() => {
      // 用户点击取消，不执行任何操作
    })
}

// 确认禁用客户
const confirmDisable = (row: Customer) => {
  ElMessageBox.confirm(
    `确定要将${row.id} (${row.name})的状态设置为禁用吗？禁用后，客户不会收到任何回调信息。`,
    '系统提示',
    {
      confirmButtonText: '禁用',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--primary',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      ElMessage.success('禁用成功')
    })
    .catch(() => {
      // 用户点击取消，恢复开关状态
      row.status = true
    })
}

// 确认启用客户
const confirmEnable = (row: Customer) => {
  ElMessageBox.confirm(
    `确定要将${row.id} (${row.name})的状态设置为启用吗？`,
    '系统提示',
    {
      confirmButtonText: '启用',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--primary',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      ElMessage.success('启用成功')
    })
    .catch(() => {
      // 用户点击取消，恢复开关状态
      row.status = false
    })
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      if (dialogType.value === 'add') {
        await addCustomer({
          name: form.name,
          callbackUrl: form.callbackUrl,
          privateKey: form.privateKey,
          status: form.status,
          monitorAddressCount: 0
        })
        ElMessage.success('添加成功')
      } else {
        await updateCustomer({
          id: form.id,
          name: form.name,
          callbackUrl: form.callbackUrl,
          privateKey: form.privateKey,
          status: form.status,
          monitorAddressCount: 0,
          updateTime: ''
        })
        ElMessage.success('更新成功')
      }
      
      dialogVisible.value = false
      fetchTableData()
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
  form.name = ''
  form.callbackUrl = ''
  form.notifyUrl = ''
  form.serverId = ''
  form.privateKey = ''
  form.status = true
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 打开监听地址弹窗
const openAddressDialog = (row: Customer) => {
  currentCustomer.value = row
  addressDialogVisible.value = true
  fetchAddressList()
}

// 获取监听地址列表数据
const fetchAddressList = () => {
  // 模拟数据 - 实际项目中应该调用API
  const mockData = Array.from({ length: 20 }, (_, index) => ({
    id: `addr_${index + 1}`,
    address: `0sokngvoin13g${index}`,
    addTime: '2024-09-09 23:59:59'
  }))
  
  addressList.value = mockData.slice(
    (addressPagination.pageNum - 1) * addressPagination.pageSize,
    addressPagination.pageNum * addressPagination.pageSize
  )
  addressPagination.total = mockData.length
}

// 搜索监听地址
const searchAddresses = () => {
  addressPagination.pageNum = 1
  fetchAddressList()
}

// 重置监听地址搜索
const resetAddressSearch = () => {
  addressSearch.value = ''
  addressPagination.pageNum = 1
  fetchAddressList()
}

// 监听地址分页事件处理
const handleAddressSizeChange = (size: number) => {
  addressPagination.pageSize = size
  fetchAddressList()
}

const handleAddressCurrentChange = (current: number) => {
  addressPagination.pageNum = current
  fetchAddressList()
}

// 删除监听地址
const deleteAddress = (row: any) => {
  ElMessage.success('删除成功')
  fetchAddressList()
}

// 确认删除监听地址
const confirmDeleteAddress = (row: any) => {
  ElMessageBox.confirm(
    '删除后，该客户将无法收到此地址的交易通知。',
    '系统提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      deleteAddress(row)
    })
    .catch(() => {
      // 用户点击取消，不执行任何操作
    })
}

// 打开转账地址弹窗
const openTransferAddressDialog = (row: Customer) => {
  currentCustomer.value = row
  transferAddressDialogVisible.value = true
  fetchTransferAddressList()
}

// 获取转账地址列表
const fetchTransferAddressList = () => {
  // 模拟数据 - 实际项目中应该调用API
  const mockData: TransferAddress[] = [
    {
      id: '1',
      chain: 'TRX',
      toAddress: 'TJ9qVk6eg7sQeJefY6ad4cWSM...',
      addTime: '2025-08-31 20:11:13'
    },
    {
      id: '2',
      chain: 'POLYGON',
      toAddress: '0xf27aE1e40D6D53Af4272D5B4...',
      addTime: '2025-08-31 20:11:41'
    }
  ]
  
  transferAddressList.value = mockData.slice(
    (transferAddressPagination.pageNum - 1) * transferAddressPagination.pageSize,
    transferAddressPagination.pageNum * transferAddressPagination.pageSize
  )
  transferAddressPagination.total = mockData.length
}

// 打开新增转账地址弹窗
const openAddTransferAddressDialog = () => {
  addTransferAddressDialogVisible.value = true
}

// 提交转账地址表单
const submitTransferAddressForm = async () => {
  if (!transferAddressFormRef.value) return
  
  await transferAddressFormRef.value.validate(async (valid) => {
    if (!valid) return
    
    transferAddressSubmitLoading.value = true
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      ElMessage.success('添加成功')
      addTransferAddressDialogVisible.value = false
      fetchTransferAddressList()
    } catch (error) {
      console.error('添加失败', error)
      ElMessage.error('添加失败')
    } finally {
      transferAddressSubmitLoading.value = false
    }
  })
}

// 重置转账地址表单
const resetTransferAddressForm = () => {
  transferAddressForm.chain = ''
  transferAddressForm.toAddress = ''
  
  if (transferAddressFormRef.value) {
    transferAddressFormRef.value.resetFields()
  }
}

// 删除转账地址
const deleteTransferAddress = (row: TransferAddress) => {
  ElMessage.success('删除成功')
  fetchTransferAddressList()
}

// 确认删除转账地址
const confirmDeleteTransferAddress = (row: TransferAddress) => {
  ElMessageBox.confirm(
    '确定要删除这个转账地址吗？',
    '系统提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
      center: false,
      roundButton: true,
    }
  )
    .then(() => {
      deleteTransferAddress(row)
    })
    .catch(() => {
      // 用户点击取消，不执行任何操作
    })
}

// 转账地址分页事件处理
const handleTransferAddressSizeChange = (size: number) => {
  transferAddressPagination.pageSize = size
  fetchTransferAddressList()
}

const handleTransferAddressCurrentChange = (current: number) => {
  transferAddressPagination.pageNum = current
  fetchTransferAddressList()
}

// 生命周期
onMounted(() => {
  try {
    fetchTableData()
  } catch (error) {
    tableLoading.value = false
  }
})
</script>

<style scoped>
.customer-list-container {
  padding: 20px;
}

.address-search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.search-input {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.search-input .label {
  margin-right: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.search-buttons {
  display: flex;
  gap: 8px;
}

.debug-info {
  display: none; /* 隐藏所有调试信息 */
}
</style> 
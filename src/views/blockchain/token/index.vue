<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="queryParams" ref="queryFormRef" inline class="multi-line-filter-form">
        <div class="filter-line">
          <el-form-item label="公链：" prop="blockchain">
            <el-select v-model="queryParams.blockchain" placeholder="请选择公链" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option v-for="item in chainSelectOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="代币名称：" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入代币名称" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="合约地址：" prop="contract">
            <el-input v-model="queryParams.contract" placeholder="请输入合约地址" clearable style="width: 220px" />
          </el-form-item>
          <div class="filter-buttons">
            <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
            <el-button :icon="Refresh" @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-container">
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加代币</el-button>
        </div>
        <div class="right">
          <el-button :icon="Refresh" circle @click="getList" />
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-if="tokenList.length > 0 || !loading"
        v-loading="loading"
        :data="tokenList"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="symbol" label="代币名称" min-width="120" />
        <el-table-column prop="blockchain" label="公链" min-width="120" />
        <el-table-column prop="contract" label="合约地址" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.contract" placement="top" :show-after="500">
              <span class="ellipsis-text">{{ row.contract }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="decimals" label="精度" min-width="80" />
        <el-table-column prop="triggerAmount" label="单笔触发金额" min-width="120">
          <template #default="{ row }">
            {{ row.triggerAmount || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="maxPercentage" label="历史最大单笔金额百分比" min-width="160">
          <template #default="{ row }">
            {{ row.maxPercentage ? `${row.maxPercentage}%` : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="triggerAction" label="触发动作" min-width="120">
          <template #default="{ row }">
            <span v-if="row.triggerAction === 'transfer'">提交闪电转账</span>
            <span v-else-if="row.triggerAction === 'multi-sign'">提交多签</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="addTime" label="添加时间" min-width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑代币对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
      destroy-on-close
    >
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basicInfo">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="100px"
            label-position="right"
          >
            <el-form-item label="选择公链：" prop="blockchain" required>
              <el-select v-model="form.blockchain" placeholder="选择公链" style="width: 100%">
                <el-option v-for="item in chainSelectOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="代币名称：" prop="symbol" required>
              <el-input v-model="form.symbol" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="合约地址：" prop="contract" required>
              <el-input v-model="form.contract" placeholder="请输入" />
            </el-form-item>
            <el-form-item label="精度：" prop="decimals">
              <el-input v-model="form.decimals" placeholder="请输入" />
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
              <el-form-item label="二次列表" prop="secondaryList">
                <el-switch
                  v-model="conditionForm.secondaryList"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </el-form-item>
              <el-form-item label="监控状态" prop="monitorStatus">
                <el-switch
                  v-model="conditionForm.monitorStatus"
                  active-text="启用"
                  inactive-text="禁用"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { TokenInfo, TokenQueryParams } from '@/types/blockchain'
import { tokenList as mockTokenList } from '@/constants/mockData'
import { saveToken, deleteToken } from '@/constants/mockApi'
import { useRoute } from 'vue-router'
import { appState } from '@/constants/appState'

// 查询参数
const queryParams = reactive<TokenQueryParams>({
  name: '',
  symbol: '',
  contract: '',
  blockchain: '',
  pageNum: 1,
  pageSize: 10
})

// 数据加载状态
const loading = ref(false)
// 提交按钮加载状态
const submitLoading = ref(false)
// 代币列表
const tokenList = ref<TokenInfo[]>([])
// 总条数
const total = ref(0)

// 查询表单引用
const queryFormRef = ref<FormInstance>()

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => form.id ? '编辑代币' : '添加代币')
const formRef = ref<FormInstance>()
const activeTab = ref('basicInfo')

// 表单数据
const form = reactive<TokenInfo>({
  id: '',
  name: '',
  symbol: '',
  contract: '',
  blockchain: '',
  decimals: 18,
  addTime: '',
  triggerAmount: 0,
  maxPercentage: 110,
  triggerAction: 'transfer',
  secondaryList: false,
  monitorStatus: true
})

// 监控条件相关
const conditionFormRef = ref<FormInstance>()
const conditionForm = reactive({
  triggerAmount: 0,
  maxPercentage: 110,
  triggerAction: 'transfer' as 'transfer' | 'multi-sign',
  secondaryList: false,
  monitorStatus: true
})

// 监控条件校验规则
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

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入代币名称', trigger: 'blur' }
  ],
  symbol: [
    { required: true, message: '请输入代币符号', trigger: 'blur' }
  ],
  blockchain: [
    { required: true, message: '请选择所属公链', trigger: 'change' }
  ],
  contract: [
    { required: true, message: '请输入合约地址', trigger: 'blur' }
  ]
}

// 路由相关
const route = useRoute()

// 获取公链下拉选项
const chainSelectOptions = computed(() => {
  return appState.blockchainData.map(chain => ({
    label: chain.name,
    value: chain.name
  }))
})

// 获取代币列表
const getList = () => {
  loading.value = true
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.tokenData]
    
    // 应用过滤
    if (queryParams.name) {
      filteredData = filteredData.filter(item => 
        item.name.includes(queryParams.name as string))
    }
    
    if (queryParams.symbol) {
      filteredData = filteredData.filter(item => 
        item.symbol.includes(queryParams.symbol as string))
    }
    
    if (queryParams.contract) {
      filteredData = filteredData.filter(item => 
        item.contract.includes(queryParams.contract as string))
    }
    
    if (queryParams.blockchain) {
      filteredData = filteredData.filter(item => 
        item.blockchain === queryParams.blockchain)
    }
    
    // 为每个代币生成模拟的监控条件数据
    filteredData = filteredData.map(item => {
      // 生成模拟监控条件数据
      const monitorCondition = generateMockMonitorCondition(item.id || '')
      
      return {
        ...item,
        ...monitorCondition
      }
    })
    
    // 设置总数
    total.value = filteredData.length
    
    // 应用分页
    const startIndex = (queryParams.pageNum - 1) * queryParams.pageSize
    const endIndex = startIndex + queryParams.pageSize
    tokenList.value = filteredData.slice(startIndex, endIndex)
  } catch (error) {
    console.error('获取代币列表失败', error)
    ElMessage.error('获取代币列表失败')
    tokenList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 生成模拟监控条件数据
const generateMockMonitorCondition = (tokenId: string) => {
  // 基于代币ID生成一些模拟属性
  const firstChar = tokenId.charCodeAt(0) || 0
  const hasCondition = firstChar % 4 !== 3 // 25%的代币没有监控条件
  
  if (!hasCondition) {
    return {}
  }
  
  return {
    triggerAmount: 100 * ((firstChar % 5) + 1),
    maxPercentage: 110 + (firstChar % 5) * 10, // 保证每个代币都有百分比值
    triggerAction: firstChar % 3 === 0 ? 'transfer' : 'multi-sign' as 'transfer' | 'multi-sign',
    secondaryList: firstChar % 2 === 0,
    monitorStatus: true
  }
}

// 监听路由变化，确保每次进入页面时数据都会重新加载
watch(() => route.fullPath, () => {
  getList()
}, { immediate: true })

// 查看按钮点击事件
const handleView = (row: TokenInfo) => {
  ElMessage.success(`查看代币: ${row.symbol}`)
}

// 查询按钮点击事件
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置按钮点击事件
const handleReset = () => {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  getList()
}

// 添加按钮点击事件
const handleAdd = () => {
  resetForm()
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 编辑按钮点击事件
const handleEdit = (row: TokenInfo) => {
  resetForm()
  dialogType.value = 'edit'
  Object.assign(form, row)
  
  // 填充监控条件表单
  conditionForm.triggerAmount = row.triggerAmount || 0
  conditionForm.maxPercentage = row.maxPercentage || 110
  conditionForm.triggerAction = row.triggerAction || 'transfer'
  conditionForm.secondaryList = row.secondaryList || false
  conditionForm.monitorStatus = row.monitorStatus !== undefined ? row.monitorStatus : true
  
  dialogVisible.value = true
}

// 删除按钮点击事件
const handleDelete = (row: TokenInfo) => {
  ElMessageBox.confirm(`删除后, 将无法获取到等笔交易发生后代币的余额信息, 确认要删除吗`, '系统提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteToken(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除代币失败', error)
      ElMessage.error('删除代币失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 提交表单
const handleSubmit = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      // 如果是编辑模式且当前在监控条件标签页，需要验证并保存监控条件
      if (dialogType.value === 'edit' && activeTab.value === 'monitorCondition') {
        if (conditionFormRef.value) {
          const validCondition = await conditionFormRef.value.validate()
            .then(() => true)
            .catch(() => false)
          
          if (validCondition) {
            // 将监控条件数据合并到代币数据中
            Object.assign(form, {
              triggerAmount: conditionForm.triggerAmount,
              maxPercentage: conditionForm.maxPercentage,
              triggerAction: conditionForm.triggerAction,
              secondaryList: conditionForm.secondaryList,
              monitorStatus: conditionForm.monitorStatus
            })
          } else {
            submitLoading.value = false
            return
          }
        }
      }
      
      await saveToken(form)
      ElMessage.success(form.id ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('保存代币失败', error)
      ElMessage.error('保存代币失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  Object.assign(form, {
    id: '',
    name: '',
    symbol: '',
    contract: '',
    blockchain: '',
    decimals: 18,
    addTime: ''
  })
  
  // 重置监控条件表单
  conditionForm.triggerAmount = 0
  conditionForm.maxPercentage = 110
  conditionForm.triggerAction = 'transfer'
  conditionForm.secondaryList = false
  conditionForm.monitorStatus = true
  
  // 切换到基本信息标签
  activeTab.value = 'basicInfo'
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
.page-container {
  padding: 20px;
}

.filter-container {
  margin-bottom: 16px;
}

.multi-line-filter-form .filter-line {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.multi-line-filter-form .filter-line:last-child {
  margin-bottom: 0;
  justify-content: flex-start;
}

.multi-line-filter-form .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.filter-buttons {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.table-container {
  margin-bottom: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.ellipsis-text {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}

.monitor-condition-container {
  padding: 10px;
}
</style> 
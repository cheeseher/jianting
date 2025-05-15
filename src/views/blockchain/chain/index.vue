<template>
  <div class="page-container">
    <div class="chain-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">公链：</span>
            <el-input
              v-model="queryParams.name"
              placeholder="请输入公链名称"
              clearable
              style="width: 168px"
            />
          </div>
          
          <div class="search-buttons">
            <el-button type="primary" @click="handleQuery">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleAdd">添加公链</el-button>
          </div>
        </div>
      </el-card>

      <!-- 数据表格 -->
      <el-table
        v-if="chainList.length > 0 || !loading"
        v-loading="loading"
        :data="chainList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="id" width="80" />
        <el-table-column prop="name" label="公链名称" min-width="120" />
        <el-table-column prop="address" label="公链地址" min-width="180" />
        <el-table-column prop="mainCurrency" label="主币" min-width="100" />
        <el-table-column prop="tokenCount" label="代币数量" min-width="100" />
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
        <el-table-column prop="explorerUrl" label="浏览器地址" min-width="180" />
        <el-table-column prop="addTime" label="添加时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right">
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
          :page-sizes="[10, 20, 30, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>

      <!-- 添加/编辑公链对话框 -->
      <el-dialog
        :title="dialogTitle"
        v-model="dialogVisible"
        width="500px"
        append-to-body
      >
        <el-tabs v-model="activeTab">
          <el-tab-pane label="基本信息" name="basicInfo">
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="100px"
            >
              <el-form-item label="公链名称" prop="name">
                <el-input v-model="form.name" placeholder="请输入公链名称" />
              </el-form-item>
              <el-form-item label="公链地址" prop="address">
                <el-input v-model="form.address" placeholder="请输入公链地址" />
              </el-form-item>
              <el-form-item label="主币" prop="mainCurrency">
                <el-input v-model="form.mainCurrency" placeholder="请输入主币名称" />
              </el-form-item>
              <el-form-item label="浏览器地址" prop="explorerUrl">
                <el-input v-model="form.explorerUrl" placeholder="请输入浏览器地址" />
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
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { BlockchainInfo, BlockchainQueryParams } from '@/types/blockchain'
import { useRoute } from 'vue-router'
import { saveBlockchain, deleteBlockchain } from '@/constants/mockApi'
import { appState } from '@/constants/appState'
import { Edit, Delete } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive<BlockchainQueryParams>({
  name: '',
  mainCurrency: '',
  pageNum: 1,
  pageSize: 10
})

// 数据加载状态
const loading = ref(false)
// 公链列表
const chainList = ref<BlockchainInfo[]>([])
// 总条数
const total = ref(0)

// 查询表单引用
const queryFormRef = ref<FormInstance>()

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const dialogTitle = computed(() => form.id ? '编辑公链' : '添加公链')
const formRef = ref<FormInstance>()
const activeTab = ref('basicInfo')

// 表单数据
const form = reactive<BlockchainInfo>({
  id: '',
  name: '',
  address: '',
  mainCurrency: '',
  tokenCount: 0,
  explorerUrl: '',
  addTime: '',
  // 增加监控条件字段
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
    { required: true, message: '请输入公链名称', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入公链地址', trigger: 'blur' }
  ],
  mainCurrency: [
    { required: true, message: '请输入主币名称', trigger: 'blur' }
  ]
}

// 路由相关
const route = useRoute()

// 获取公链列表
const getList = () => {
  loading.value = true
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.blockchainData]
    
    // 应用过滤
    if (queryParams.name) {
      filteredData = filteredData.filter(item => item.name.includes(queryParams.name as string))
    }
    
    if (queryParams.mainCurrency) {
      filteredData = filteredData.filter(item => 
        item.mainCurrency.includes(queryParams.mainCurrency as string))
    }
    
    // 为每个公链生成模拟的监控条件数据
    filteredData = filteredData.map(item => {
      // 生成模拟监控条件数据
      const monitorCondition = generateMockMonitorCondition(item.id || '')
      
      return {
        ...item,
        ...monitorCondition
      }
    })
    
    chainList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取公链列表失败', error)
    ElMessage.error('获取公链列表失败')
    chainList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 生成模拟监控条件数据
const generateMockMonitorCondition = (chainId: string) => {
  // 基于公链ID生成一些模拟属性
  const firstChar = chainId.charCodeAt(0) || 0
  const hasCondition = firstChar % 4 !== 3 // 25%的公链没有监控条件
  
  if (!hasCondition) {
    return {}
  }
  
  return {
    triggerAmount: 100 * ((firstChar % 5) + 1),
    maxPercentage: 110 + (firstChar % 5) * 10, // 保证每个公链都有百分比值
    triggerAction: firstChar % 3 === 0 ? 'transfer' : 'multi-sign' as 'transfer' | 'multi-sign',
    secondaryList: firstChar % 2 === 0,
    monitorStatus: true
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
const handleEdit = (row: BlockchainInfo) => {
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
const handleDelete = (row: BlockchainInfo) => {
  ElMessageBox.confirm(`删除后, 与该公链关联的监听地址将无法获取到交易信息，确定要删除吗?`, '系统提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteBlockchain(row.id)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除公链失败', error)
      ElMessage.error('删除公链失败')
    }
  }).catch(() => {
    // 取消操作
  })
}

// 提交表单
const handleSubmit = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      // 如果是编辑模式且当前在监控条件标签页，需要验证并保存监控条件
      if (dialogType.value === 'edit' && activeTab.value === 'monitorCondition') {
        if (conditionFormRef.value) {
          const validCondition = await conditionFormRef.value.validate()
            .then(() => true)
            .catch(() => false)
          
          if (validCondition) {
            // 将监控条件数据合并到公链数据中
            Object.assign(form, {
              triggerAmount: conditionForm.triggerAmount,
              maxPercentage: conditionForm.maxPercentage,
              triggerAction: conditionForm.triggerAction,
              secondaryList: conditionForm.secondaryList,
              monitorStatus: conditionForm.monitorStatus
            })
          } else {
            return
          }
        }
      }
      
      await saveBlockchain(form)
      ElMessage.success(form.id ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('保存公链失败', error)
      ElMessage.error('保存公链失败')
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
    address: '',
    mainCurrency: '',
    tokenCount: 0,
    explorerUrl: '',
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

.chain-container {
  width: 100%;
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
  margin-right: 8px;
  white-space: nowrap;
}

.search-buttons {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.monitor-condition-container {
  padding: 10px;
}

.ellipsis-text {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style> 
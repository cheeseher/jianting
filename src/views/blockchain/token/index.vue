<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="queryParams" ref="queryFormRef" inline class="multi-line-filter-form">
        <div class="filter-line">
          <el-form-item label="公链：" prop="blockchain">
            <el-select v-model="queryParams.blockchain" placeholder="请选择公链" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option v-for="item in chainOptions" :key="item" :label="item" :value="item" />
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
        <el-table-column prop="addTime" label="添加时间" min-width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除该代币吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
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
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="代币名称" prop="name" required>
          <el-input v-model="form.name" placeholder="请输入代币名称" />
        </el-form-item>
        <el-form-item label="代币符号" prop="symbol" required>
          <el-input v-model="form.symbol" placeholder="请输入代币符号" />
        </el-form-item>
        <el-form-item label="所属公链" prop="blockchain" required>
          <el-select v-model="form.blockchain" placeholder="请选择公链" style="width: 100%">
            <el-option v-for="item in chainOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="合约地址" prop="contract" required>
          <el-input v-model="form.contract" placeholder="请输入合约地址" />
        </el-form-item>
        <el-form-item label="精度" prop="decimals">
          <el-input-number v-model="form.decimals" :min="0" :max="20" style="width: 100%" />
        </el-form-item>
      </el-form>
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
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Delete } from '@element-plus/icons-vue'
import { TokenInfo, TokenQueryParams } from '@/types/blockchain'
import { tokenList as mockTokenList } from '@/constants/mockData'
import { saveToken, deleteToken } from '@/constants/mockApi'
import { useRoute } from 'vue-router'
import { chainOptions } from '@/constants/options'
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
const queryFormRef = ref()

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => form.id ? '编辑代币' : '添加代币')
const formRef = ref()
const form = reactive<TokenInfo>({
  id: '',
  name: '',
  symbol: '',
  contract: '',
  blockchain: '',
  decimals: 18,
  addTime: ''
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
    
    tokenList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取代币列表失败', error)
    ElMessage.error('获取代币列表失败')
    tokenList.value = []
    total.value = 0
  } finally {
    loading.value = false
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
  dialogVisible.value = true
}

// 编辑按钮点击事件
const handleEdit = (row: TokenInfo) => {
  resetForm()
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除按钮点击事件
const handleDelete = (row: TokenInfo) => {
  try {
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('删除代币失败', error)
    ElMessage.error('删除代币失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
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
  align-items: center;
}

.filter-buttons .el-button + .el-button {
  margin-left: 12px;
}

.table-container {
  margin-bottom: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

.ellipsis-text {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式处理 */
@media (max-width: 768px) {
  .filter-line {
    flex-wrap: wrap;
  }
  .filter-line > * {
    margin-bottom: 12px;
    width: 100%;
  }
  .filter-buttons {
    margin-left: 0;
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 
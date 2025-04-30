<template>
  <div class="page-container">
    <div class="chain-container">
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="search-form">
        <el-form-item label="公链">
          <el-select v-model="queryParams.name" placeholder="全部" clearable>
            <el-option label="全部" value="" />
            <el-option v-for="item in chainOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加公链</el-button>
        </el-form-item>
      </el-form>

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
        <el-table-column prop="explorerUrl" label="浏览器地址" min-width="180" />
        <el-table-column prop="addTime" label="添加时间" min-width="160" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { BlockchainInfo, BlockchainQueryParams } from '@/types/blockchain'
import { useRoute } from 'vue-router'
import { saveBlockchain, deleteBlockchain } from '@/constants/mockApi'
import { appState } from '@/constants/appState'

// 查询参数
const queryParams = reactive<BlockchainQueryParams>({
  name: '',
  mainCurrency: '',
  pageNum: 1,
  pageSize: 10
})

// 公链选项
const chainOptions = ref<string[]>(['BTC', 'ETH', 'BSC', 'TRON'])

// 数据加载状态
const loading = ref(false)
// 公链列表
const chainList = ref<BlockchainInfo[]>([])
// 总条数
const total = ref(0)

// 查询表单引用
const queryFormRef = ref()

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = computed(() => form.id ? '编辑公链' : '添加公链')
const formRef = ref()
const form = reactive<BlockchainInfo>({
  id: '',
  name: '',
  address: '',
  mainCurrency: '',
  tokenCount: 0,
  explorerUrl: '',
  addTime: ''
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
  dialogVisible.value = true
}

// 编辑按钮点击事件
const handleEdit = (row: BlockchainInfo) => {
  resetForm()
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除按钮点击事件
const handleDelete = (row: BlockchainInfo) => {
  ElMessageBox.confirm(`确认要删除公链 ${row.name} 吗？`, '提示', {
    confirmButtonText: '确定',
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
.chain-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style> 
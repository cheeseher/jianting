<template>
  <div class="page-container">
    <div class="telegram-bot-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">客户ID：</span>
            <el-input
              v-model="searchForm.customerId"
              placeholder="输入客户ID"
              clearable
              style="width: 220px"
            />
          </div>
          
          <div class="search-item">
            <span class="search-label">链类型：</span>
            <el-select
              v-model="searchForm.chainType"
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
          
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-card>
      
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAddBot">新增配置</el-button>
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
      >
        <el-table-column label="ID" prop="id" width="80" />
        <el-table-column label="客户ID" prop="customerId" width="120" />
        <el-table-column label="链类型" prop="chainType" width="100" />
        <el-table-column label="发送链接" prop="sendUrl" min-width="300">
          <template #default="{ row }">
            <el-tooltip :content="row.sendUrl" placement="top" :show-after="200">
              <span class="ellipsis-text">{{ row.sendUrl }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="更新时间" prop="updateTime" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
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
      
      <!-- 添加/编辑TG机器人弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '新增配置' : '编辑配置'"
        width="600px"
        @closed="resetForm"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="客户" prop="customerId" required>
            <el-select
              v-model="form.customerId"
              placeholder="请选择客户"
              filterable
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
          
          <el-form-item label="链类型" prop="chainType" required>
            <el-select
              v-model="form.chainType"
              placeholder="请选择链类型"
              style="width: 100%"
            >
              <el-option
                v-for="item in chainOptions.filter(item => item.value)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="发送链接" prop="sendUrl" required>
            <el-input
              v-model="form.sendUrl"
              placeholder="请输入TG Bot发送链接"
              clearable
            />
            <div class="form-item-tip">格式：https://api.telegram.org/开头</div>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { TelegramBot } from '@/types/telegram'
import { chainOptions } from '@/constants/options'
import { telegramBotList } from '@/constants/mockData'
import { customerList } from '@/constants/mockData'
import { addTelegramBot, updateTelegramBot, deleteTelegramBot } from '@/constants/mockApi'

// 搜索表单
const searchForm = reactive({
  customerId: '',
  chainType: ''
})

// 分页配置
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: telegramBotList.length
})

// 表格数据
const tableData = ref<TelegramBot[]>([])
const tableLoading = ref(false)

// 客户选项
const customerOptions = computed(() => {
  return customerList.map(item => ({
    label: `${item.name} (${item.id})`,
    value: item.id
  }))
})

// 对话框状态
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)

// 表单相关
const formRef = ref<FormInstance>()
const form = reactive<TelegramBot>({
  id: '',
  customerId: '',
  chainType: '',
  sendUrl: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  chainType: [{ required: true, message: '请选择链类型', trigger: 'change' }],
  sendUrl: [
    { required: true, message: '请输入发送链接', trigger: 'blur' },
    { 
      pattern: /^https:\/\/api\.telegram\.org\/.+/,
      message: '链接格式必须以https://api.telegram.org/开头',
      trigger: 'blur'
    }
  ]
})

// 初始化加载数据
onMounted(() => {
  loadTableData()
})

// 加载表格数据
const loadTableData = () => {
  tableLoading.value = true
  
  // 模拟API请求
  setTimeout(() => {
    // 过滤数据
    let filteredData = [...telegramBotList]
    
    if (searchForm.customerId) {
      filteredData = filteredData.filter(item => 
        item.customerId.includes(searchForm.customerId)
      )
    }
    
    if (searchForm.chainType) {
      filteredData = filteredData.filter(item => 
        item.chainType === searchForm.chainType
      )
    }
    
    // 计算总数
    pagination.total = filteredData.length
    
    // 分页
    const startIndex = (pagination.pageNum - 1) * pagination.pageSize
    const endIndex = startIndex + pagination.pageSize
    tableData.value = filteredData.slice(startIndex, endIndex)
    
    tableLoading.value = false
  }, 300)
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  loadTableData()
}

// 重置搜索
const handleReset = () => {
  searchForm.customerId = ''
  searchForm.chainType = ''
  pagination.pageNum = 1
  loadTableData()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadTableData()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNum = page
  loadTableData()
}

// 新增TG机器人配置
const handleAddBot = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 编辑TG机器人配置
const handleEdit = (row: TelegramBot) => {
  dialogType.value = 'edit'
  Object.assign(form, row)
  dialogVisible.value = true
}

// 删除TG机器人配置
const handleDelete = (row: TelegramBot) => {
  deleteTelegramBot(row.id).then(() => {
    loadTableData()
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: '',
    customerId: '',
    chainType: '',
    sendUrl: ''
  })
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      // 根据类型判断是新增还是编辑
      const promise = dialogType.value === 'add'
        ? addTelegramBot(form)
        : updateTelegramBot(form)
      
      promise.then(() => {
        loadTableData()
        dialogVisible.value = false
      }).finally(() => {
        submitLoading.value = false
      })
    }
  })
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}

.telegram-bot-container {
  background: #fff;
  border-radius: 4px;
}

.card-container {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
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
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.ellipsis-text {
  display: inline-block;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.form-item-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style> 
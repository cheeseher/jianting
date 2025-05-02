<template>
  <div class="page-container">
    <div class="callback-record-container">
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="search-form">
        <el-form-item label="回调ID">
          <el-input v-model="queryParams.id" placeholder="输入关键词" clearable />
        </el-form-item>
        <el-form-item label="Hash">
          <el-input v-model="queryParams.hash" placeholder="输入关键词" clearable />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.type" placeholder="全部" clearable>
            <el-option 
              v-for="item in transactionTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="公链">
          <el-select v-model="queryParams.chain" placeholder="全部" clearable>
            <el-option 
              v-for="item in chainOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="代币名称">
          <el-input v-model="queryParams.tokenName" placeholder="输入关键词" clearable />
        </el-form-item>
      </el-form>

      <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="search-form">
        <el-form-item label="监听地址">
          <el-input v-model="queryParams.monitorAddress" placeholder="输入关键词" clearable />
        </el-form-item>
        <el-form-item label="对象地址">
          <el-input v-model="queryParams.targetAddress" placeholder="输入关键词" clearable />
        </el-form-item>
        <el-form-item label="客户">
          <el-input v-model="queryParams.customer" placeholder="输入客户ID/名称" clearable />
        </el-form-item>
        <el-form-item label="回调时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
        <el-form-item label="回调状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable>
            <el-option 
              v-for="item in callbackStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>

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
        <el-table-column prop="targetAddress" label="对象地址" min-width="180" />
        <el-table-column prop="type" label="类型" min-width="80" />
        <el-table-column prop="chain" label="公链" min-width="80" />
        <el-table-column prop="tokenName" label="代币名称" min-width="100" />
        <el-table-column prop="amount" label="转账数量" min-width="100" />
        <el-table-column prop="customer" label="客户" min-width="100" />
        <el-table-column prop="callbackTime" label="回调时间" min-width="160" />
        <el-table-column prop="status" label="回调状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '成功' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="120">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">手动回调</el-button>
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

// 查询参数
const queryParams = reactive<CallbackRecordQueryParams>({
  id: '',
  hash: '',
  monitorAddress: '',
  targetAddress: '',
  type: '',
  chain: '',
  tokenName: '',
  customer: '',
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
    
    if (queryParams.customer) {
      filteredData = filteredData.filter(item => 
        item.customer && item.customer.includes(queryParams.customer as string))
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

// 重置按钮点击事件
const handleReset = () => {
  queryFormRef.value?.resetFields()
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
  ElMessageBox.confirm(`确认要手动回调记录 ${row.id} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('回调请求已发送')
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
</script>

<style scoped>
.callback-record-container {
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 
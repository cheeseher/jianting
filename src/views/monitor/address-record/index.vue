<template>
  <div class="page-container">
    <div class="address-record-container">
      <h2>地址变动记录</h2>
      
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">监听地址：</span>
            <el-input 
              v-model="searchForm.address" 
              placeholder="输入" 
              clearable 
              style="width: 220px" 
            />
          </div>
          
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
            <span class="search-label">客户：</span>
            <el-input 
              v-model="searchForm.customerId" 
              placeholder="输入客户ID/客户名称" 
              clearable 
              style="width: 220px" 
            />
          </div>
          
          <div class="search-item">
            <span class="search-label">操作类型：</span>
            <el-select 
              v-model="searchForm.type" 
              placeholder="全部" 
              clearable 
              class="filter-dropdown"
            >
              <el-option
                v-for="item in operateTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">操作时间：</span>
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
      
      <!-- 数据表格 -->
      <el-table
        ref="tableRef"
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
      >
        <el-table-column label="监听地址" prop="address" min-width="180" />
        <el-table-column label="公链" prop="chain" width="100" />
        <el-table-column label="类型" prop="type" width="100" />
        <el-table-column label="操作人" prop="operator" width="150" />
        <el-table-column label="操作时间" prop="operateTime" width="180" />
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
      
      <!-- 操作说明 -->
      <div class="address-record-tips">
        <p>仅记录客户的添加/删除监听地址的操作</p>
        <p>操作时间格式：日期/时间 记录，并精确到秒</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { AddressChangeRecord } from '@/types/monitor'
import { getAddressChangeRecords, chainOptions, operateTypeOptions } from '@/api/monitor'

// 搜索表单
const searchForm = reactive({
  address: '',
  chain: '',
  customerId: '',
  type: '',
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
const tableData = ref<AddressChangeRecord[]>([])
const tableLoading = ref(false)

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取地址变动记录列表
const fetchAddressChangeRecords = async () => {
  tableLoading.value = true
  try {
    const params = {
      address: searchForm.address,
      chain: searchForm.chain,
      customerId: searchForm.customerId,
      type: searchForm.type,
      timeRange: searchForm.timeRange,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    const { list, total } = await getAddressChangeRecords(params)
    tableData.value = list
    pagination.total = total
  } catch (error) {
    console.error('获取地址变动记录失败', error)
    ElMessage.error('获取地址变动记录失败')
  } finally {
    tableLoading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchAddressChangeRecords()
}

// 重置搜索
const handleReset = () => {
  searchForm.address = ''
  searchForm.chain = ''
  searchForm.customerId = ''
  searchForm.type = ''
  searchForm.timeRange = []
  pagination.pageNum = 1
  fetchAddressChangeRecords()
}

// 分页事件处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchAddressChangeRecords()
}

const handleCurrentChange = (current: number) => {
  pagination.pageNum = current
  fetchAddressChangeRecords()
}

// 初始化
onMounted(() => {
  fetchAddressChangeRecords()
})
</script>

<style scoped>
.address-record-container {
  padding: 20px;
}

.address-record-tips {
  margin-top: 20px;
  padding: 16px;
  background-color: #f8f8f8;
  border-radius: 4px;
  color: #606266;
}

.address-record-tips p {
  margin: 8px 0;
}
</style> 
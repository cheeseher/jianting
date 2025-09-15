<template>
  <div class="transfer-manage">
    <!-- 搜索区域 -->
    <div class="search-section">
      <el-button type="primary" @click="refreshData">刷新</el-button>
    </div>

    <!-- 表格 -->
    <el-table 
      :data="transferList" 
      style="width: 100%" 
      v-loading="loading"
      border
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="chain" label="公链" width="100" />
      <el-table-column prop="note" label="note" width="150" />
      <el-table-column prop="address" label="地址" width="200" />
      <el-table-column prop="txHash" label="数量" width="150" />
      <el-table-column prop="details" label="详情" min-width="300" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 转账记录接口
interface TransferRecord {
  id: number
  chain: string
  note: string
  address: string
  txHash: string
  details: string
  createTime: string
}

// 数据
const loading = ref(false)
const transferList = ref<TransferRecord[]>([])

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 模拟数据
const mockTransferData: TransferRecord[] = [
  {
    id: 548,
    chain: 'trx',
    note: 'TronCreateMultisig',
    address: 'TR5UUFqVYDxJd2E4UTMAWRXqUcDVK',
    txHash: '962b514e6d4d3b9dc0da435510447b633e8d0631b6aed4443c2a9b9e0fbc86c15',
    details: 'Active:TR25UuFqVYDxJd2E4UTMAWRXqUcDVK：1\nTYc1TCYLd99yJtaxZNqQHcYLdzr4fRWT：1\nOwner:TR25UuFqVYDxJd2E4UTMAWRXqUcDVK：1\nTYc1TCYLd99yJtaxZNqQHcYLdzr4fRWT：1',
    createTime: '2025-09-15 02:22:41'
  },
  {
    id: 547,
    chain: 'eth',
    note: 'SendETHToken',
    address: '0xe06c3b6d4c8961b7c6f5b0b6b06b6afc9f6c501747',
    txHash: '0d00a8f0861d9e1d17889f105069cc94e67c1a77b73dcc2a0726f5c30450765',
    details: 'from: 0xe06c3b6d4c8961b7c6f5b0b6b06b6afc9f6c501747\nto: 0xf814270ac13c0A8861b6f4a3d4c05c07f912132\nAmount: 25099.6\nSymbol: USDT',
    createTime: '2025-09-12 16:16:25'
  },
  {
    id: 546,
    chain: 'bsc',
    note: 'SendETHToken',
    address: '0xe24b3d2E85661005ea39d591F6E7D56eEC674',
    txHash: '0e90b4bf6b97bb52bdd6b0c2012bea9f3c9f4b94b2409865e9e3c1291a80',
    details: 'from: 0xe24b3d2E85661005ea39d591F6E7D56eEC674\nto: 0xe4CD1af9aED7SaeDF8bb9a32482b906Baac0e\nAmount: 2000\nSymbol: USDT',
    createTime: '2025-09-12 15:09:42'
  },
  {
    id: 545,
    chain: 'bsc',
    note: 'SendETHToken',
    address: '0x69f4e9c36308fc324eBf2b87e1690b9f7e40eb30a',
    txHash: '0d213791ba5bb4d9a1aa1d38bc1c916908f9e75e9d27e00eb30a899d63f',
    details: 'from: 0x69f4e9c36308fc324eBf2b87e1690b9f7e40eb30a\nto: 0xf124c6A6b8c894f7C6722e5d8bc8df3f3bb2ea\nAmount: 2004.6361391968893\nSymbol: USDT',
    createTime: '2025-09-12 07:50:12'
  },
  {
    id: 544,
    chain: 'eth',
    note: 'SendETHToken',
    address: '0xef3c2E8AaBaCZ89cF8A6b259174017401C9f6658E9',
    txHash: '0xd3c5e8f49e0ca17bac9a7f50ba0fe17d82e6fc5453c2fb9e2c3a6e8df5230',
    details: 'from: 0xef3c2E8AaBaCZ89cF8A6b259174017401C9f6658E9\nto: 0xecFCC6ca6a3b61517f9dcaFEa8d831e0A5d5E8\nAmount: 11829.43\nSymbol: USDT',
    createTime: '2025-09-11 13:24:39'
  }
]

// 获取转账数据
const fetchTransferData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    transferList.value = mockTransferData.slice(start, end)
    pagination.total = mockTransferData.length
    
  } catch (error) {
    ElMessage.error('获取转账数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchTransferData()
  ElMessage.success('数据已刷新')
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.size = size
  pagination.current = 1
  fetchTransferData()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchTransferData()
}

// 初始化
onMounted(() => {
  fetchTransferData()
})
</script>

<style scoped>
.transfer-manage {
  padding: 20px;
}

.search-section {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* 表格样式 */
:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 8px 0;
}

/* 详情列样式 */
:deep(.el-table .el-table__cell) {
  word-break: break-all;
}
</style>
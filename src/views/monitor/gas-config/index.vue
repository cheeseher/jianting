<template>
  <div class="page-container">
    <el-card shadow="never" class="card-container">
      <div class="search-container">
        <div class="search-item">
          <span class="search-label">来源地址：</span>
          <el-input v-model="searchFromAddress" placeholder="输入来源地址" clearable style="width: 220px" @input="handleSearch" />
        </div>
        <div class="search-buttons">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="openDialog('add')">添加配置</el-button>
        </div>
      </div>
      <el-table :data="filteredTableData" border stripe style="margin-bottom: 16px" v-loading="tableLoading">
        <el-table-column prop="chain" label="链名称" width="120">
          <template #default="{ row }">
            <el-tag>{{ getChainLabel(row.chain) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fromAddress" label="来源地址" min-width="220" />
        <el-table-column prop="supplementAmount" label="补充数量" width="150">
          <template #default="{ row }">
            <span>{{ row.supplementAmount || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="是否启用" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'danger'">{{ row.enabled ? '启用' : '禁用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog('edit', row)">编辑</el-button>
            <el-button link type="info" @click="openRecordDialog(row)">补充记录</el-button>
            <el-popconfirm title="确认删除该配置？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="dialogType==='add' ? '添加配置' : '编辑配置'" width="500px" @closed="resetForm">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="链名称" prop="chain" required>
          <el-select v-model="form.chain" placeholder="请选择链">
            <el-option v-for="item in chainOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="来源地址" prop="fromAddress" required>
          <el-input v-model="form.fromAddress" placeholder="请输入钱包地址" />
        </el-form-item>
        <el-form-item label="补充数量" prop="supplementAmount" required>
          <el-input v-model="form.supplementAmount" placeholder="请输入补充数量" type="number" step="0.001" min="0" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio :label="true">启用</el-radio>
            <el-radio :label="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
    <!-- 补充记录弹窗 -->
    <el-dialog v-model="recordDialogVisible" title="补充记录" width="700px">
      <el-table :data="pagedRecordTableData" border stripe>
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="amount" label="补充金额" width="120" />
        <el-table-column prop="exceptionId" label="关联异常记录ID" width="180" />
        <el-table-column prop="address" label="监听地址" min-width="180">
          <template #default="{ row }">
            <span>{{ row.address }}</span>
            <el-button link type="primary" size="small" @click="copyAddress(row.address)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="recordPageNum"
          :page-size="recordPageSize"
          layout="total, prev, pager, next"
          :total="recordTableData.length"
          @current-change="handleRecordPageChange"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'

// 固定链选项
const chainOptions = [
  { label: 'BCH', value: 'BCH', unit: 'BCH' },
  { label: 'BSC', value: 'BSC', unit: 'BNB' },
  { label: 'BTC', value: 'BTC', unit: 'BTC' },
  { label: 'ETC', value: 'ETC', unit: 'ETC' },
  { label: 'ETH', value: 'ETH', unit: 'ETH' },
  { label: 'LTC', value: 'LTC', unit: 'LTC' },
  { label: 'TRX', value: 'TRX', unit: 'TRX' },
  { label: 'ARBITRUM', value: 'ARBITRUM', unit: 'ETH' },
  { label: 'DOGE', value: 'DOGE', unit: 'DOGE' },
  { label: 'POLYGON', value: 'POLYGON', unit: 'MATIC' }
]

const getChainLabel = (val: string) => chainOptions.find(c => c.value === val)?.label || val
const getChainUnit = (val: string) => chainOptions.find(c => c.value === val)?.unit || ''

const tableData = ref<any[]>([
  { id: '1', chain: 'ETH', fromAddress: '0x1234...abcd', supplementAmount: '0.1', enabled: true, createdAt: '2024-06-01 10:00:00' },
  { id: '2', chain: 'BSC', fromAddress: '0x5678...efgh', supplementAmount: '0.05', enabled: false, createdAt: '2024-06-02 11:00:00' }
])
const tableLoading = ref(false)

const dialogVisible = ref(false)
const dialogType = ref<'add'|'edit'>('add')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const form = reactive({
  id: '',
  chain: '',
  fromAddress: '',
  supplementAmount: '',
  enabled: true
})
const rules = {
  chain: [{ required: true, message: '请选择链', trigger: 'change' }],
  fromAddress: [{ required: true, message: '请输入钱包地址', trigger: 'blur' }],
  supplementAmount: [
    { required: true, message: '请输入补充数量', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '请输入有效的数字', trigger: 'blur' }
  ]
}

const searchFromAddress = ref('')

const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    const matchAddress = !searchFromAddress.value || (item.fromAddress && item.fromAddress.toLowerCase().includes(searchFromAddress.value.toLowerCase()))
    return matchAddress
  })
})

function handleSearch() {
  // 这里只需触发 computed 重新计算即可，无需额外操作
}
function handleReset() {
  searchFromAddress.value = ''
}

function openDialog(type: 'add'|'edit', row?: any) {
  dialogType.value = type
  if (type === 'edit' && row) {
    // 深拷贝数据，避免直接修改表格数据
    const rowData = JSON.parse(JSON.stringify(row))
    Object.assign(form, rowData)
  } else {
    resetForm()
    form.enabled = true
  }
  dialogVisible.value = true
}

function resetForm() {
  form.id = ''
  form.chain = ''
  form.fromAddress = ''
  form.supplementAmount = ''
  form.enabled = true
  if (formRef.value) formRef.value.resetFields()
}

function submitForm() {
  if (!formRef.value) return
  formRef.value.validate((valid: boolean) => {
    if (!valid) return
    submitLoading.value = true
    setTimeout(() => {
      // 准备提交的数据
      const submitData = {
        ...form
      }
      
      if (dialogType.value === 'add') {
        tableData.value.push({
          ...submitData,
          id: Date.now().toString(),
          createdAt: new Date().toLocaleString()
        })
        ElMessage.success('添加成功')
      } else {
        const idx = tableData.value.findIndex(item => item.id === form.id)
        if (idx > -1) {
          tableData.value[idx] = { ...submitData }
          ElMessage.success('更新成功')
        }
      }
      dialogVisible.value = false
      submitLoading.value = false
    }, 500)
  })
}

function handleDelete(row: any) {
  tableData.value = tableData.value.filter(item => item.id !== row.id)
  ElMessage.success('删除成功')
}

function toggleEnable(row: any) {
  row.enabled = !row.enabled
  ElMessage.success(row.enabled ? '已启用' : '已禁用')
}

const recordDialogVisible = ref(false)
const recordTableData = ref<any[]>([])
const recordPageNum = ref(1)
const recordPageSize = 10
const pagedRecordTableData = computed(() => {
  const start = (recordPageNum.value - 1) * recordPageSize
  const end = start + recordPageSize
  return recordTableData.value.slice(start, end)
})
function handleRecordPageChange(page: number) {
  recordPageNum.value = page
}

function openRecordDialog(row: any) {
  // mock数据，实际可根据row.id请求
  recordTableData.value = Array.from({ length: 23 }, (_, i) => ({
    time: `2024-07-${(i%30+1).toString().padStart(2,'0')} 10:00:00`,
    amount: `${(Math.random()*0.05+0.01).toFixed(3)} ${getChainUnit(row.chain)}`,
    exceptionId: (1000+i).toString(),
    address: row.fromAddress
  }))
  recordPageNum.value = 1
  recordDialogVisible.value = true
}

function copyAddress(address: string) {
  if (!address) return
  navigator.clipboard.writeText(address).then(() => {
    ElMessage.success('已复制到剪贴板')
  })
}
</script>

<style scoped>
.page-container { padding: 20px; }
.card-container { margin-bottom: 16px; }
.table-toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.table-toolbar .left {
  display: flex;
  gap: 10px;
}
.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  margin-bottom: 0;
  margin-top: 0;
  margin-bottom: 16px;
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
  display: flex;
  gap: 8px;
}
.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
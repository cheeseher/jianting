<template>
  <div class="page-container">
    <!-- 筛选区域 -->
    <el-card shadow="never" class="filter-container">
      <el-form :model="queryParams" ref="queryFormRef" inline class="multi-line-filter-form">
        <div class="filter-line">
          <el-form-item label="用户名：" prop="username">
            <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="姓名：" prop="realname">
            <el-input v-model="queryParams.realname" placeholder="请输入姓名" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="角色：" prop="role">
            <el-select v-model="queryParams.role" placeholder="请选择角色" clearable style="width: 168px">
              <el-option label="全部" value="" />
              <el-option label="超级管理员" value="超级管理员" />
              <el-option label="普通用户" value="普通用户" />
            </el-select>
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
          <el-button type="primary" :icon="Plus" @click="handleAdd">新增用户</el-button>
        </div>
        <div class="right">
          <el-button :icon="Refresh" circle @click="refreshTable" />
        </div>
      </div>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="userList"
        border
        stripe
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realname" label="姓名" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link :icon="View" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" :icon="Key" @click="handleResetPwd(row)">重置密码</el-button>
            <el-popconfirm title="确认删除该用户吗？" @confirm="handleDelete(row)">
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

    <!-- 添加/编辑用户对话框 -->
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
        <el-form-item label="用户名" prop="username" required>
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="姓名" prop="realname" required>
          <el-input v-model="form.realname" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" prop="role" required>
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="超级管理员" value="超级管理员" />
            <el-option label="普通用户" value="普通用户" />
          </el-select>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" required>
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="启用">启用</el-radio>
            <el-radio label="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, View, Edit, Delete, Key } from '@element-plus/icons-vue'

// 定义表单对话框标题
const dialogTitle = computed(() => form.id ? '编辑用户' : '添加用户')

// 查询参数
const queryParams = reactive({
  username: '',
  realname: '',
  role: '',
  pageNum: 1,
  pageSize: 10
})

// 数据加载状态
const loading = ref(false)
// 提交按钮加载状态
const submitLoading = ref(false)
// 用户列表
const userList = ref([
  {
    id: '1',
    username: 'admin',
    realname: '管理员',
    role: '超级管理员',
    email: 'admin@example.com',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    username: 'user1',
    realname: '用户1',
    role: '普通用户',
    email: 'user1@example.com',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    username: 'user2',
    realname: '用户2',
    role: '普通用户',
    email: 'user2@example.com',
    status: '禁用',
    createTime: '2024-09-27 15:00:00'
  }
])
// 总条数
const total = ref(3)

// 查询表单引用
const queryFormRef = ref()

// 表单对话框相关
const dialogVisible = ref(false)
const formRef = ref()
const form = reactive({
  id: '',
  username: '',
  realname: '',
  role: '',
  email: '',
  status: '启用'
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  realname: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 查询按钮点击事件
const handleQuery = () => {
  queryParams.pageNum = 1
  ElMessage.success('查询功能开发中...')
}

// 重置按钮点击事件
const handleReset = () => {
  queryFormRef.value?.resetFields()
  queryParams.pageNum = 1
  ElMessage.success('重置成功')
}

// 刷新表格
const refreshTable = () => {
  ElMessage.success('刷新表格数据')
}

// 添加按钮点击事件
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

// 查看按钮点击事件
const handleView = (row: any) => {
  ElMessage.success(`查看用户：${row.username}，功能开发中...`)
}

// 编辑按钮点击事件
const handleEdit = (row: any) => {
  resetForm()
  Object.assign(form, row)
  dialogVisible.value = true
}

// 重置密码按钮点击事件
const handleResetPwd = (row: any) => {
  ElMessageBox.confirm(`确认要重置用户 ${row.username} 的密码吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码重置成功')
  }).catch(() => {
    // 取消操作
  })
}

// 删除按钮点击事件
const handleDelete = (row: any) => {
  ElMessage.success('删除成功')
}

// 提交表单
const submitForm = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return
    
    submitLoading.value = true
    setTimeout(() => {
      ElMessage.success(form.id ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      submitLoading.value = false
    }, 500)
  })
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  Object.assign(form, {
    id: '',
    username: '',
    realname: '',
    role: '',
    email: '',
    status: '启用'
  })
}

// 每页条数变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  ElMessage.success(`每页显示${size}条记录`)
}

// 页码变化
const handleCurrentChange = (page: number) => {
  queryParams.pageNum = page
  ElMessage.success(`当前页：${page}`)
}

// 页面挂载时加载数据
onMounted(() => {
  // 异步加载数据
  setTimeout(() => {
    ElMessage.success('用户数据加载成功')
  }, 500)
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
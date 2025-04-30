<template>
  <div class="page-container">
    <div class="role-container">
      <!-- 搜索表单 -->
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="queryParams.roleName" placeholder="输入关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">添加角色</el-button>
        </el-form-item>
      </el-form>

      <!-- 数据表格 -->
      <el-table
        v-loading="loading"
        :data="roleList"
        style="width: 100%"
        border
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleName" label="角色名称" min-width="120" />
        <el-table-column prop="roleKey" label="角色标识" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="180" />
        <el-table-column prop="createTime" label="创建时间" min-width="160" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '启用' ? 'success' : 'danger'">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handlePermission(row)">权限</el-button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  roleName: '',
  pageNum: 1,
  pageSize: 10
})

// 数据加载状态
const loading = ref(false)
// 角色列表
const roleList = ref([
  {
    id: '1',
    roleName: '超级管理员',
    roleKey: 'admin',
    description: '拥有所有权限',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    roleName: '普通用户',
    roleKey: 'user',
    description: '拥有基本权限',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    roleName: '访客',
    roleKey: 'visitor',
    description: '只有查看权限',
    status: '禁用',
    createTime: '2024-09-27 15:00:00'
  }
])
// 总条数
const total = ref(3)

// 查询表单引用
const queryFormRef = ref()

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

// 添加按钮点击事件
const handleAdd = () => {
  ElMessage.success('添加角色功能开发中...')
}

// 编辑按钮点击事件
const handleEdit = (row: any) => {
  ElMessage.success(`编辑角色：${row.roleName}，功能开发中...`)
}

// 权限按钮点击事件
const handlePermission = (row: any) => {
  ElMessage.success(`配置角色 ${row.roleName} 权限，功能开发中...`)
}

// 删除按钮点击事件
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认要删除角色 ${row.roleName} 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消操作
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
    ElMessage.success('角色数据加载成功')
  }, 500)
})
</script>

<style scoped>
.role-container {
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
</style> 
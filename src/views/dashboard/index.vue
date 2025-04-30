<template>
  <div class="dashboard-container">
    <el-card shadow="never" class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用区块链监听管理后台</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="dashboard-card" shadow="hover">
            <div class="card-content">
              <el-icon class="card-icon"><Monitor /></el-icon>
              <div class="card-info">
                <div class="card-title">监听地址</div>
                <div class="card-value">128</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="dashboard-card" shadow="hover">
            <div class="card-content">
              <el-icon class="card-icon"><Link /></el-icon>
              <div class="card-info">
                <div class="card-title">公链数量</div>
                <div class="card-value">5</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="dashboard-card" shadow="hover">
            <div class="card-content">
              <el-icon class="card-icon"><Wallet /></el-icon>
              <div class="card-info">
                <div class="card-title">代币数量</div>
                <div class="card-value">32</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="dashboard-card" shadow="hover">
            <div class="card-content">
              <el-icon class="card-icon"><User /></el-icon>
              <div class="card-info">
                <div class="card-title">客户数量</div>
                <div class="card-value">24</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor, Link, Wallet, User } from '@element-plus/icons-vue'

onMounted(() => {
  ElMessage.success('欢迎访问区块链监听管理后台')
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 16px;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.dashboard-card {
  height: 120px;
  cursor: pointer;
  transition: all 0.3s;
}

.card-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.card-icon {
  font-size: 48px;
  color: var(--el-color-primary);
  margin-right: 20px;
  margin-left: 20px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}
</style> 
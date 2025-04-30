<template>
  <div class="login-container">
    <div class="login-form-container">
      <div class="login-title">区块链监听管理后台</div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: 'admin',
  password: '123456'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 模拟登录请求
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        localStorage.setItem('token', 'demo-token')
        ElMessage.success('登录成功')
        router.push('/')
      } catch (error) {
        console.error('登录失败', error)
        ElMessage.error('登录失败')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7f9;
}

.login-form-container {
  width: 400px;
  padding: 40px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #303133;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
}
</style> 
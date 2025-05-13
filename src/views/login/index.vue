<template>
  <div class="login-container">
    <div class="login-box">
      <div class="title">区块链监听管理后台</div>
      <el-form class="login-form" :model="loginForm">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :readonly="true"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :readonly="true"
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item>
          <div class="verify-code-container">
            <el-input
              v-model="loginForm.verifyCode"
              placeholder="请输入验证码"
              class="verify-code-input"
            />
            <div class="verify-code" @click="refreshVerifyCode">
              {{ verifyCode }}
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()

const loginForm = reactive({
  username: 'admin',
  password: '******',
  verifyCode: ''
})

// 生成随机验证码
const generateVerifyCode = () => {
  const characters = '0123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += characters[Math.floor(Math.random() * characters.length)]
  }
  return code
}

const verifyCode = ref(generateVerifyCode())

// 刷新验证码
const refreshVerifyCode = () => {
  verifyCode.value = generateVerifyCode()
  loginForm.verifyCode = ''
}

const handleLogin = () => {
  if (!loginForm.verifyCode) {
    ElMessage.error('请输入验证码')
    return
  }
  
  if (loginForm.verifyCode !== verifyCode.value) {
    ElMessage.error('验证码错误')
    refreshVerifyCode()
    return
  }

  localStorage.setItem('token', 'demo-token')
  router.push('/')
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #001529;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  font-size: 24px;
  color: #303133;
  margin-bottom: 40px;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
}

.verify-code-container {
  display: flex;
  gap: 20px;
  width: 100%;
}

.verify-code-input {
  flex: 1;
}

.verify-code {
  width: 100px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  background: #f0f2f5;
  color: #606266;
  font-size: 18px;
  font-family: Arial;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;
  flex-shrink: 0;
}

.verify-code:hover {
  background: #e6e8eb;
}
</style> 
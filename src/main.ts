import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import './styles/index.scss'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { appState } from './constants/appState'
import { addressList, addressChangeRecords, callbackRecords, blockchainList, tokenList, customerList, userList, roleList } from './constants/mockData'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 确保全局状态在应用启动时就被初始化
const initGlobalState = () => {
  // 清空现有数据
  appState.addressData.length = 0
  appState.addressRecordData.length = 0
  appState.callbackData.length = 0
  appState.blockchainData.length = 0
  appState.tokenData.length = 0
  appState.customerData.length = 0
  appState.userData.length = 0
  appState.roleData.length = 0
  
  // 添加新数据
  appState.addressData.push(...addressList)
  appState.addressRecordData.push(...addressChangeRecords)
  appState.callbackData.push(...callbackRecords)
  appState.blockchainData.push(...blockchainList)
  appState.tokenData.push(...tokenList)
  appState.customerData.push(...customerList)
  appState.userData.push(...userList)
  appState.roleData.push(...roleList)
}

// 在应用启动时初始化一次全局状态
initGlobalState()

// 添加全局导航守卫，确保每次路由切换时数据都是最新的
router.beforeEach((to, from, next) => {
  // 这里可以根据需要在特定路由下重新初始化数据
  if (to.path !== from.path) {
    console.log(`路由从 ${from.path} 切换到 ${to.path}，重新初始化数据`)
    initGlobalState()
  }
  next()
})

// 添加全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue全局错误:', err)
  console.info('错误信息:', info)
}

// 处理未捕获的Promise错误
window.addEventListener('unhandledrejection', event => {
  console.error('未处理的Promise错误:', event.reason)
})

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn,
  size: 'default',
  zIndex: 3000
})

app.mount('#app') 
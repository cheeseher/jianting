<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="layout-aside">
      <div class="logo-container">
        <div class="logo-wrapper" :style="{width: isCollapse ? '64px' : '210px'}">
          <span class="logo-text" v-show="!isCollapse">区块链监听管理后台</span>
          <span class="logo-mini" v-show="isCollapse">区</span>
        </div>
      </div>
      
      <el-scrollbar>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          :collapse="isCollapse"
          :collapse-transition="true"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse-tooltip="true"
          popper-effect="light"
          @select="handleMenuSelect"
        >
          <sidebar-item 
            v-for="route in routes" 
            :key="route.path" 
            :item="route" 
            :base-path="route.path" 
            :is-collapse="isCollapse"
          />
        </el-menu>
      </el-scrollbar>
    </el-aside>
    
    <el-container class="main-container">
      <!-- 头部 -->
      <el-header height="60px" class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleSidebar">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb class="breadcrumb" separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index" :to="item.path">
              {{ item.meta?.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-dropdown">
              <el-avatar size="small" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
                <el-dropdown-item divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouteRecordRaw } from 'vue-router'
import SidebarItem from './components/SidebarItem.vue'
import { Fold, Expand } from '@element-plus/icons-vue'

// 路由信息
const route = useRoute()
const router = useRouter()

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 获取路由
const routes = computed(() => {
  return router.options.routes.find(r => r.path === '/')?.children || []
})

// 当前激活的菜单
const activeMenu = computed(() => {
  // 完整的当前路径，例如：/customer/list
  const fullPath = route.path
  console.log('当前路由路径:', fullPath)
  return fullPath
})

// 面包屑
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched
})

// 自定义导航函数
const handleMenuSelect = (index: string) => {
  console.log('选择菜单项:', index)
  
  // 外部链接
  if (/^(https?:|mailto:|tel:)/.test(index)) {
    window.open(index, '_blank')
    return
  }
  
  // 内部路由
  try {
    router.push(index)
  } catch (error) {
    console.error('路由导航错误:', error)
  }
}

// 路由变化监听
watch(
  () => route.path,
  (newPath) => {
    console.log('路由变化 -> 路径:', newPath, '激活菜单:', activeMenu.value)
  },
  { immediate: true }
)
</script>

<style scoped>
.layout-container {
  height: 100%;
}

.layout-aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.logo-container {
  height: 60px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  background-color: #001529;
  border-bottom: 1px solid #002140;
}

.logo-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: width 0.3s;
}

.logo-text {
  font-size: 16px;
  font-weight: bold;
  white-space: nowrap;
  text-align: center;
}

.logo-mini {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.main-container {
  flex-direction: column;
  height: 100%;
}

.layout-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  margin-right: 16px;
  font-size: 18px;
  cursor: pointer;
  color: #333;
}

.breadcrumb {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

.layout-main {
  padding: 0;
  height: calc(100% - 60px);
  overflow: auto;
}

.el-menu-vertical {
  border-right: none;
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 210px;
}

.el-menu--collapse {
  width: 64px;
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style> 
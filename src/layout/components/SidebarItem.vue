<template>
  <div>
    <!-- 有子菜单的情况 -->
    <template v-if="hasChildren">
      <el-sub-menu 
        :index="resolvePath(item.path)" 
        :popper-append-to-body="true"
        :popperClass="isCollapse ? 'sidebar-popper' : ''"
      >
        <template #title>
          <el-icon v-if="item.meta && item.meta.icon"><component :is="item.meta.icon" /></el-icon>
          <span>{{ item.meta?.title || '' }}</span>
        </template>
        
        <sidebar-item
          v-for="child in (item.children || [])"
          :key="child.path"
          :item="child"
          :base-path="resolvePath(item.path)"
          :is-collapse="isCollapse"
        />
      </el-sub-menu>
    </template>
    
    <!-- 无子菜单的情况 -->
    <template v-else>
      <el-menu-item :index="resolvePath(item.path)">
        <el-icon v-if="item.meta && item.meta.icon"><component :is="item.meta.icon" /></el-icon>
        <template #title>{{ item.meta?.title || '' }}</template>
      </el-menu-item>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouteRecordRaw } from 'vue-router'

const props = defineProps({
  // 菜单项
  item: {
    type: Object as () => RouteRecordRaw,
    required: true
  },
  // 基础路径
  basePath: {
    type: String,
    required: true
  },
  // 是否折叠
  isCollapse: {
    type: Boolean,
    default: false
  }
})

// 是否有子菜单
const hasChildren = computed(() => {
  if (props.item.children) {
    return props.item.children.filter(child => {
      return child.meta && !child.meta.hidden
    }).length > 0
  }
  return false
})

// 解析路径
const resolvePath = (routePath: string): string => {
  // 外部链接直接返回
  if (/^(https?:|mailto:|tel:)/.test(routePath)) {
    return routePath
  }

  // 绝对路径直接返回
  if (routePath.startsWith('/')) {
    return routePath
  }

  // 处理子路由情况：父级是 /customer，子级是 list，结果应该是 /customer/list
  // 但目前出现了 /customer/customer/list 这种重复路径的情况
  
  // 对于子路由的情况，basePath 应该已经包含了父级路径
  // 例如，如果 basePath 是 /customer，routePath 是 list
  // 如果 basePath 是 customer，routePath 是 list

  // 1. 标准化 basePath，确保以 / 开头
  let base = props.basePath
  if (!base.startsWith('/')) {
    base = '/' + base
  }
  
  // 2. 检查路径最后一段是否与 routePath 第一段相同（避免重复）
  const baseSegments = base.split('/').filter(Boolean)
  const routeSegments = routePath.split('/').filter(Boolean)
  
  // 如果 basePath 的最后一段与 routePath 的第一段相同，移除 routePath 的第一段
  if (baseSegments.length > 0 && routeSegments.length > 0 && 
      baseSegments[baseSegments.length - 1] === routeSegments[0]) {
    routeSegments.shift()
  }
  
  // 3. 重新构建路径
  let finalPath = base
  if (finalPath.endsWith('/')) {
    finalPath = finalPath.slice(0, -1)  // 移除末尾的 /
  }
  
  if (routeSegments.length > 0) {
    finalPath += '/' + routeSegments.join('/')
  }
  
  console.log(`构建路径: basePath=${props.basePath}, routePath=${routePath} => 结果=${finalPath}`)
  return finalPath
}
</script>

<style scoped>
/* 确保菜单图标显示正确 */
.el-menu--collapse .el-sub-menu__title span {
  visibility: hidden;
}

/* 修复折叠时的弹出菜单样式 */
:deep(.el-menu--popup) {
  min-width: 180px;
}

/* 折叠时隐藏箭头 */
:deep(.el-sub-menu .el-sub-menu__icon-arrow) {
  transition: all 0.3s;
}

:deep(.sidebar-popper) {
  background-color: #001f3f !important;
  
  .el-menu--popup {
    background-color: #001f3f !important;
  }
  
  .el-menu-item {
    background-color: #001f3f !important;
    color: #fff;
    
    &:hover {
      background-color: #1890ff !important;
    }
    
    &.is-active {
      background-color: #1890ff !important;
      color: #fff;
    }
  }
}
</style> 
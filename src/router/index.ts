import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('../layout/index.vue'),
    redirect: '/monitor/address',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue'),
        meta: { title: '主页', icon: 'Odometer' }
      },
      {
        path: 'customer',
        name: 'Customer',
        component: () => import('../views/customer/index.vue'),
        meta: { title: '客户管理', icon: 'User' },
        redirect: '/customer/list',
        children: [
          {
            path: 'list',
            name: 'CustomerList',
            component: () => import('../views/customer/list/index.vue'),
            meta: { title: '客户列表' }
          }
        ]
      },
      {
        path: 'monitor',
        name: 'Monitor',
        component: () => import('../views/monitor/index.vue'),
        meta: { title: '监听管理', icon: 'Monitor' },
        redirect: '/monitor/address',
        children: [
          {
            path: 'address',
            name: 'AddressManage',
            component: () => import('../views/monitor/address/index.vue'),
            meta: { title: '地址管理' }
          },
          {
            path: 'address-record',
            name: 'AddressRecord',
            component: () => import('../views/monitor/address-record/index.vue'),
            meta: { title: '地址变动记录' }
          },
          {
            path: 'monitor-record',
            name: 'MonitorRecord',
            component: () => import('../views/monitor/monitor-record/index.vue'),
            meta: { title: '监听记录' }
          },
          {
            path: 'callback-record',
            name: 'CallbackRecord',
            component: () => import('../views/monitor/callback-record/index.vue'),
            meta: { title: '回调记录' }
          },
          {
            path: 'trigger-record',
            name: 'TriggerRecord',
            component: () => import('../views/monitor/trigger-record/index.vue'),
            meta: { title: '异常触发记录' }
          },
          {
            path: 'action-record',
            name: 'ActionRecord',
            component: () => import('../views/monitor/action-record/index.vue'),
            meta: { title: '动作执行记录' }
          },
          {
            path: 'gas-config',
            name: 'GasConfig',
            component: () => import('../views/monitor/gas-config/index.vue'),
            meta: { title: 'Gas 补充设置', parent: 'Monitor' }
          }
        ]
      },
      {
        path: 'blockchain',
        name: 'Blockchain',
        component: () => import('../views/blockchain/index.vue'),
        meta: { title: '公链管理', icon: 'Link' },
        redirect: '/blockchain/chain',
        children: [
          {
            path: 'chain',
            name: 'ChainManage',
            component: () => import('../views/blockchain/chain/index.vue'),
            meta: { title: '公链管理' }
          },
          {
            path: 'token',
            name: 'TokenManage',
            component: () => import('../views/blockchain/token/index.vue'),
            meta: { title: '代币管理' }
          }
        ]
      },
      {
        path: 'telegram',
        name: 'Telegram',
        component: () => import('../views/telegram/index.vue'),
        meta: { title: 'TG机器人', icon: 'ChatDotRound' },
        redirect: '/telegram/bot',
        children: [
          {
            path: 'bot',
            name: 'TelegramBot',
            component: () => import('../views/telegram/bot/index.vue'),
            meta: { title: 'TG机器人设置' }
          }
        ]
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('../views/system/index.vue'),
        meta: { title: '系统管理', icon: 'Setting' },
        redirect: '/system/user',
        children: [
          {
            path: 'user',
            name: 'UserManage',
            component: () => import('../views/system/user/index.vue'),
            meta: { title: '用户管理' }
          },
          {
            path: 'role',
            name: 'RoleManage',
            component: () => import('../views/system/role/index.vue'),
            meta: { title: '角色管理' }
          }
        ]
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/404.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 如果访问的不是登录页，且没有登录，则跳转到登录页
  if (to.path !== '/login' && !localStorage.getItem('token')) {
    next('/login')
  } else {
    next()
  }
})

export default router 
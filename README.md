# 区块链监听管理后台原型

基于Vue 3和Element Plus开发的区块链监听管理系统高保真原型。

## 项目概述

本项目是一个区块链监听管理后台原型，用于展示区块链监控、代币管理、地址监听等功能的界面设计和交互。

### 主要功能模块

1. **仪表盘**：展示系统概览数据，包括监听地址数量、公链数量、代币数量、客户数量等关键指标
2. **系统管理**：用户管理、角色管理等系统基础功能
3. **区块链管理**：公链管理、代币管理等区块链相关配置
4. **监控管理**：地址监控、交易监控等核心业务功能
5. **客户管理**：客户信息管理、客户配置等

## 界面设计规范

本项目严格遵循Element Plus的设计规范，确保界面风格统一、交互流畅。

### 1. 布局规范

- **页面结构**：采用"头部-侧边栏-内容区"的经典三段式布局
- **内容区域**：统一使用卡片（el-card）包装内容，增强区域划分
- **间距**：遵循统一的间距规则，页面外边距20px，区块间距16px

### 2. 筛选区域规范

- 使用el-card包装，设置shadow="never"
- 筛选项采用左对齐布局，按钮靠右对齐
- 下拉选择框统一宽度为168px

### 3. 表格区域规范

- 表格使用border和stripe属性，增强可读性
- 操作列固定在右侧，操作按钮使用link类型
- 操作按钮顺序：查看 > 编辑 > 其他 > 删除

### 4. 表单规范

- 标签宽度统一设置为100px
- 必填项使用required属性标记
- 表单按钮统一放置在底部，右对齐

## 组件使用指南

### 1. 筛选区域组件

```vue
<el-card shadow="never" class="filter-container">
  <el-form :model="queryParams" ref="queryFormRef" inline class="multi-line-filter-form">
    <div class="filter-line">
      <!-- 筛选项 -->
      <div class="filter-buttons">
        <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>
    </div>
  </el-form>
</el-card>
```

### 2. 表格工具栏组件

```vue
<div class="table-toolbar">
  <div class="left">
    <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
  </div>
  <div class="right">
    <el-button :icon="Refresh" circle @click="refreshTable" />
  </div>
</div>
```

### 3. 表格操作列

```vue
<el-table-column label="操作" width="180" fixed="right">
  <template #default="{ row }">
    <el-button link :icon="View" @click="handleView(row)">查看</el-button>
    <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
    <el-popconfirm title="确认删除?" @confirm="handleDelete(row)">
      <template #reference>
        <el-button link type="danger" :icon="Delete">删除</el-button>
      </template>
    </el-popconfirm>
  </template>
</el-table-column>
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 技术栈

- Vue 3
- Vite
- TypeScript
- Element Plus
- Vue Router
- Pinia

## 注意事项

1. 本项目为原型，主要关注界面设计和交互，不包含实际后端数据对接
2. 所有表格数据均为前端模拟数据，可以在对应文件中修改
3. 图表区域使用占位符表示，实际项目中可接入ECharts等图表库 
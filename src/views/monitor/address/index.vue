<template>
  <div class="page-container">
    <div class="address-list-container">
      <!-- 搜索区域 -->
      <el-card shadow="never" class="card-container">
        <div class="search-container">
          <div class="search-item">
            <span class="search-label">公链：</span>
            <el-select
              v-model="searchForm.chain"
              placeholder="全部"
              clearable
              class="filter-dropdown"
            >
              <el-option
                v-for="item in chainOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <span class="search-label">地址：</span>
            <el-input
              v-model="searchForm.address"
              placeholder="输入关键字"
              clearable
              style="width: 220px"
            />
          </div>
          
          <div class="search-item">
            <span class="search-label">添加时间：</span>
            <el-date-picker
              v-model="searchForm.timeRange"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              :shortcuts="dateShortcuts"
              style="width: 380px"
            />
          </div>
          
          <div class="search-buttons">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </el-card>
      
      <!-- 操作工具栏 -->
      <div class="table-toolbar">
        <div class="left">
          <el-button type="primary" @click="handleAddAddress">添加地址</el-button>
          
          <!-- 批量操作下拉菜单 -->
          <el-dropdown :disabled="!selectedRows.length" @command="handleBatchCommand">
            <el-button :disabled="!selectedRows.length">
              批量操作 <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="delete" :disabled="!selectedRows.length">批量删除</el-dropdown-item>
                <el-dropdown-item command="export" :disabled="!selectedRows.length">批量导出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          
          <el-button @click="handleExport">导出全部</el-button>
        </div>
        <div class="right">
          <span class="selected-count" v-if="selectedRows.length">已选择 {{ selectedRows.length }} 项</span>
        </div>
      </div>
      
      <!-- 数据表格 -->
      <el-table
        v-if="tableData.length > 0 || !tableLoading"
        ref="tableRef"
        v-loading="tableLoading"
        :data="tableData"
        border
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="地址" prop="address" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.address" placement="top">
              <span class="ellipsis-text">{{ row.address }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="公链" prop="chain" width="100" />
        <el-table-column label="客户" width="100">
          <template #default="{ row }">
            <span 
              v-if="row.customers && row.customers.length > 0"
              class="customer-number"
              @click="showCustomerRelationDialog(row)"
            >
              {{ row.customers.length }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="主币余额" prop="mainBalance" width="100" />
        <el-table-column label="代币余额" min-width="180">
          <template #default="{ row }">
            <div class="token-balance-cell">
              <div>
                {{ formatTokenBalance(row.tokenBalance, 2) }}
                <span v-if="getTokenCount(row.tokenBalance) > 2" class="view-all" @click.stop="(e) => showTokenDetails(row, e)">
                  全部
                </span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="监控币种" width="180">
          <template #default="{ row }">
            <el-popover
              placement="top-start"
              :width="380"
              trigger="hover"
              v-if="hasMonitorCurrency(row)"
            >
              <template #reference>
                <el-tag type="info" class="cursor-pointer">
                  {{ `监控${row.monitorChains?.length || 0}条公链 ${getMonitorTokenCount(row)}个代币` }}
                </el-tag>
              </template>
              <div class="monitor-currency-popover">
                <template v-if="row.monitorChains && row.monitorChains.length">
                  <div class="monitor-currency-title">监控公链:</div>
                  <div v-for="chain in row.monitorChains" :key="`popover-chain-${chain}`" class="currency-condition-row">
                    <el-tag size="small" class="monitor-chain-tag">{{ chain }}</el-tag>
                    <div class="condition-detail">
                      <template v-if="row.chainConditions && row.chainConditions[chain]">
                        <span>触发: {{ row.chainConditions[chain].triggerAmount }}</span>
                        <span>比例: {{ row.chainConditions[chain].maxPercentage }}%</span>
                        <span>动作: {{ formatActionShort(row.chainConditions[chain].triggerAction) }}</span>
                      </template>
                      <template v-else>-</template>
                    </div>
                  </div>
                </template>
                <template v-if="row.monitorTokens && row.monitorTokens.length">
                  <div class="monitor-currency-title">监控代币:</div>
                  <div v-for="tokenId in row.monitorTokens" :key="`popover-token-${tokenId}`" class="currency-condition-row">
                    <el-tag size="small" type="success" class="monitor-token-tag">{{ formatTokenId(tokenId) }}</el-tag>
                    <div class="condition-detail">
                      <template v-if="row.tokenConditions && row.tokenConditions[tokenId]">
                        <span>触发: {{ row.tokenConditions[tokenId].triggerAmount }}</span>
                        <span>比例: {{ row.tokenConditions[tokenId].maxPercentage }}%</span>
                        <span>动作: {{ formatActionShort(row.tokenConditions[tokenId].triggerAction) }}</span>
                      </template>
                      <template v-else>-</template>
                    </div>
                  </div>
                </template>
              </div>
            </el-popover>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="二次列表" width="300">
          <template #default="{ row }">
            <SecondaryListControl
              :address="row"
              @update="(updatedAddress) => handleSecondaryListUpdate(row, updatedAddress)"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.monitorStatus !== false ? 'success' : 'danger'">
              {{ row.monitorStatus !== false ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="添加时间" prop="addTime" width="180" />
        <el-table-column label="更新时间" prop="updateTime" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确认删除?" @confirm="handleDelete(row)">
              <template #reference>
                <el-button link type="danger" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
      
      <!-- 添加/编辑地址弹窗 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '添加地址' : '编辑地址'"
        width="800px"
        @closed="resetForm"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="120px"
        >
          <el-form-item label="监听地址" prop="address" required>
            <el-input v-model="form.address" placeholder="请输入监听地址" />
          </el-form-item>
          
          <el-form-item label="监听币种" prop="coinConfig">
            <el-radio-group v-model="form.coinConfig" @change="handleCoinConfigChange">
              <el-radio-button label="default">默认配置</el-radio-button>
              <el-radio-button label="custom">自定义</el-radio-button>
            </el-radio-group>
            <div class="coin-config-tip" v-if="form.coinConfig === 'default'">
              <div class="tip-content">
                <el-icon style="margin-right: 8px; color: #409EFF;"><InfoFilled /></el-icon>
                默认监听所有已配置的币种（主币 + 代币），并自动继承"公链管理"和"代币管理"中的规则。
              </div>
            </div>
          </el-form-item>
          
          <template v-if="form.coinConfig === 'custom'">
            <el-divider content-position="left">监控条件配置</el-divider>
            
            <el-form-item label="选择币种">
              <div class="currency-tabs">
                <el-tabs v-model="activeTabName" type="card" class="currency-condition-tabs">
                  <el-tab-pane label="主链监控" name="chain"></el-tab-pane>
                  <el-tab-pane label="代币监控" name="token"></el-tab-pane>
                </el-tabs>
                
                <div v-if="activeTabName === 'chain'" class="currency-condition-content">
                  <el-table 
                    :data="allChains" 
                    border 
                    style="width: 100%"
                    :header-cell-style="tableHeaderStyle"
                    :row-class-name="tableRowClassName"
                    stripe
                    highlight-current-row
                  >
                    <el-table-column label="公链" width="150" align="left">
                      <template #default="{ row }">
                        <div class="coin-name">{{ row.label || row }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100" align="center">
                      <template #default="{ row }">
                        <el-switch
                          v-model="chainStatusMap[row.value || row]"
                          active-color="#13ce66"
                          inactive-color="#ff4949"
                          @change="handleChainStatusChange(row.value || row)"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="单笔触发金额" width="180" align="center">
                      <template #default="{ row }">
                        <el-input
                          v-model="getChainCondition(row.value || row).triggerAmount"
                          size="small"
                          style="width: 130px"
                          :disabled="!chainStatusMap[row.value || row]"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="历史最大单笔金额百分比" width="240" align="center">
                      <template #default="{ row }">
                        <el-input-number
                          v-model="getChainCondition(row.value || row).maxPercentage"
                          size="small"
                          style="width: 130px"
                          :min="0"
                          :max="100"
                          :step="1"
                          :disabled="!chainStatusMap[row.value || row]"
                          :controls-position="'right'"
                        />
                        <span style="margin-left: 5px">%</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="触发动作" width="180" align="center">
                      <template #default="{ row }">
                        <el-select 
                          v-model="getChainCondition(row.value || row).triggerAction" 
                          size="small" 
                          style="width: 130px"
                          :disabled="!chainStatusMap[row.value || row]"
                        >
                          <el-option label="提交闪电转账" value="transfer" />
                          <el-option label="提交多签" value="multi-sign" />
                        </el-select>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
                
                <div v-else-if="activeTabName === 'token'" class="currency-condition-content">
                  <el-table 
                    :data="allTokens" 
                    border 
                    style="width: 100%"
                    :header-cell-style="tableHeaderStyle"
                    :row-class-name="tableRowClassName"
                    stripe
                    highlight-current-row
                  >
                    <el-table-column label="代币" width="150" align="left">
                      <template #default="{ row }">
                        <div class="coin-name">{{ formatTokenIdWithChain(row) }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100" align="center">
                      <template #default="{ row }">
                        <el-switch
                          v-model="tokenStatusMap[row]"
                          active-color="#13ce66"
                          inactive-color="#ff4949"
                          @change="handleTokenStatusChange(row)"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="单笔触发金额" width="180" align="center">
                      <template #default="{ row }">
                        <el-input
                          v-model="getTokenCondition(row).triggerAmount"
                          size="small"
                          style="width: 130px"
                          :disabled="!tokenStatusMap[row]"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="历史最大单笔金额百分比" width="240" align="center">
                      <template #default="{ row }">
                        <el-input-number
                          v-model="getTokenCondition(row).maxPercentage"
                          size="small"
                          style="width: 130px"
                          :min="0"
                          :max="100"
                          :step="1"
                          :disabled="!tokenStatusMap[row]"
                          :controls-position="'right'"
                        />
                        <span style="margin-left: 5px">%</span>
                      </template>
                    </el-table-column>
                    <el-table-column label="触发动作" width="180" align="center">
                      <template #default="{ row }">
                        <el-select 
                          v-model="getTokenCondition(row).triggerAction" 
                          size="small" 
                          style="width: 130px"
                          :disabled="!tokenStatusMap[row]"
                        >
                          <el-option label="提交闪电转账" value="transfer" />
                          <el-option label="提交多签" value="multi-sign" />
                        </el-select>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </el-form-item>
          </template>
          
          <el-form-item label="选择客户" prop="customers">
            <el-select
              v-model="form.customers"
              placeholder="请选择客户"
              multiple
              filterable
              collapse-tags
              collapse-tags-tooltip
              style="width: 100%"
            >
              <el-option
                v-for="item in customerOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="二次列表" prop="secondaryListMode">
            <div class="secondary-list-container">
              <el-select 
                v-model="conditionForm.secondaryListMode" 
                style="width: 220px"
                @change="handleEditSecondaryListModeChange"
              >
                <el-option label="关闭" value="" />
                <el-option label="手动开启" value="manual" />
                <el-option label="自动开启" value="auto" />
              </el-select>
              <el-tag 
                v-if="conditionForm.secondaryListMode" 
                :type="dialogType === 'add' || !conditionForm.isInSecondaryList ? 'warning' : 'success'"
                class="status-tag"
              >
                {{ dialogType === 'add' || !conditionForm.isInSecondaryList ? '待触发进入' : '已进入二次列表' }}
              </el-tag>
            </div>
          </el-form-item>
          
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="conditionForm.status"
              active-text="启用"
              inactive-text="禁用"
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
        </template>
      </el-dialog>
      
      <!-- 代币余额详情弹窗 -->
      <el-dialog
        v-model="tokenDetailsVisible"
        :title="`[${tokenDetailAddress?.address || '监听地址'}]代币余额`"
        width="500px"
      >
        <div v-if="tokenDetailAddress">
          <div class="search-area">
            <div class="search-input">
              <span class="label">代币：</span>
              <el-input
                v-model="tokenSearchKeyword"
                placeholder="输入代币名称"
                style="width: 220px"
              />
            </div>
            <div class="search-buttons">
              <el-button type="primary" @click="searchTokens">搜索</el-button>
              <el-button @click="resetTokenSearch">重置</el-button>
            </div>
          </div>
          
          <el-table
            :data="filteredTokens"
            border
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column label="代币名称" prop="token" min-width="140" />
            <el-table-column label="余额" prop="balance" min-width="120" align="right" />
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="tokenPagination.pageNum"
              :page-size="tokenPagination.pageSize"
              layout="total, prev, pager, next"
              :total="tokenPagination.total"
              @current-change="handleTokenPageChange"
            />
          </div>
        </div>
      </el-dialog>
      
      <!-- 客户关联弹窗 -->
      <el-dialog
        v-model="customerRelationVisible"
        :title="`[${customerRelationAddress?.address || ''}]关联客户`"
        width="700px"
      >
        <div v-if="customerRelationAddress" class="customer-relation-dialog">
          <div class="search-area">
            <div class="search-input">
              <span class="label">客户：</span>
              <el-input
                v-model="customerSearchKeyword"
                placeholder="输入客户ID/名称"
                style="width: 220px"
              />
            </div>
            <div class="search-buttons">
              <el-button type="primary" @click="searchCustomerRelation">搜索</el-button>
              <el-button @click="resetCustomerSearch">重置</el-button>
            </div>
          </div>
          
          <el-table
            v-loading="customerRelationLoading"
            :data="customerCount"
            border
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column label="客户ID" prop="id" min-width="120" />
            <el-table-column label="客户名称" prop="name" min-width="180" />
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="danger" @click="removeCustomerRelation(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-if="customerCount.length > 0"
              v-model:current-page="customerPagination.pageNum"
              :page-size="customerPagination.pageSize"
              layout="total, prev, pager, next"
              :total="customerPagination.total"
              @current-change="handleCustomerPageChange"
            />
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch, h } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import type { MonitorAddress, CurrencyCondition } from '@/types/monitor'
import { chainOptions } from '@/constants/options'
import { deleteAddress, batchDeleteAddress, addAddress } from '@/constants/mockApi'
import { ArrowDown, Edit, Delete, InfoFilled } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { appState } from '@/constants/appState'
import SecondaryListControl from '@/components/SecondaryListControl.vue'
import { tokenList, blockchainList } from '@/constants/mockData'

// 表格样式
const tableHeaderStyle = () => {
  return {
    background: '#f5f7fa',
    color: '#606266',
    fontWeight: 'bold',
    borderBottom: '1px solid #EBEEF5',
    padding: '12px 0',
    height: '48px'
  }
}

// 表格行样式
const tableRowClassName = ({ row, rowIndex }: { row: any; rowIndex: number }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 搜索表单
const searchForm = reactive({
  chain: '',
  address: '',
  customerId: '',
  timeRange: [] as string[]
})

// 币种选择临时变量
const chainSelectionTemp = ref<string[]>([])
const tokenSelectionTemp = ref<string[]>([])
const tokenSearchKeyword = ref('')
const activeTabName = ref('chain')  // 当前激活的标签页，默认为主链监控

// 币种状态管理
const chainStatusMap = ref<Record<string, boolean>>({})
const tokenStatusMap = ref<Record<string, boolean>>({})
const tokenFilterKeyword = ref('')
const tokenCurrentPage = ref(1)
const tokenPageSize = 10

// 获取所有公链
const allChains = computed(() => {
  return chainOptions.filter(item => item.value)
})

// 获取所有代币
const allTokens = computed(() => {
  const tokens: string[] = []
  blockchainList.forEach(blockchain => {
    const chainTokens = getTokensByChain(blockchain.name)
      .map(token => `${blockchain.name}-${token.id}`)
    tokens.push(...chainTokens)
  })
  return tokens
})

// 根据关键词过滤后的代币
const filteredAllTokens = computed(() => {
  if (!tokenFilterKeyword.value) return allTokens.value
  
  return allTokens.value.filter(tokenId => {
    const tokenInfo = formatTokenIdWithChain(tokenId).toLowerCase()
    return tokenInfo.includes(tokenFilterKeyword.value.toLowerCase())
  })
})

// 分页后的代币列表
const filteredCurrencyTokens = computed(() => {
  const start = (tokenCurrentPage.value - 1) * tokenPageSize
  const end = start + tokenPageSize
  return filteredAllTokens.value.slice(start, end)
})

// 处理代币分页变化
const handleTokenPageChange = (page: number) => {
  tokenCurrentPage.value = page
}

// 初始化币种监控条件
const initializeCurrencyStatus = () => {
  // 初始化所有公链状态（默认全部启用）
  allChains.value.forEach(chain => {
    const chainId = chain.value as string
    chainStatusMap.value[chainId] = true
    
    // 初始化监控条件
    if (!conditionForm.chainConditions[chainId]) {
      conditionForm.chainConditions[chainId] = {
        triggerAmount: 100,
        maxPercentage: 110,
        triggerAction: 'transfer'
      }
    }
  })
  
  // 初始化所有代币状态（默认全部启用）
  allTokens.value.forEach(tokenId => {
    tokenStatusMap.value[tokenId] = true
    
    // 初始化监控条件
    if (!conditionForm.tokenConditions[tokenId]) {
      conditionForm.tokenConditions[tokenId] = {
        triggerAmount: 50,
        maxPercentage: 100,
        triggerAction: 'transfer'
      }
    }
  })
}

// 处理公链状态变化
const handleChainStatusChange = (chain: string) => {
  const status = chainStatusMap.value[chain]
  
  if (status) {
    // 启用监控，添加到监控列表
    if (!conditionForm.monitorChains.includes(chain)) {
      conditionForm.monitorChains.push(chain)
    }
  } else {
    // 禁用监控，从监控列表移除
    const index = conditionForm.monitorChains.indexOf(chain)
    if (index !== -1) {
      conditionForm.monitorChains.splice(index, 1)
    }
  }
}

// 处理代币状态变化
const handleTokenStatusChange = (tokenId: string) => {
  const status = tokenStatusMap.value[tokenId]
  
  if (status) {
    // 启用监控，添加到监控列表
    if (!conditionForm.monitorTokens.includes(tokenId)) {
      conditionForm.monitorTokens.push(tokenId)
    }
  } else {
    // 禁用监控，从监控列表移除
    const index = conditionForm.monitorTokens.indexOf(tokenId)
    if (index !== -1) {
      conditionForm.monitorTokens.splice(index, 1)
    }
  }
}

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  }
]

// 表格数据
const tableData = ref<MonitorAddress[]>([])
const tableLoading = ref(false)
const selectedRows = ref<MonitorAddress[]>([])

// 分页
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 标签页状态
const activeTab = ref('basicInfo')

// 弹窗相关
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 监控条件相关
const conditionFormRef = ref<FormInstance>()
const conditionForm = reactive({
  secondaryListMode: '' as '' | 'manual' | 'auto',
  isInSecondaryList: false,
  status: true,
  // 币种监控条件数据
  monitorChains: [] as string[],
  monitorTokens: [] as string[],
  // 为每个币种存储单独的监控条件
  chainConditions: {} as Record<string, {
    triggerAmount: number,
    maxPercentage: number,
    triggerAction: 'transfer' | 'multi-sign'
  }>,
  tokenConditions: {} as Record<string, {
    triggerAmount: number,
    maxPercentage: number,
    triggerAction: 'transfer' | 'multi-sign'
  }>
})
const conditionRules = reactive<FormRules>({
  monitorChains: [
    { type: 'array', message: '请选择至少一条公链', trigger: 'change' }
  ]
})

// 代币余额详情相关
const tokenDetailsVisible = ref(false)
const tokenDetailAddress = ref<MonitorAddress | null>(null)
const tokenPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 解析代币余额为数组格式
const tokenBalanceArray = computed(() => {
  if (!tokenDetailAddress.value || !tokenDetailAddress.value.tokenBalance) return []
  
  const result: { token: string, balance: string }[] = []
  const lines = tokenDetailAddress.value.tokenBalance.split('\n')
  
  lines.forEach(line => {
    const parts = line.split(':')
    if (parts.length === 2) {
      const token = parts[0].trim()
      const balance = parts[1].trim()
      result.push({ token, balance })
    }
  })
  
  return result
})

// 根据搜索关键词过滤代币
const filteredTokens = computed(() => {
  const keyword = tokenSearchKeyword.value.toLowerCase()
  let result = tokenBalanceArray.value
  
  if (keyword) {
    result = result.filter(item => 
      item.token.toLowerCase().includes(keyword)
    )
  }
  
  // 更新分页总数
  tokenPagination.total = result.length
  
  // 应用分页
  const start = (tokenPagination.pageNum - 1) * tokenPagination.pageSize
  const end = Math.min(start + tokenPagination.pageSize, result.length)
  return result.slice(start, end)
})

// 搜索代币
const searchTokens = () => {
  tokenPagination.pageNum = 1
}

// 重置代币搜索
const resetTokenSearch = () => {
  tokenSearchKeyword.value = ''
  tokenPagination.pageNum = 1
}

// 表单数据
const form = reactive({
  id: '',
  address: '',
  chain: '',
  customers: [] as string[],
  addTime: '',
  updateTime: '',
  coinConfig: 'default' as 'default' | 'custom' // 新增字段，用于控制是否自定义监控条件
})

// 表单校验规则
const rules = {
  address: [
    { required: true, message: '请输入监听地址', trigger: 'blur' },
    { min: 10, message: '地址长度不能少于10个字符', trigger: 'blur' }
  ]
}

// 路由相关
const route = useRoute()
const router = useRouter()

// 获取地址列表
const fetchAddressList = () => {
  tableLoading.value = true
  
  try {
    // 直接使用全局状态数据，无需异步操作
    let filteredData = [...appState.addressData]
    
    // 应用过滤器
    if (searchForm.chain) {
      filteredData = filteredData.filter(item => item.chain === searchForm.chain)
    }
    
    if (searchForm.address) {
      filteredData = filteredData.filter(item => item.address.includes(searchForm.address as string))
    }
    
    if (searchForm.customerId) {
      filteredData = filteredData.filter(item => {
        // 检查客户ID是否在customers数组中或等于customer字段
        return (
          (item.customers && item.customers.includes(searchForm.customerId)) || 
          item.customer === searchForm.customerId
        )
      })
    }
    
    // 为每个地址填充监控条件数据和客户数据
    filteredData = filteredData.map(item => {
      // 模拟每个地址的监控条件数据
      const monitorCondition = generateMockMonitorCondition(item.id || '')
      
      // 模拟每个地址的客户数据
      const customers = item.customers || (item.customer ? [item.customer] : generateRandomCustomers(item.id || ''))
      
      return {
        ...item,
        ...monitorCondition,
        customers,
        secondaryListMode: 'auto', // 设置所有地址为自动模式
        isInSecondaryList: false // 设置为待触发状态
      }
    })
    
    tableData.value = filteredData
    pagination.total = filteredData.length
  } catch (error) {
    console.error('获取数据失败', error)
    tableData.value = []
    pagination.total = 0
  } finally {
    tableLoading.value = false
  }
}

// 生成模拟监控条件数据
const generateMockMonitorCondition = (addressId: string) => {
  // 基于地址ID生成一些模拟属性
  const firstChar = addressId.charCodeAt(0) || 0
  const hasCondition = firstChar % 4 !== 3 // 25%的地址没有监控条件
  
  if (!hasCondition) {
    return {
      monitorStatus: firstChar % 5 !== 0, // 80%的地址启用状态
      maxPercentage: 0 // 没有条件时，比例为0
    }
  }
  
  // 生成随机监控公链
  const mockChains: string[] = []
  const allChains = chainOptions.filter(item => item.value).map(item => item.value as string)
  
  // 决定监控的公链数量（0-3个）
  const chainCount = firstChar % 4
  for (let i = 0; i < chainCount; i++) {
    const chainIndex = (firstChar + i) % allChains.length
    const chain = allChains[chainIndex]
    if (chain && !mockChains.includes(chain)) {
      mockChains.push(chain)
    }
  }
  
  // 生成随机监控代币
  const mockTokens = []
  
  // 为每个监控的公链选择1-2个代币
  for (const chain of mockChains) {
    const chainsTokens = tokenList.filter(token => token.blockchain === chain)
    if (chainsTokens.length > 0) {
      const tokenCount = (firstChar % 3) + 1 // 每个公链1-3个代币
      for (let i = 0; i < Math.min(tokenCount, chainsTokens.length); i++) {
        const tokenIndex = (firstChar + i) % chainsTokens.length
        const token = chainsTokens[tokenIndex]
        if (token) {
          mockTokens.push(`${chain}-${token.id}`)
        }
      }
    }
  }
  
  // 为每个公链生成单独的监控条件
  const mockChainConditions: Record<string, CurrencyCondition> = {}
  for (const chain of mockChains) {
    // 基于公链名第一个字符生成差异化的监控条件
    const chainChar = chain.charCodeAt(0) || 0
    mockChainConditions[chain] = {
      triggerAmount: 100 * ((chainChar % 5) + 1),
      maxPercentage: 110 + (chainChar % 5) * 10,
      triggerAction: chainChar % 3 === 0 ? 'transfer' : 'multi-sign'
    }
  }
  
  // 为每个代币生成单独的监控条件
  const mockTokenConditions: Record<string, CurrencyCondition> = {}
  for (const tokenId of mockTokens) {
    // 基于tokenId生成差异化的监控条件
    const tokenChar = tokenId.charCodeAt(0) || 0
    mockTokenConditions[tokenId] = {
      triggerAmount: 50 * ((tokenChar % 5) + 1),
      maxPercentage: 100 + (tokenChar % 5) * 10,
      triggerAction: tokenChar % 3 === 0 ? 'transfer' : 'multi-sign'
    }
  }
  
  return {
    monitorStatus: firstChar % 5 !== 0, // 80%的地址启用状态
    // 添加币种监控条件
    monitorChains: mockChains,
    monitorTokens: mockTokens,
    chainConditions: mockChainConditions,
    tokenConditions: mockTokenConditions,
    maxPercentage: 0 // 没有条件时，比例为0
  }
}

// 生成随机客户列表
const generateRandomCustomers = (addressId: string): string[] => {
  const firstChar = addressId.charCodeAt(0) || 0
  const customersCount = appState.customerData.length
  
  if (customersCount === 0) {
    return []
  }
  
  // 根据地址ID生成一致的随机客户数量（1-3个）
  const count = (firstChar % 3) + 1
  const result: string[] = []
  
  for (let i = 0; i < count; i++) {
    const index = (firstChar + i) % customersCount
    const customer = appState.customerData[index]
    if (customer && !result.includes(customer.id)) {
      result.push(customer.id)
    }
  }
  
  return result
}

// 监听路由变化，确保每次进入页面时数据都会重新加载
watch(() => route.fullPath, () => {
  fetchAddressList()
}, { immediate: true })

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1
  fetchAddressList()
}

// 重置搜索
const handleReset = () => {
  searchForm.chain = ''
  searchForm.address = ''
  searchForm.customerId = ''
  searchForm.timeRange = []
  pagination.pageNum = 1
  fetchAddressList()
}

// 分页事件处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  fetchAddressList()
}

const handleCurrentChange = (current: number) => {
  pagination.pageNum = current
  fetchAddressList()
}

// 表格选择事件
const handleSelectionChange = (rows: MonitorAddress[]) => {
  selectedRows.value = rows
}

// 批量操作命令处理
const handleBatchCommand = (command: string) => {
  if (command === 'delete') {
    handleBatchDelete()
  } else if (command === 'export') {
    handleBatchExport()
  }
}

// 批量导出
const handleBatchExport = () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  ElMessage.success(`已导出${selectedRows.value.length}条记录`)
}

// 添加地址
const handleAddAddress = () => {
  dialogType.value = 'add'
  resetForm()
  
  // 默认选择默认配置
  form.coinConfig = 'default'
  
  // 设置默认二次列表和状态
  conditionForm.secondaryListMode = 'auto'
  conditionForm.status = true
  
  dialogVisible.value = true
}

// 编辑地址
const handleEdit = (row: MonitorAddress) => {
  resetForm()
  dialogType.value = 'edit'
  
  // 复制基本信息
  form.id = row.id || ''
  form.address = row.address
  form.addTime = row.addTime
  form.updateTime = row.updateTime
  
  // 处理客户信息
  if (row.customers && row.customers.length > 0) {
    form.customers = [...row.customers]
  } else if (row.customer) {
    // 兼容旧数据
    form.customers = [row.customer]
  } else {
    form.customers = []
  }
  
  // 填充监控条件表单
  conditionForm.secondaryListMode = row.secondaryListMode || ''
  conditionForm.isInSecondaryList = row.isInSecondaryList || false
  conditionForm.status = row.monitorStatus !== undefined ? row.monitorStatus : true
  
  // 判断是否使用自定义配置（如果有设置监控条件，则认为是自定义）
  const hasCustomConfig = (row.monitorChains && row.monitorChains.length > 0) || 
                          (row.monitorTokens && row.monitorTokens.length > 0)
  
  form.coinConfig = hasCustomConfig ? 'custom' : 'default'
  
  // 填充币种监控条件
  conditionForm.monitorChains = row.monitorChains || []
  conditionForm.monitorTokens = row.monitorTokens || []
  
  // 填充每个币种的监控条件
  if (row.chainConditions) {
    conditionForm.chainConditions = JSON.parse(JSON.stringify(row.chainConditions))
  }
  
  if (row.tokenConditions) {
    conditionForm.tokenConditions = JSON.parse(JSON.stringify(row.tokenConditions))
  }
  
  // 初始化币种状态
  if (form.coinConfig === 'custom') {
    // 初始化币种状态Map
    chainStatusMap.value = {}
    tokenStatusMap.value = {}
    
    // 设置已配置公链的状态为开启
    allChains.value.forEach(chain => {
      const chainId = chain.value as string
      chainStatusMap.value[chainId] = conditionForm.monitorChains.includes(chainId)
    })
    
    // 设置已配置代币的状态为开启
    allTokens.value.forEach(tokenId => {
      tokenStatusMap.value[tokenId] = conditionForm.monitorTokens.includes(tokenId)
    })
  }
  
  dialogVisible.value = true
}

// 删除地址
const handleDelete = async (row: MonitorAddress) => {
  try {
    if (!row.id) return
    await deleteAddress(row.id)
    ElMessage.success('删除成功')
    fetchAddressList()
  } catch (error) {
    console.error('删除失败', error)
    ElMessage.error('删除失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请至少选择一条记录')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认批量删除选中的地址?', '提示', {
      type: 'warning'
    })
    
    const ids = selectedRows.value
      .filter(row => row.id)
      .map(row => row.id as string)
      
    if (ids.length === 0) return
    
    await batchDeleteAddress(ids)
    ElMessage.success('批量删除成功')
    fetchAddressList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出
const handleExport = () => {
  ElMessage.success('导出成功')
}

// 查看代币余额详情
const showTokenDetails = (row: MonitorAddress, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }
  tokenDetailAddress.value = row
  tokenDetailsVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitLoading.value = true
    try {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
      const data: MonitorAddress = {
        id: form.id,
        address: form.address,
        chain: 'ETH', // 默认设置为ETH
        customers: form.customers,
        mainBalance: '0',
        tokenBalance: '',
        addTime: form.addTime || now,
        updateTime: now,
        secondaryListMode: conditionForm.secondaryListMode, // 使用用户选择的二次列表模式
        isInSecondaryList: false, // 新增地址时默认为未进入状态
        monitorStatus: conditionForm.status,
        maxPercentage: 0 // 新增地址时，比例为0
      }
      
      // 根据用户选择的币种配置方式来处理
      if (form.coinConfig === 'default') {
        // 使用默认配置：监听所有币种，继承公链和代币管理规则
        const allChainsData = allChains.value.map(item => item.value as string);
        data.monitorChains = allChainsData;
        
        const allTokensData = allTokens.value;
        data.monitorTokens = allTokensData;
        
        // 为每个公链和代币设置默认规则
        const chainConditions: Record<string, CurrencyCondition> = {};
        allChainsData.forEach(chain => {
          chainConditions[chain] = {
            triggerAmount: 100, // 默认值，实际应从公链管理中获取
            maxPercentage: 110, // 默认值，实际应从公链管理中获取
            triggerAction: 'transfer' // 默认值，实际应从公链管理中获取
          };
        });
        data.chainConditions = chainConditions;
        
        const tokenConditions: Record<string, CurrencyCondition> = {};
        allTokensData.forEach(tokenId => {
          tokenConditions[tokenId] = {
            triggerAmount: 50, // 默认值，实际应从代币管理中获取
            maxPercentage: 100, // 默认值，实际应从代币管理中获取
            triggerAction: 'transfer' // 默认值，实际应从代币管理中获取
          };
        });
        data.tokenConditions = tokenConditions;
      } 
      else if (form.coinConfig === 'custom') {
        // 使用自定义配置：用户设置的币种和条件
        // 根据开关状态筛选实际监控的币种
        const activeChains = allChains.value
          .map(item => item.value as string)
          .filter(chain => chainStatusMap.value[chain]);
        
        const activeTokens = allTokens.value
          .filter(tokenId => tokenStatusMap.value[tokenId]);
        
        // 设置监控的币种
        data.monitorChains = activeChains;
        data.monitorTokens = activeTokens;
        
        // 筛选出实际需要的条件
        const filteredChainConditions: Record<string, CurrencyCondition> = {};
        activeChains.forEach(chain => {
          filteredChainConditions[chain] = conditionForm.chainConditions[chain] || {
            triggerAmount: 100,
            maxPercentage: 110,
            triggerAction: 'transfer'
          };
        });
        
        const filteredTokenConditions: Record<string, CurrencyCondition> = {};
        activeTokens.forEach(tokenId => {
          filteredTokenConditions[tokenId] = conditionForm.tokenConditions[tokenId] || {
            triggerAmount: 50,
            maxPercentage: 100,
            triggerAction: 'transfer'
          };
        });
        
        data.chainConditions = filteredChainConditions;
        data.tokenConditions = filteredTokenConditions;
      }
      
      await addAddress(data)
      ElMessage.success(dialogType.value === 'add' ? '添加成功' : '更新成功')
      dialogVisible.value = false
      fetchAddressList()
    } catch (error) {
      console.error('操作失败', error)
      ElMessage.error('操作失败')
    } finally {
      submitLoading.value = false
    }
  })
}

// 重置表单
const resetForm = () => {
  form.id = ''
  form.address = ''
  form.customers = []
  form.addTime = ''
  form.updateTime = ''
  form.coinConfig = 'default' // 重置监控条件配置
  
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  // 重置监控条件表单，但保留二次列表设置
  conditionForm.secondaryListMode = dialogType.value === 'add' ? 'auto' : ''
  conditionForm.isInSecondaryList = false
  conditionForm.status = true
  
  // 清空监控条件（但不立即重置，而是在对话框打开时根据dialogType进行适当的初始化）
  conditionForm.monitorChains = []
  conditionForm.monitorTokens = []
  conditionForm.chainConditions = {}
  conditionForm.tokenConditions = {}
  
  // 切换到基本信息标签
  activeTab.value = 'basicInfo'
}

// 格式化触发动作
const formatTriggerAction = (action: string) => {
  const actionMap: Record<string, string> = {
    'transfer': '提交闪电转账',
    'multi-sign': '提交多签'
  }
  return actionMap[action] || action
}

// 格式化触发动作（简短版）
const formatActionShort = (action: string) => {
  const actionMap: Record<string, string> = {
    'transfer': '闪电转账',
    'multi-sign': '多签'
  }
  return actionMap[action] || action
}

// 客户选项
const customerOptions = computed(() => {
  return appState.customerData.map(item => ({
    value: item.id,
    label: `(${item.id}) ${item.name}`
  }))
})

// 获取客户名称
const getCustomerName = (id: string) => {
  const customer = appState.customerData.find(item => item.id === id)
  return customer ? `(${customer.id}) ${customer.name}` : id
}

// 用于地址关联客户弹窗的数据
const customerRelationVisible = ref(false)
const customerRelationAddress = ref<MonitorAddress | null>(null)
const customerSearchKeyword = ref('')
const customerRelationLoading = ref(false)
const customerPagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 过滤后的客户列表
const filteredCustomers = computed(() => {
  if (!customerRelationAddress.value || !customerRelationAddress.value.customers) return []
  
  // 获取客户详细信息
  const customers = customerRelationAddress.value.customers.map(id => {
    const customer = appState.customerData.find(c => c.id === id)
    return customer || { id, name: id }
  })
  
  // 根据关键词筛选
  const keyword = customerSearchKeyword.value.toLowerCase()
  if (!keyword) return customers
  
  return customers.filter(c => 
    c.id.toLowerCase().includes(keyword) || 
    c.name.toLowerCase().includes(keyword)
  )
})

// 显示关联客户弹窗
const showCustomerRelationDialog = (row: MonitorAddress) => {
  customerRelationAddress.value = row
  customerSearchKeyword.value = ''
  customerPagination.pageNum = 1
  customerRelationVisible.value = true
  
  // 计算总数
  if (row.customers) {
    customerPagination.total = row.customers.length
  }
}

// 搜索关联客户
const searchCustomerRelation = () => {
  customerPagination.pageNum = 1
  // 实际项目中这里需要重新加载数据
}

// 重置客户搜索
const resetCustomerSearch = () => {
  customerSearchKeyword.value = ''
  customerPagination.pageNum = 1
  // 实际项目中这里需要重新加载数据
}

// 移除客户关联
const removeCustomerRelation = (customerId: string) => {
  if (!customerRelationAddress.value || !customerRelationAddress.value.customers) return
  
  ElMessageBox.confirm(
    '删除后，该客户将无法收到此地址的交易通知。',
    '系统提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 实际项目中这里需要调用API
    if (customerRelationAddress.value && customerRelationAddress.value.customers) {
      customerRelationAddress.value.customers = customerRelationAddress.value.customers.filter(id => id !== customerId)
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 处理客户分页
const handleCustomerPageChange = (page: number) => {
  customerPagination.pageNum = page
  // 实际项目中这里需要重新加载数据
}

const customerCount = computed(() => {
  const start = (customerPagination.pageNum - 1) * customerPagination.pageSize
  const end = Math.min(start + customerPagination.pageSize, filteredCustomers.value.length)
  return filteredCustomers.value.slice(start, end)
})

// 格式化代币余额，只显示最多maxCount种代币
const formatTokenBalance = (tokenBalance: string | undefined, maxCount: number): string => {
  if (!tokenBalance) return '-'
  
  const lines = tokenBalance.split('\n')
  if (lines.length <= maxCount) return tokenBalance
  
  return lines.slice(0, maxCount).join('\n')
}

// 获取代币数量
const getTokenCount = (tokenBalance: string | undefined): number => {
  if (!tokenBalance) return 0
  return tokenBalance.split('\n').length
}

// 状态变更处理
const handleStatusChange = (row: MonitorAddress, value: boolean) => {
  if (value) {
    confirmEnable(row)
  } else {
    confirmDisable(row)
  }
}

// 二次列表状态变更处理
const handleSecondaryListChange = async (row: MonitorAddress) => {
  if (row.secondaryListMode === 'manual') {
    // 手动开启确认
    try {
      await ElMessageBox.confirm(
        '手动开启后，该地址的所有交易将直接自动执行闪电转账，无需命中监控条件。确认开启？',
        '确认手动开启',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      row.isInSecondaryList = true
      ElMessage.success('已手动开启二次列表')
    } catch {
      // 用户取消，恢复状态
      row.secondaryListMode = ''
    }
  } 
  else if (row.secondaryListMode === 'auto') {
    // 自动开启确认
    try {
      await ElMessageBox.confirm(
        '自动模式下，当该地址首次命中监控条件时，将自动加入二次列表。确认设置？',
        '确认自动模式',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      row.isInSecondaryList = false
      ElMessage.success('已设置为自动模式，等待触发条件')
    } catch {
      // 用户取消，恢复状态
      row.secondaryListMode = ''
    }
  }
  else {
    // 关闭确认
    if (row.isInSecondaryList) {
      try {
        await ElMessageBox.confirm(
          '关闭后，该地址将退出二次列表，恢复使用监控条件判断。确认关闭？',
          '确认关闭',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        row.isInSecondaryList = false
        ElMessage.success('已关闭二次列表')
      } catch {
        // 用户取消，恢复为之前的状态
        row.secondaryListMode = row.isInSecondaryList ? 'manual' : 'auto'
      }
    }
  }
}

// 确认启用
const confirmEnable = (row: MonitorAddress) => {
  ElMessageBox.confirm(
    `确定要启用该监听地址的监控状态吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ElMessage.success('启用成功')
    })
    .catch(() => {
      // 用户取消，恢复状态
      if (row.monitorStatus !== undefined) {
        row.monitorStatus = false
      }
    })
}

// 确认禁用
const confirmDisable = (row: MonitorAddress) => {
  ElMessageBox.confirm(
    `确定要禁用该监听地址的监控状态吗？`,
    '系统提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(() => {
      ElMessage.success('禁用成功')
    })
    .catch(() => {
      // 用户取消，恢复状态
      if (row.monitorStatus !== undefined) {
        row.monitorStatus = true
      }
    })
}

// 处理二次列表更新
const handleSecondaryListUpdate = (row: MonitorAddress, updatedAddress: MonitorAddress) => {
  Object.assign(row, updatedAddress)
  // 实际项目中这里需要调用API保存更新
  ElMessage.success('更新成功')
}

// 处理编辑弹窗中二次列表模式变更
const handleEditSecondaryListModeChange = async (value: string) => {
  if (value === 'manual') {
    try {
      await ElMessageBox.confirm(
        '手动开启后，该地址的所有交易将直接自动执行闪电转账，无需命中监控条件。确认开启？',
        '确认手动开启',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      conditionForm.isInSecondaryList = true
    } catch {
      // 用户取消，恢复状态
      conditionForm.secondaryListMode = ''
      conditionForm.isInSecondaryList = false
    }
  } else if (value === 'auto') {
    try {
      await ElMessageBox.confirm(
        '自动模式下，当该地址首次命中监控条件时，将自动加入二次列表。确认设置？',
        '确认自动模式',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      conditionForm.isInSecondaryList = false
    } catch {
      // 用户取消，恢复状态
      conditionForm.secondaryListMode = ''
    }
  } else {
    // 关闭时
    if (conditionForm.isInSecondaryList) {
      try {
        await ElMessageBox.confirm(
          '关闭后，该地址将退出二次列表，恢复使用监控条件判断。确认关闭？',
          '确认关闭',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        conditionForm.isInSecondaryList = false
      } catch {
        // 用户取消，恢复为之前的状态
        conditionForm.secondaryListMode = conditionForm.isInSecondaryList ? 'manual' : 'auto'
      }
    }
  }
}

// 初始化监控条件
const initializeMonitorConditions = () => {
  // 设置监控所有公链
  const allChains = chainOptions.filter(item => item.value).map(item => item.value as string);
  conditionForm.monitorChains = allChains;
  
  // 设置监控所有代币
  const allTokens: string[] = [];
  blockchainList.forEach(chain => {
    const chainTokens = tokenList.filter(token => token.blockchain === chain.name)
      .map(token => `${chain.name}-${token.id}`);
    allTokens.push(...chainTokens);
  });
  conditionForm.monitorTokens = allTokens;
  
  // 为每个公链设置默认监控条件
  allChains.forEach(chain => {
    conditionForm.chainConditions[chain] = {
      triggerAmount: 100, // 默认值，实际应从公链管理中获取
      maxPercentage: 110, // 默认值，实际应从公链管理中获取
      triggerAction: 'transfer' // 默认值，实际应从公链管理中获取
    };
  });
  
  // 为每个代币设置默认监控条件
  allTokens.forEach(tokenId => {
    conditionForm.tokenConditions[tokenId] = {
      triggerAmount: 50, // 默认值，实际应从代币管理中获取
      maxPercentage: 100, // 默认值，实际应从代币管理中获取
      triggerAction: 'transfer' // 默认值，实际应从代币管理中获取
    };
  });
}

// 从mockData中获取特定公链的代币列表
const getTokensByChain = (chain: string) => {
  return tokenList.filter(token => token.blockchain === chain)
}

// 判断地址是否有监控币种
const hasMonitorCurrency = (row: MonitorAddress) => {
  return (row.monitorChains && row.monitorChains.length > 0) || 
         (row.monitorTokens && row.monitorTokens.length > 0)
}

// 获取监控代币数量
const getMonitorTokenCount = (row: MonitorAddress) => {
  return row.monitorTokens?.length || 0
}

// 格式化代币ID
const formatTokenId = (tokenId: string) => {
  if (!tokenId) return ''
  
  const [chain, id] = tokenId.split('-')
  if (!chain || !id) return tokenId
  
  const token = tokenList.find(t => t.id === id && t.blockchain === chain)
  return token ? token.symbol : tokenId
}

// 获取公链监控条件
const getChainCondition = (chain: string) => {
  if (!conditionForm.chainConditions[chain]) {
    // 初始化新的公链监控条件（使用默认值）
    conditionForm.chainConditions[chain] = {
      triggerAmount: 100,
      maxPercentage: 110,
      triggerAction: 'transfer'
    }
  }
  return conditionForm.chainConditions[chain]
}

// 获取代币监控条件
const getTokenCondition = (tokenId: string) => {
  if (!conditionForm.tokenConditions[tokenId]) {
    // 初始化新的代币监控条件（使用默认值）
    conditionForm.tokenConditions[tokenId] = {
      triggerAmount: 100,
      maxPercentage: 110,
      triggerAction: 'transfer'
    }
  }
  return conditionForm.tokenConditions[tokenId]
}

// 格式化代币ID（带公链名称）
const formatTokenIdWithChain = (tokenId: string) => {
  if (!tokenId) return ''
  
  const [chain, id] = tokenId.split('-')
  if (!chain || !id) return tokenId
  
  const token = tokenList.find(t => t.id === id && t.blockchain === chain)
  return token ? `${chain} - ${token.symbol}` : tokenId
}

// 移除公链监控条件
const removeChain = (chain: string) => {
  if (conditionForm.monitorChains.includes(chain)) {
    conditionForm.monitorChains = conditionForm.monitorChains.filter(c => c !== chain)
    // 使用 delete 操作符删除条件，而不是设置为 undefined
    delete conditionForm.chainConditions[chain]
  }
}

// 移除代币监控条件
const removeToken = (tokenId: string) => {
  if (conditionForm.monitorTokens.includes(tokenId)) {
    conditionForm.monitorTokens = conditionForm.monitorTokens.filter(t => t !== tokenId)
    // 使用 delete 操作符删除条件，而不是设置为 undefined
    delete conditionForm.tokenConditions[tokenId]
  }
}

// 处理币种配置方式切换
const handleCoinConfigChange = (value: 'default' | 'custom') => {
  if (value === 'custom') {
    // 切换到自定义配置时，初始化监控条件
    initializeCurrencyStatus()
  } else {
    // 切换到默认配置时，清空自定义设置
    conditionForm.monitorChains = []
    conditionForm.monitorTokens = []
    conditionForm.chainConditions = {}
    conditionForm.tokenConditions = {}
  }
}

// 添加主链
const handleAddChain = () => {
  // 打开选择公链弹窗
  ElMessageBox({
    title: '选择公链',
    message: h => h(
      'div', 
      { class: 'coin-selection-container' },
      [
        h('el-checkbox-group', {
          modelValue: chainSelectionTemp.value,
          'onUpdate:modelValue': (val) => { chainSelectionTemp.value = val },
        }, chainOptions.filter(item => item.value).map(chain => 
          h('el-checkbox', { 
            label: chain.value,
            key: chain.value,
            border: true,
            size: 'large',
            class: 'coin-selection-item'
          }, { default: () => chain.label })
        ))
      ]
    ),
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        // 添加选中的公链
        const newChains = chainSelectionTemp.value.filter(
          chain => !conditionForm.monitorChains.includes(chain)
        )
        
        if (newChains.length === 0) {
          ElMessage.warning('未选择新的公链')
          return
        }
        
        conditionForm.monitorChains.push(...newChains)
        
        // 为新添加的公链初始化监控条件
        newChains.forEach(chain => {
          if (!conditionForm.chainConditions[chain]) {
            conditionForm.chainConditions[chain] = {
              triggerAmount: 100,
              maxPercentage: 110,
              triggerAction: 'transfer'
            }
          }
        })
        
        ElMessage.success(`已添加 ${newChains.length} 个公链`)
        chainSelectionTemp.value = []
      }
      done()
    },
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'coin-selection-dialog'
  })
}

// 添加代币
const handleAddToken = () => {
  // 打开选择代币弹窗
  ElMessageBox({
    title: '选择代币',
    message: h => h(
      'div', 
      { class: 'coin-selection-container' },
      [
        h('div', { class: 'coin-selection-search' }, [
          h('el-input', {
            placeholder: '搜索代币',
            modelValue: tokenSearchKeyword.value,
            'onUpdate:modelValue': (val) => { tokenSearchKeyword.value = val },
            clearable: true,
            prefix: 'Search'
          })
        ]),
        h('div', { class: 'coin-selection-list' },
          blockchainList.map(blockchain => {
            const tokens = getTokensByChain(blockchain.name).filter(token => 
              !tokenSearchKeyword.value || token.symbol.toLowerCase().includes(tokenSearchKeyword.value.toLowerCase())
            )
            
            if (tokens.length === 0) return null
            
            return [
              h('div', { class: 'coin-selection-group-title' }, blockchain.name),
              h('div', { class: 'coin-selection-group' },
                tokens.map(token => {
                  const tokenId = `${blockchain.name}-${token.id}`
                  return h('el-checkbox', {
                    modelValue: tokenSelectionTemp.value.includes(tokenId),
                    'onUpdate:modelValue': (checked) => {
                      if (checked) {
                        tokenSelectionTemp.value.push(tokenId)
                      } else {
                        const index = tokenSelectionTemp.value.indexOf(tokenId)
                        if (index !== -1) {
                          tokenSelectionTemp.value.splice(index, 1)
                        }
                      }
                    },
                    label: tokenId,
                    key: tokenId,
                    border: true,
                    class: 'coin-selection-item'
                  }, { default: () => token.symbol })
                })
              )
            ]
          }).filter(Boolean).flat()
        )
      ]
    ),
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        // 添加选中的代币
        const newTokens = tokenSelectionTemp.value.filter(
          token => !conditionForm.monitorTokens.includes(token)
        )
        
        if (newTokens.length === 0) {
          ElMessage.warning('未选择新的代币')
          return
        }
        
        conditionForm.monitorTokens.push(...newTokens)
        
        // 为新添加的代币初始化监控条件
        newTokens.forEach(tokenId => {
          if (!conditionForm.tokenConditions[tokenId]) {
            conditionForm.tokenConditions[tokenId] = {
              triggerAmount: 50,
              maxPercentage: 100,
              triggerAction: 'transfer'
            }
          }
        })
        
        ElMessage.success(`已添加 ${newTokens.length} 个代币`)
        tokenSelectionTemp.value = []
      }
      done()
    },
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'coin-selection-dialog'
  })
}

// 初始化
onMounted(() => {
  fetchAddressList()
})

// 获取代币符号
const getTokenSymbol = (tokenId: string): string => {
  if (!tokenId) return '';
  
  const [chain, id] = tokenId.split('-');
  if (!chain || !id) return '';
  
  const token = tokenList.find(t => t.id === id && t.blockchain === chain);
  return token ? token.symbol : '';
}
</script>

<style scoped>
.address-list-container {
  padding: 20px;
}

.card-container {
  margin-bottom: 16px;
}

.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.search-item {
  display: flex;
  align-items: center;
}

.search-label {
  white-space: nowrap;
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.search-buttons {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.filter-dropdown {
  width: 120px;
}

.table-toolbar {
  margin: 16px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar .left {
  display: flex;
  gap: 10px;
}

.selected-count {
  font-size: 14px;
  color: #606266;
}

.ellipsis-text {
  display: inline-block;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-tags {
  display: flex;
  align-items: center;
  gap: 5px;
}

.customer-count {
  cursor: pointer !important;
  transition: all 0.3s;
  background-color: #909399 !important;
  color: white !important;
}

.customer-count:hover {
  background-color: #409EFF !important;
  transform: scale(1.05);
}

.token-balance-cell {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.token-balance-cell > div {
  white-space: pre-line;
}

.token-balance-cell .view-all {
  color: #409EFF;
  cursor: pointer;
  margin-left: 5px;
  font-weight: 500;
}

.token-balance-cell .view-all:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.token-details-header {
  margin-bottom: 16px;
}

.token-details-content {
  max-height: 300px;
  overflow-y: auto;
}

.token-details-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.token-details-item:last-child {
  border-bottom: none;
}

.token-name {
  font-weight: 500;
  color: #303133;
}

.token-value {
  color: #606266;
}

.no-tokens {
  text-align: center;
  padding: 20px;
  color: #909399;
}

/* 监控条件相关样式 */
.monitor-condition-container {
  margin-top: 10px;
  padding: 0 20px;
}

.customer-relation-dialog {
  padding: 20px;
}

.search-area {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  display: flex;
  align-items: center;
}

.label {
  white-space: nowrap;
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.search-buttons {
  display: flex;
  gap: 8px;
}

.customer-display {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.customer-display span {
  margin-right: 5px;
}

.clickable-customer {
  cursor: pointer;
  color: #409EFF;
  text-decoration: underline;
}

.customer-number {
  cursor: pointer;
  color: #409EFF;
  font-weight: bold;
}

.customer-number:hover {
  color: #66b1ff;
}

.secondary-list-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-list-container {
  display: flex;
  align-items: center;
}

.status-tag {
  margin-left: 12px;
}

.monitor-currency-popover {
  max-height: 300px;
  overflow-y: auto;
}

.monitor-currency-title {
  font-weight: bold;
  margin: 5px 0;
}

.monitor-currency-items {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.monitor-chain-tag,
.monitor-token-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.cursor-pointer {
  cursor: pointer;
}

/* 币种监控条件样式 */
.currency-condition-title {
  font-weight: bold;
  margin: 15px 0 10px 0;
  color: #606266;
}

.currency-condition-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.condition-detail {
  margin-left: 8px;
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #606266;
}

.currency-condition-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #f8f9fa;
}

.currency-condition-header {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between; /* Added for button alignment */
}

.currency-condition-form {
  padding-left: 10px;
}

.coin-config-tip {
  margin-top: 10px;
  padding: 0;
  border-radius: 4px;
  font-size: 14px;
}

.tip-content {
  background-color: #ecf5ff;
  padding: 12px 15px;
  border-radius: 4px;
  border: 1px solid #d9ecff;
  color: #606266;
  display: flex;
  align-items: center;
}

.currency-tabs {
  width: 100%;
  margin-bottom: 20px;
}

.currency-condition-tabs {
  margin-bottom: 15px;
}

.currency-condition-content {
  padding: 0;
  margin-top: 15px;
}

.table-operation {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.el-dialog {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.el-dialog .el-dialog__body {
  overflow: auto;
  padding: 20px 20px 0 20px;
}

.el-tabs--border-card {
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

.el-table {
  margin-bottom: 15px;
  border-radius: 4px;
  overflow: hidden;
}

/* 币种选择表格样式 */
.el-tabs--border-card .el-table {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.el-tabs--border-card .el-table th.el-table__cell {
  background-color: #f5f7fa !important;
}

.el-tabs--border-card .el-table .even-row {
  background-color: #ffffff;
}

.el-tabs--border-card .el-table .odd-row {
  background-color: #fafafa;
}

.el-tabs--border-card .el-table .el-table__row:hover td {
  background-color: #ecf5ff !important;
}

.el-table .cell {
  white-space: nowrap;
}

.el-tabs--border-card {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
}

.coin-name {
  font-weight: 500;
  color: #303133;
  display: flex;
  align-items: center;
}

.el-tabs--border-card > .el-tabs__content {
  padding: 15px;
}

.coin-selection-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px 0;
}

.coin-selection-search {
  margin-bottom: 15px;
}

.coin-selection-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.coin-selection-group-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
  padding-left: 5px;
  border-left: 3px solid #409EFF;
}

.coin-selection-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 5px;
}

.coin-selection-item {
  margin-right: 10px;
  margin-bottom: 10px;
}

.coin-selection-dialog {
  width: 600px;
}

.coin-selection-dialog .el-message-box__message {
  max-height: 400px;
  overflow: auto;
}

.pagination-container.token-pagination {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}
</style> 
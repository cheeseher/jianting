import { reactive } from 'vue'
import { addressList, addressChangeRecords, callbackRecords, blockchainList, tokenList, customerList, userList, roleList } from './mockData'

// 创建全局响应式数据状态，确保数据在页面间共享且保持一致
export const appState = reactive({
  // 监听地址数据
  addressData: [...addressList],
  // 地址变动记录
  addressRecordData: [...addressChangeRecords],
  // 回调记录
  callbackData: [...callbackRecords],
  // 区块链数据
  blockchainData: [...blockchainList],
  // 代币数据
  tokenData: [...tokenList],
  // 客户数据
  customerData: [...customerList],
  // 用户数据
  userData: [...userList],
  // 角色数据
  roleData: [...roleList]
}) 
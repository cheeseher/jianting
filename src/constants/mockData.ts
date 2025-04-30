import { MonitorAddress, AddressChangeRecord, CallbackRecord } from '@/types/monitor'
import { BlockchainInfo, TokenInfo } from '@/types/blockchain'
import { Customer } from '@/types/customer'

// 监听地址数据
export const addressList: MonitorAddress[] = [
  {
    id: '1',
    address: '111111111111111111',
    chain: 'BSC',
    mainBalance: '10',
    tokenBalance: 'usdt: 1000\nusdc: 1000',
    addTime: '2024-09-27 15:00:00',
    updateTime: '2024-09-27 15:00:00',
    customer: '5'
  },
  {
    id: '2',
    address: '222222222222222',
    chain: 'ETH',
    mainBalance: '10',
    tokenBalance: 'usdt: 1000\nusdc: 1000',
    addTime: '2024-09-27 15:00:00',
    updateTime: '2024-09-27 15:00:00',
    customer: '6'
  },
  {
    id: '3',
    address: '333333333333333',
    chain: 'TRON',
    mainBalance: '10',
    tokenBalance: 'usdt: 1000\nusdc: 1000',
    addTime: '2024-09-27 15:00:00',
    updateTime: '2024-09-27 15:00:00',
    customer: '5',
    customerId: '表示全部'
  },
  {
    id: '4',
    address: '444444444444444',
    chain: 'BTC',
    mainBalance: '10',
    tokenBalance: 'usdt: 1000\nusdc: 1000',
    addTime: '2024-09-27 15:00:00',
    updateTime: '2024-09-27 15:00:00',
    customer: '8'
  }
]

// 地址变动记录数据
export const addressChangeRecords: AddressChangeRecord[] = [
  {
    id: '1',
    address: '111111111111111111',
    chain: 'BSC',
    type: '添加',
    operator: '123 (王)',
    operateTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    address: '222222222222222',
    chain: 'ETH',
    type: '删除',
    operator: '123 (王)',
    operateTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    address: '333333333333333',
    chain: 'TRON',
    type: '添加',
    operator: '223 (刘)',
    operateTime: '2024-09-27 15:00:00'
  },
  {
    id: '4',
    address: '444444444444444',
    chain: 'BTC',
    type: '删除',
    operator: '123 (王)',
    operateTime: '2024-09-27 15:00:00'
  }
]

// 回调记录数据
export const callbackRecords: CallbackRecord[] = [
  {
    id: '123345',
    hash: '99999999',
    monitorAddress: '111111111111111111',
    targetAddress: '444444444444444',
    type: '转入',
    chain: 'BSC',
    tokenName: 'BNB',
    tokenContract: '',
    amount: '+10',
    customer: '123 (王)',
    callbackTime: '2024-09-27 15:00:00',
    status: '成功'
  },
  {
    id: '234536',
    hash: '99999999',
    monitorAddress: '111111111111111111',
    targetAddress: '444444444444444',
    type: '转入',
    chain: 'BSC',
    tokenName: 'BNB',
    tokenContract: '',
    amount: '+10',
    customer: '123 (刘)',
    callbackTime: '2024-09-27 15:00:00',
    status: '失败'
  },
  {
    id: '123344657474',
    hash: '99999999',
    monitorAddress: '111111111111111111',
    targetAddress: '444444444444444',
    type: '转入',
    chain: 'BSC',
    tokenName: 'BNB',
    tokenContract: '',
    amount: '+10',
    customer: '005 (鹏)',
    callbackTime: '2024-09-27 15:00:00',
    status: '成功'
  },
  {
    id: '234234',
    hash: '888888',
    monitorAddress: '444444444444444',
    targetAddress: '111111111111111111',
    type: '转出',
    chain: 'BTC',
    tokenName: 'BTC',
    tokenContract: '',
    amount: '-10',
    customer: '123 (王)',
    callbackTime: '2024-09-27 15:00:00',
    status: '失败'
  }
]

// 公链数据
export const blockchainList: BlockchainInfo[] = [
  {
    id: '1',
    name: 'TRON',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'TRX',
    tokenCount: 80,
    explorerUrl: 'https://11111.com',
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    name: 'BSC',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'BSC',
    tokenCount: 100,
    explorerUrl: 'https://11111.com',
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    name: 'ETH',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'ETH',
    tokenCount: 9,
    explorerUrl: '',
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '4',
    name: 'BTC',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'BNB',
    tokenCount: 10,
    explorerUrl: 'https://11111.com',
    addTime: '2024-09-27 15:00:00'
  }
]

// 代币数据
export const tokenList: TokenInfo[] = [
  {
    id: '1',
    name: 'Binance USD',
    symbol: 'BUSD',
    contract: '0x55d398326f99059ff775485246999027b3197955',
    blockchain: 'BSC',
    decimals: 18,
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    name: 'Tether USD',
    symbol: 'USDT',
    contract: '0x55d398326f99059ff775485246999027b3197955',
    blockchain: 'BSC',
    decimals: 18,
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    name: 'Ethereum',
    symbol: 'ETH',
    contract: '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    blockchain: 'BSC',
    decimals: 18,
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '4',
    name: 'Bitcoin',
    symbol: 'BTC',
    contract: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    blockchain: 'BSC',
    decimals: 18,
    addTime: '2024-09-27 15:00:00'
  }
]

// 客户数据
export const customerList: Customer[] = [
  {
    id: '100001',
    name: '张三',
    monitorAddressCount: 20,
    callbackUrl: 'https://example1.com',
    status: true,
    updateTime: '2024-09-27 15:00'
  },
  {
    id: '100002',
    name: '李四',
    monitorAddressCount: 100,
    callbackUrl: 'https://example2.com',
    status: true,
    updateTime: '2024-09-27 15:00'
  },
  {
    id: '100003',
    name: '王五',
    monitorAddressCount: 0,
    callbackUrl: 'https://example3.com',
    status: false,
    updateTime: '2024-09-27 15:00'
  },
  {
    id: '100004',
    name: '赵六',
    monitorAddressCount: 1000,
    callbackUrl: 'https://example4.com',
    status: true,
    updateTime: '2024-09-27 15:00'
  }
]

// 用户数据
export const userList = [
  {
    id: '1',
    username: 'admin',
    realname: '管理员',
    role: '超级管理员',
    email: 'admin@example.com',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    username: 'user1',
    realname: '用户1',
    role: '普通用户',
    email: 'user1@example.com',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    username: 'user2',
    realname: '用户2',
    role: '普通用户',
    email: 'user2@example.com',
    status: '禁用',
    createTime: '2024-09-27 15:00:00'
  }
]

// 角色数据
export const roleList = [
  {
    id: '1',
    roleName: '超级管理员',
    roleKey: 'admin',
    description: '拥有所有权限',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    roleName: '普通用户',
    roleKey: 'user',
    description: '拥有基本权限',
    status: '启用',
    createTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    roleName: '访客',
    roleKey: 'visitor',
    description: '只有查看权限',
    status: '禁用',
    createTime: '2024-09-27 15:00:00'
  }
] 
import { MonitorAddress, AddressChangeRecord, CallbackRecord, TriggerRecord, ActionRecord } from '@/types/monitor'
import { BlockchainInfo, TokenInfo } from '@/types/blockchain'
import { Customer } from '@/types/customer'
import { TelegramBot } from '@/types/telegram'

// 监听地址数据
export const addressList: MonitorAddress[] = [
  {
    id: '1',
    address: '0x8C3fa94D1F4dF3a91296C6D380E092A0a98198DA',
    chain: 'BSC',
    mainBalance: '245.78',
    tokenBalance: 'USDT: 12850.45\nUSDC: 5632.18\nBUSD: 3421.67\nBNB: 8.42',
    addTime: '2024-06-15 09:23:45',
    updateTime: '2024-08-21 16:38:12',
    customer: '100001',
    maxPercentage: 120,
    triggerAction: 'transfer',
    secondaryList: true
  },
  {
    id: '2',
    address: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
    chain: 'ETH',
    mainBalance: '18.42',
    tokenBalance: 'USDT: 25600\nDAI: 15700.23\nUSDC: 8932.56\nSHIB: 15000000',
    addTime: '2024-05-28 14:32:19',
    updateTime: '2024-08-23 11:45:39',
    customer: '100002',
    maxPercentage: 135,
    triggerAction: 'multi-sign',
    secondaryList: false
  },
  {
    id: '3',
    address: 'TNPeeaaFB7K33cCZzBHZZv1xUbhJbQJbEc',
    chain: 'TRON',
    mainBalance: '35621.5',
    tokenBalance: 'USDT: 89500.62\nJST: 125000\nBTT: 3500000\nWIN: 2750000',
    addTime: '2024-04-12 08:15:27',
    updateTime: '2024-08-18 23:41:08',
    customer: '100003',
    customerId: '表示全部',
    maxPercentage: 110,
    triggerAction: 'transfer',
    secondaryList: true
  },
  {
    id: '4',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    chain: 'BTC',
    mainBalance: '1.25',
    tokenBalance: 'WBTC: 0.3\nBTCB: 0.45',
    addTime: '2024-07-03 19:47:32',
    updateTime: '2024-08-25 07:12:53',
    customer: '100004',
    maxPercentage: 125,
    triggerAction: 'multi-sign',
    secondaryList: false
  },
  {
    id: '5',
    address: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    chain: 'ETH',
    mainBalance: '7.81',
    tokenBalance: 'USDT: 4578.23\nUNI: 523.45\nLINK: 187.62\nMATIC: 1250.78',
    addTime: '2024-06-21 10:34:29',
    updateTime: '2024-08-19 21:56:17',
    customer: '100001',
    maxPercentage: 150,
    triggerAction: 'transfer',
    secondaryList: true
  }
]

// 地址变动记录数据
export const addressChangeRecords: AddressChangeRecord[] = [
  {
    id: '1',
    address: '0x8C3fa94D1F4dF3a91296C6D380E092A0a98198DA',
    chain: 'BSC',
    type: '添加',
    operator: '张明 (管理员)',
    operateTime: '2024-06-15 09:23:45'
  },
  {
    id: '2',
    address: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
    chain: 'ETH',
    type: '添加',
    operator: '刘强 (运维)',
    operateTime: '2024-05-28 14:32:19'
  },
  {
    id: '3',
    address: 'TNPeeaaFB7K33cCZzBHZZv1xUbhJbQJbEc',
    chain: 'TRON',
    type: '添加',
    operator: '王健 (管理员)',
    operateTime: '2024-04-12 08:15:27'
  },
  {
    id: '4',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    chain: 'BTC',
    type: '添加',
    operator: '赵宇 (运维)',
    operateTime: '2024-07-03 19:47:32'
  },
  {
    id: '5',
    address: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    chain: 'ETH',
    type: '添加',
    operator: '张明 (管理员)',
    operateTime: '2024-06-21 10:34:29'
  }
]

// 回调记录数据
export const callbackRecords: CallbackRecord[] = [
  {
    id: '123345',
    hash: '0x7d2b8c6d19f25b83d34957c9f5428a0fe3fc7f2ab1e8338135d3c3ebe4600af7',
    monitorAddress: '0x8C3fa94D1F4dF3a91296C6D380E092A0a98198DA',
    targetAddress: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
    type: '转入',
    chain: 'BSC',
    tokenName: 'BNB',
    tokenContract: '',
    amount: '+3.25',
    customer: '张三 (100001),李四 (100002),王五 (100003)',
    callbackTime: '2024-08-15 13:42:18',
    status: '成功'
  },
  {
    id: '234536',
    hash: '0x9a3b7f5d2c8e1a4b6d5e8f9a2c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    monitorAddress: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
    targetAddress: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    type: '转出',
    chain: 'ETH',
    tokenName: 'USDT',
    tokenContract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    amount: '-2500.00',
    customer: '李四 (100002),赵六 (100004)',
    callbackTime: '2024-08-18 09:15:33',
    status: '失败'
  },
  {
    id: '123344657474',
    hash: '0xe1c2d3b4a5f6e7d8c9b0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    monitorAddress: 'TNPeeaaFB7K33cCZzBHZZv1xUbhJbQJbEc',
    targetAddress: 'TMuA6YqfCeX8EhbfYEg5y7S4DqzSJireY9',
    type: '转入',
    chain: 'TRON',
    tokenName: 'USDT',
    tokenContract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    amount: '+15000.00',
    customer: '王五 (100003)',
    callbackTime: '2024-08-20 17:28:56',
    status: '成功'
  },
  {
    id: '234234',
    hash: 'bc1qasdfghjklzxcvbnm0987654321qwertyuiop',
    monitorAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    targetAddress: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    type: '转出',
    chain: 'BTC',
    tokenName: 'BTC',
    tokenContract: '',
    amount: '-0.35',
    customer: '赵六 (100004)',
    callbackTime: '2024-08-22 05:37:42',
    status: '成功'
  }
]

// 公链数据
export const blockchainList: BlockchainInfo[] = [
  {
    id: '1',
    name: 'TRON',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'TRX',
    tokenCount: 1,
    explorerUrl: 'https://11111.com',
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '2',
    name: 'BSC',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'BSC',
    tokenCount: 1,
    explorerUrl: 'https://11111.com',
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '3',
    name: 'ETH',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'ETH',
    tokenCount: 1,
    explorerUrl: '',
    addTime: '2024-09-27 15:00:00'
  },
  {
    id: '4',
    name: 'BTC',
    address: 'mfhjkdmnf.fmfhf',
    mainCurrency: 'BTC',
    tokenCount: 1,
    explorerUrl: 'https://11111.com',
    addTime: '2024-09-27 15:00:00'
  }
]

// 代币数据
export const tokenList: TokenInfo[] = [
  // BSC链上的代币(只保留1个)
  {
    id: '1',
    name: 'Binance USD',
    symbol: 'BUSD',
    contract: '0x55d398326f99059ff775485246999027b3197955',
    blockchain: 'BSC',
    decimals: 18,
    addTime: '2024-09-27 15:00:00'
  },
  // ETH链上的代币(只保留1个)
  {
    id: '2',
    name: 'Tether USD',
    symbol: 'USDT',
    contract: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    blockchain: 'ETH',
    decimals: 6,
    addTime: '2024-09-27 15:00:00'
  },
  // TRON链上的代币(只保留1个)
  {
    id: '3',
    name: 'JUST',
    symbol: 'JST',
    contract: 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9',
    blockchain: 'TRON',
    decimals: 18,
    addTime: '2024-09-27 15:00:00'
  },
  // BTC链上的代币(只保留1个)
  {
    id: '4',
    name: 'Wrapped Bitcoin',
    symbol: 'WBTC',
    contract: '',
    blockchain: 'BTC',
    decimals: 8,
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
    privateKey: 'abcd1234efgh5678ijkl9012mnop3456',
    status: true,
    updateTime: '2024-09-27 15:00'
  },
  {
    id: '100002',
    name: '李四',
    monitorAddressCount: 100,
    callbackUrl: 'https://example2.com',
    privateKey: 'qrst7890uvwx1234yz562abcdef3478',
    status: true,
    updateTime: '2024-09-27 15:00'
  },
  {
    id: '100003',
    name: '王五',
    monitorAddressCount: 0,
    callbackUrl: 'https://example3.com',
    privateKey: 'ghij5678klmn9012opqr3456stuv7890',
    status: false,
    updateTime: '2024-09-27 15:00'
  },
  {
    id: '100004',
    name: '赵六',
    monitorAddressCount: 1000,
    callbackUrl: 'https://example4.com',
    privateKey: 'wxyz1234abcd5678efgh9012ijkl3456',
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

// 异常触发记录数据
export const triggerRecords: TriggerRecord[] = [
  {
    id: '1001',
    triggerTime: '2024-08-25 13:42:18',
    monitorAddress: '0x8C3fa94D1F4dF3a91296C6D380E092A0a98198DA',
    customer: '张三 (100001),李四 (100002),王五 (100003)',
    hash: '0x7d2b8c6d19f25b83d34957c9f5428a0fe3fc7f2ab1e8338135d3c3ebe4600af7',
    amount: '5000 USDT',
    triggerDesc: '单笔金额≥1000USDT 且 达到历史最大金额的110%',
    triggerAction: '闪电转账',
    actionStatus: '提交成功',
    isSecondaryList: false
  },
  {
    id: '1002',
    triggerTime: '2024-08-26 09:15:33',
    monitorAddress: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
    customer: '李四 (100002),赵六 (100004)',
    hash: '0x9a3b7f5d2c8e1a4b6d5e8f9a2c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
    amount: '3500 USDC',
    triggerDesc: '单笔金额≥2000USDC 且 达到历史最大金额的135%',
    triggerAction: '多签',
    actionStatus: '提交失败',
    failReason: '接口异常，请求超时',
    isSecondaryList: false
  },
  {
    id: '1003',
    triggerTime: '2024-08-27 17:28:56',
    monitorAddress: 'TNPeeaaFB7K33cCZzBHZZv1xUbhJbQJbEc',
    customer: '王五 (100003)',
    hash: '0xe1c2d3b4a5f6e7d8c9b0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    amount: '25000 USDT',
    triggerDesc: '单笔金额≥20000USDT 且 达到历史最大金额的110%',
    triggerAction: '闪电转账',
    actionStatus: '提交成功',
    isSecondaryList: true
  },
  {
    id: '1004',
    triggerTime: '2024-08-28 05:37:42',
    monitorAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    customer: '赵六 (100004)',
    hash: 'bc1qasdfghjklzxcvbnm0987654321qwertyuiop',
    amount: '0.75 BTC',
    triggerDesc: '单笔金额≥0.5BTC 且 达到历史最大金额的125%',
    triggerAction: '多签',
    actionStatus: '未提交',
    isSecondaryList: false
  },
  {
    id: '1005',
    triggerTime: '2024-08-29 21:56:17',
    monitorAddress: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    customer: '张三 (100001)',
    hash: '0xf1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e6d7c8b9a0f1e2',
    amount: '8500 USDT',
    triggerDesc: '单笔金额≥5000USDT 且 达到历史最大金额的150%',
    triggerAction: '闪电转账',
    actionStatus: '提交成功',
    isSecondaryList: true
  }
]

// 动作执行记录数据
export const actionRecords: ActionRecord[] = [
  {
    id: '2001',
    executeTime: '2024-08-25 13:45:22',
    monitorAddress: '0x8C3fa94D1F4dF3a91296C6D380E092A0a98198DA',
    customer: '张三 (100001),李四 (100002),王五 (100003)',
    relatedTriggerId: '1001',
    actionType: '闪电转账',
    actionStatus: '完成',
    triggerSource: '监控条件命中'
  },
  {
    id: '2002',
    executeTime: '2024-08-26 09:18:45',
    monitorAddress: '0xF977814e90dA44bFA03b6295A0616a897441aceC',
    customer: '李四 (100002),赵六 (100004)',
    relatedTriggerId: '1002',
    actionType: '多签',
    actionStatus: '失败',
    failReason: '余额不足',
    triggerSource: '监控条件命中'
  },
  {
    id: '2003',
    executeTime: '2024-08-27 17:30:12',
    monitorAddress: 'TNPeeaaFB7K33cCZzBHZZv1xUbhJbQJbEc',
    customer: '王五 (100003)',
    relatedTriggerId: '1003',
    actionType: '闪电转账',
    actionStatus: '处理中',
    triggerSource: '二次列表'
  },
  {
    id: '2004',
    executeTime: '2024-08-29 22:00:35',
    monitorAddress: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    customer: '张三 (100001)',
    relatedTriggerId: '1005',
    actionType: '闪电转账',
    actionStatus: '完成',
    triggerSource: '二次列表'
  },
  {
    id: '2005',
    executeTime: '2024-08-29 22:15:48',
    monitorAddress: '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    customer: '张三 (100001)',
    relatedTriggerId: '1005',
    actionType: '闪电转账',
    actionStatus: '失败',
    failReason: '网络连接异常',
    triggerSource: '二次列表'
  }
]

// TG通知机器人设置数据
export const telegramBotList: TelegramBot[] = [
  {
    id: '1',
    customerId: '100001',
    customerName: '张三',
    chainType: 'ETH',
    sendUrl: 'https://api.telegram.org/bot123456789:AAHPdXnhL4Xde8UY_vEgVeHNrr3u4Keo6pQ/sendMessage?chat_id=-1001234567890',
    transferUrl: 'https://api.telegram.org/bot123456789:AAHPdXnhL4Xde8UY_vEgVeHNrr3u4Keo6pQ/sendMessage?chat_id=-1001234567891',
    multiSignUrl: 'https://api.telegram.org/bot123456789:AAHPdXnhL4Xde8UY_vEgVeHNrr3u4Keo6pQ/sendMessage?chat_id=-1001234567892',
    createTime: '2024-08-15 10:23:45',
    updateTime: '2024-08-23 14:35:22'
  },
  {
    id: '2',
    customerId: '100001',
    customerName: '张三',
    chainType: 'BSC',
    sendUrl: 'https://api.telegram.org/bot987654321:BBGQcXmiL8Wap3TZ_rFhUmDIptt8j7fg5nM/sendMessage?chat_id=-1009876543210',
    transferUrl: 'https://api.telegram.org/bot987654321:BBGQcXmiL8Wap3TZ_rFhUmDIptt8j7fg5nM/sendMessage?chat_id=-1009876543211',
    multiSignUrl: 'https://api.telegram.org/bot987654321:BBGQcXmiL8Wap3TZ_rFhUmDIptt8j7fg5nM/sendMessage?chat_id=-1009876543212',
    createTime: '2024-08-16 09:12:34',
    updateTime: '2024-08-22 15:47:18'
  },
  {
    id: '3',
    customerId: '100002',
    customerName: '李四',
    chainType: 'TRON',
    sendUrl: 'https://api.telegram.org/bot246813579:CCKReWpjM9Xap3TZ_qGeWlEJquu7k5hf6bN/sendMessage?chat_id=-1002468135790',
    transferUrl: 'https://api.telegram.org/bot246813579:CCKReWpjM9Xap3TZ_qGeWlEJquu7k5hf6bN/sendMessage?chat_id=-1002468135791',
    multiSignUrl: 'https://api.telegram.org/bot246813579:CCKReWpjM9Xap3TZ_qGeWlEJquu7k5hf6bN/sendMessage?chat_id=-1002468135792',
    createTime: '2024-08-17 11:45:52',
    updateTime: '2024-08-21 16:58:39'
  },
  {
    id: '4',
    customerId: '100003',
    customerName: '王五',
    chainType: 'ETH',
    sendUrl: 'https://api.telegram.org/bot135792468:DDLSfYqkN0Wap3TZ_pHgXmGLsvv6i4jg5bO/sendMessage?chat_id=-1001357924680',
    transferUrl: 'https://api.telegram.org/bot135792468:DDLSfYqkN0Wap3TZ_pHgXmGLsvv6i4jg5bO/sendMessage?chat_id=-1001357924681',
    multiSignUrl: 'https://api.telegram.org/bot135792468:DDLSfYqkN0Wap3TZ_pHgXmGLsvv6i4jg5bO/sendMessage?chat_id=-1001357924682',
    createTime: '2024-08-18 14:37:21',
    updateTime: '2024-08-20 17:29:45'
  },
  {
    id: '5',
    customerId: '100004',
    customerName: '赵六',
    chainType: 'BTC',
    sendUrl: 'https://api.telegram.org/bot864297531:EEMTgZrlO1Wap3TZ_oIjYnHKtww5h3if4aP/sendMessage?chat_id=-1008642975310',
    transferUrl: 'https://api.telegram.org/bot864297531:EEMTgZrlO1Wap3TZ_oIjYnHKtww5h3if4aP/sendMessage?chat_id=-1008642975311',
    multiSignUrl: 'https://api.telegram.org/bot864297531:EEMTgZrlO1Wap3TZ_oIjYnHKtww5h3if4aP/sendMessage?chat_id=-1008642975312',
    createTime: '2024-08-19 16:28:13',
    updateTime: '2024-08-24 08:14:56'
  }
] 
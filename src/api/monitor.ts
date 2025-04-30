import { MonitorAddress, AddressQueryParams, PageResult, AddressChangeRecord, AddressChangeRecordQueryParams, CallbackRecord, CallbackRecordQueryParams } from '@/types/monitor'

// 模拟的公链数据
export const chainOptions = [
  { label: '全部', value: '' },
  { label: 'BSC', value: 'BSC' },
  { label: 'ETH', value: 'ETH' },
  { label: 'TRON', value: 'TRON' },
  { label: 'BTC', value: 'BTC' }
]

// 模拟操作类型选项
export const operateTypeOptions = [
  { label: '全部', value: '' },
  { label: '添加', value: '添加' },
  { label: '删除', value: '删除' }
]

// 模拟交易类型选项
export const transactionTypeOptions = [
  { label: '全部', value: '' },
  { label: '转入', value: '转入' },
  { label: '转出', value: '转出' }
]

// 模拟回调状态选项
export const callbackStatusOptions = [
  { label: '全部', value: '' },
  { label: '成功', value: '成功' },
  { label: '失败', value: '失败' }
]

// 模拟监听地址数据
const addressList: MonitorAddress[] = [
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

// 模拟地址变动记录数据
const addressChangeRecords: AddressChangeRecord[] = [
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

// 模拟回调记录数据
const callbackRecords: CallbackRecord[] = [
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

// 获取监听地址列表
export const getAddressList = (params: AddressQueryParams): Promise<PageResult<MonitorAddress>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 过滤数据
      let filteredList = [...addressList]
      
      if (params.chain) {
        filteredList = filteredList.filter(item => item.chain === params.chain)
      }
      
      if (params.address) {
        filteredList = filteredList.filter(item => item.address.includes(params.address as string))
      }
      
      if (params.customerId) {
        filteredList = filteredList.filter(item => item.customer === params.customerId)
      }
      
      // 计算分页
      const start = (params.pageNum - 1) * params.pageSize
      const end = start + params.pageSize
      const pageList = filteredList.slice(start, end)
      
      resolve({
        list: pageList,
        total: filteredList.length,
        pageNum: params.pageNum,
        pageSize: params.pageSize
      })
    }, 500)
  })
}

// 获取地址变动记录列表
export const getAddressChangeRecords = (params: AddressChangeRecordQueryParams): Promise<PageResult<AddressChangeRecord>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 过滤数据
      let filteredList = [...addressChangeRecords]
      
      if (params.chain) {
        filteredList = filteredList.filter(item => item.chain === params.chain)
      }
      
      if (params.address) {
        filteredList = filteredList.filter(item => item.address.includes(params.address as string))
      }
      
      if (params.type) {
        filteredList = filteredList.filter(item => item.type === params.type)
      }
      
      // 计算分页
      const start = (params.pageNum - 1) * params.pageSize
      const end = start + params.pageSize
      const pageList = filteredList.slice(start, end)
      
      resolve({
        list: pageList,
        total: filteredList.length,
        pageNum: params.pageNum,
        pageSize: params.pageSize
      })
    }, 500)
  })
}

// 获取回调记录列表
export const getCallbackRecords = (params: CallbackRecordQueryParams): Promise<PageResult<CallbackRecord>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 过滤数据
      let filteredList = [...callbackRecords]
      
      if (params.id) {
        filteredList = filteredList.filter(item => item.id.includes(params.id as string))
      }
      
      if (params.hash) {
        filteredList = filteredList.filter(item => item.hash.includes(params.hash as string))
      }
      
      if (params.monitorAddress) {
        filteredList = filteredList.filter(item => item.monitorAddress.includes(params.monitorAddress as string))
      }
      
      if (params.targetAddress) {
        filteredList = filteredList.filter(item => item.targetAddress.includes(params.targetAddress as string))
      }
      
      if (params.type) {
        filteredList = filteredList.filter(item => item.type === params.type)
      }
      
      if (params.chain) {
        filteredList = filteredList.filter(item => item.chain === params.chain)
      }
      
      if (params.tokenName) {
        filteredList = filteredList.filter(item => item.tokenName.includes(params.tokenName as string))
      }
      
      if (params.tokenContract) {
        filteredList = filteredList.filter(item => item.tokenContract.includes(params.tokenContract as string))
      }
      
      if (params.customer) {
        filteredList = filteredList.filter(item => item.customer.includes(params.customer as string))
      }
      
      if (params.status) {
        filteredList = filteredList.filter(item => item.status === params.status)
      }
      
      // 计算分页
      const start = (params.pageNum - 1) * params.pageSize
      const end = start + params.pageSize
      const pageList = filteredList.slice(start, end)
      
      resolve({
        list: pageList,
        total: filteredList.length,
        pageNum: params.pageNum,
        pageSize: params.pageSize
      })
    }, 500)
  })
}

// 添加监听地址
export const addAddress = (data: MonitorAddress): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟添加操作
      resolve(true)
    }, 500)
  })
}

// 删除监听地址
export const deleteAddress = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟删除操作
      resolve(true)
    }, 500)
  })
}

// 批量删除监听地址
export const batchDeleteAddress = (ids: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟批量删除操作
      resolve(true)
    }, 500)
  })
} 
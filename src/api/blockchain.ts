import { BlockchainInfo, TokenInfo, BlockchainQueryParams, TokenQueryParams, PageResult } from '@/types/blockchain'

// 模拟公链数据
const blockchainList: BlockchainInfo[] = [
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

// 模拟代币数据
const tokenList: TokenInfo[] = [
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

// 获取公链列表
export const getBlockchainList = (params: BlockchainQueryParams): Promise<PageResult<BlockchainInfo>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 过滤数据
      let filteredList = [...blockchainList]
      
      if (params.name) {
        filteredList = filteredList.filter(item => item.name.includes(params.name as string))
      }
      
      if (params.mainCurrency) {
        filteredList = filteredList.filter(item => item.mainCurrency.includes(params.mainCurrency as string))
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

// 添加/编辑公链
export const saveBlockchain = (data: BlockchainInfo): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟添加/编辑操作
      resolve(true)
    }, 500)
  })
}

// 删除公链
export const deleteBlockchain = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟删除操作
      resolve(true)
    }, 500)
  })
}

// 获取代币列表
export const getTokenList = (params: TokenQueryParams): Promise<PageResult<TokenInfo>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 过滤数据
      let filteredList = [...tokenList]
      
      if (params.name) {
        filteredList = filteredList.filter(item => item.name.includes(params.name as string))
      }
      
      if (params.symbol) {
        filteredList = filteredList.filter(item => item.symbol.includes(params.symbol as string))
      }
      
      if (params.contract) {
        filteredList = filteredList.filter(item => item.contract.includes(params.contract as string))
      }
      
      if (params.blockchain) {
        filteredList = filteredList.filter(item => item.blockchain === params.blockchain)
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

// 添加/编辑代币
export const saveToken = (data: TokenInfo): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟添加/编辑操作
      resolve(true)
    }, 500)
  })
}

// 删除代币
export const deleteToken = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟删除操作
      resolve(true)
    }, 500)
  })
} 
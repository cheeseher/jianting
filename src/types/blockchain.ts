// 公链信息类型
export interface BlockchainInfo {
  id: string;            // 公链ID
  name: string;          // 公链名称
  address: string;       // 公链地址
  mainCurrency: string;  // 主币
  tokenCount: number;    // 代币数量
  explorerUrl: string;   // 浏览器地址
  addTime: string;       // 添加时间
}

// 公链查询参数
export interface BlockchainQueryParams {
  name?: string;         // 公链名称
  mainCurrency?: string; // 主币
  pageNum: number;       // 页码
  pageSize: number;      // 每页条数
}

// 代币信息类型
export interface TokenInfo {
  id: string;            // 代币ID
  name: string;          // 代币名称
  symbol: string;        // 代币符号
  contract: string;      // 合约地址
  blockchain: string;    // 所属公链
  decimals: number;      // 小数位数
  addTime: string;       // 添加时间
}

// 代币查询参数
export interface TokenQueryParams {
  name?: string;         // 代币名称
  symbol?: string;       // 代币符号
  contract?: string;     // 合约地址
  blockchain?: string;   // 所属公链
  pageNum: number;       // 页码
  pageSize: number;      // 每页条数
}

// 分页结果
export interface PageResult<T> {
  list: T[];             // 数据列表
  total: number;         // 总条数
  pageNum: number;       // 当前页码
  pageSize: number;      // 每页条数
} 
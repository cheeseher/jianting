// 监听地址类型
export interface MonitorAddress {
  id?: string;        // 地址ID
  address: string;    // 地址
  chain: string;      // 公链
  mainBalance: string; // 主币余额
  tokenBalance: string; // 代币余额
  customers?: string[];  // 所属客户列表
  customer?: string;  // 所属客户（兼容旧数据）
  customerId?: string; // 客户ID（兼容旧数据）
  addTime: string;    // 添加时间
  updateTime: string; // 更新时间
  
  // 监控条件相关字段
  triggerAmount?: number;     // 单笔触发金额
  maxPercentage: number;     // 历史最大单笔金额百分比
  triggerAction?: 'transfer' | 'multi-sign';  // 触发动作
  monitorStatus?: boolean;    // 监控状态
}

// 地址查询参数
export interface AddressQueryParams {
  chain?: string;     // 公链
  address?: string;   // 地址关键字
  customerId?: string; // 客户ID
  pageNum: number;    // 页码
  pageSize: number;   // 每页条数
}

// 公链选项
export interface ChainOption {
  value: string;      // 值
  label: string;      // 标签
}

// 分页结果
export interface PageResult<T> {
  list: T[];          // 数据列表
  total: number;      // 总条数
  pageNum: number;    // 当前页码
  pageSize: number;   // 每页条数
}

// 地址变动记录类型
export interface AddressChangeRecord {
  id?: string;        // 记录ID
  address: string;    // 监听地址
  chain: string;      // 公链
  type: string;       // 类型（添加/删除）
  operator: string;   // 操作人
  operateTime: string; // 操作时间
}

// 地址变动记录查询参数
export interface AddressChangeRecordQueryParams {
  address?: string;   // 监听地址
  chain?: string;     // 公链
  customerId?: string; // 客户ID
  type?: string;      // 操作类型
  timeRange?: string[]; // 操作时间范围
  pageNum: number;    // 页码
  pageSize: number;   // 每页条数
}

// 回调记录类型
export interface CallbackRecord {
  id: string;           // 回调ID
  hash: string;         // 交易Hash
  monitorAddress: string; // 监听地址
  targetAddress: string;  // 对象地址
  type: string;         // 类型（转入/转出）
  chain: string;        // 公链
  tokenName: string;    // 代币名称
  tokenContract: string; // 代币合约
  amount: string;       // 转账数量
  customer: string;     // 客户
  callbackTime: string; // 回调时间
  status: string;       // 回调状态
}

// 回调记录查询参数
export interface CallbackRecordQueryParams {
  id?: string;          // 回调ID
  hash?: string;        // 交易Hash
  monitorAddress?: string; // 监听地址
  targetAddress?: string;  // 对象地址
  type?: string;        // 类型
  chain?: string;       // 公链
  tokenName?: string;   // 代币名称
  customer?: string;    // 客户
  timeRange?: string[]; // 回调时间范围
  status?: string;      // 回调状态
  pageNum: number;      // 页码
  pageSize: number;     // 每页条数
} 
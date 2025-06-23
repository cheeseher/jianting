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
  secondaryList?: boolean;   // 二次列表状态
  secondaryListMode?: '' | 'manual' | 'auto';  // 二次列表开启方式：auto-自动，manual-手动，空字符串-关闭
  isInSecondaryList?: boolean; // 是否已进入二次列表状态
  monitorStatus?: boolean;    // 监控状态

  // 币种监控条件相关字段
  monitorChains?: string[];   // 要监控的公链列表
  monitorTokens?: string[];   // 要监控的代币列表，格式为 "${chain}-${tokenId}"
  
  // 为每个币种单独存储监控条件
  chainConditions?: Record<string, CurrencyCondition>; // 公链单独监控条件，key为公链名称
  tokenConditions?: Record<string, CurrencyCondition>; // 代币单独监控条件，key为"${chain}-${tokenId}"格式
}

// 币种监控条件类型
export interface CurrencyCondition {
  triggerAmount: number;      // 单笔触发金额
  maxPercentage: number;      // 历史最大单笔金额百分比
  triggerAction: 'transfer' | 'multi-sign';  // 触发动作
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
  
  // UTXO模型特有字段（适用于BTC等UTXO模型的链）
  fromAddresses?: string[];    // 输入地址列表
  fromAmounts?: string[];      // 输入金额列表
  toAddresses?: string[];      // 输出地址列表
  toAmounts?: string[];        // 输出金额列表
  changeAddress?: string;      // 找零地址（仅转出交易有）
  changeAmount?: string;       // 找零金额（仅转出交易有）
  netAmount?: string;          // 净转出金额（仅转出交易有）
  receivedAmount?: string;     // 收到金额（仅转入交易有）
  utxoData?: {                 // UTXO数据（替代方案）
    fromAddresses: string[];   // 输入地址列表
    fromAmounts: string[];     // 输入金额列表
    toAddresses: string[];     // 输出地址列表
    toAmounts: string[];       // 输出金额列表
    changeAddress?: string;    // 找零地址（仅转出交易有）
    changeAmount?: string;     // 找零金额（仅转出交易有）
    netAmount?: string;        // 净转出金额（仅转出交易有）
    receivedAmount?: string;   // 收到金额（仅转入交易有）
  }
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
  customerId?: string;  // 客户ID
  customerName?: string; // 客户名称
  customer?: string;    // 客户（兼容旧数据）
  timeRange?: string[]; // 回调时间范围
  status?: string;      // 回调状态
  pageNum: number;      // 页码
  pageSize: number;     // 每页条数
}

// 异常触发记录类型
export interface TriggerRecord {
  id: string;           // 记录ID
  triggerTime: string;  // 触发时间
  monitorAddress: string; // 监听地址
  customer: string;     // 客户
  hash: string;         // 交易哈希
  amount: string;       // 交易金额
  triggerDesc: string;  // 触发条件描述
  triggerAction: string; // 触发动作（闪电转账/多签）
  actionStatus: string; // 动作状态（未提交/提交成功/提交失败）
  failReason?: string;  // 失败原因
  isSecondaryList?: boolean; // 是否为二次列表自动触发
}

// 异常触发记录查询参数
export interface TriggerRecordQueryParams {
  monitorAddress?: string; // 监听地址
  customerId?: string;    // 客户ID
  customerName?: string;  // 客户名称
  customer?: string;      // 客户（兼容旧数据）
  triggerAction?: string; // 触发动作
  actionStatus?: string;  // 动作状态
  isSecondaryList?: boolean; // 是否为二次列表自动触发
  timeRange?: string[];   // 触发时间范围
  pageNum: number;        // 页码
  pageSize: number;       // 每页条数
}

// 动作执行记录类型
export interface ActionRecord {
  id: string;           // 记录ID
  executeTime: string;  // 执行时间
  monitorAddress: string; // 监听地址
  customer: string;     // 客户
  relatedTriggerId: string; // 关联异常记录ID
  actionType: string;   // 动作类型（闪电转账/多签）
  actionStatus: string; // 动作状态（提交成功/处理中/失败/完成）
  failReason?: string;  // 失败原因
  triggerSource?: string; // 触发来源（二次列表自动/监控条件命中）
}

// 动作执行记录查询参数
export interface ActionRecordQueryParams {
  monitorAddress?: string; // 监听地址
  customerId?: string;    // 客户ID
  customerName?: string;  // 客户名称
  customer?: string;      // 客户（兼容旧数据）
  actionType?: string;    // 动作类型
  actionStatus?: string;  // 动作状态
  triggerSource?: string; // 触发来源
  timeRange?: string[];   // 执行时间范围
  pageNum: number;        // 页码
  pageSize: number;       // 每页条数
} 
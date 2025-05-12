// TG通知机器人设置类型
export interface TelegramBot {
  id: string;         // 唯一ID
  customerId: string;  // 客户ID
  customerName?: string; // 客户名称（用于展示）
  chainType: string;   // 链类型
  sendUrl: string;     // 交易通知链接
  transferUrl: string; // 闪电转账链接
  multiSignUrl: string; // 多签链接
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
}

// TG通知机器人查询参数
export interface TelegramBotQueryParams {
  customerId?: string;  // 客户ID
  chainType?: string;   // 链类型
  pageNum: number;      // 页码
  pageSize: number;     // 每页条数
}

// 分页结果
export interface PaginationResult<T> {
  list: T[];           // 列表数据
  total: number;       // 总记录数
  pageNum: number;     // 当前页码
  pageSize: number;    // 每页条数
} 
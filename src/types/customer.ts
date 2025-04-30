// 客户信息类型
export interface Customer {
  id: string;          // 客户ID
  name: string;        // 客户名称
  monitorAddressCount: number;  // 监听地址数量
  callbackUrl: string; // 回调地址
  status: boolean;     // 状态
  updateTime: string;  // 更新时间
}

// 客户列表查询参数
export interface CustomerListParams {
  keyword?: string;    // 查询关键字
  status?: string;     // 状态
  timeRange?: [string, string]; // 时间范围
  pageNum: number;     // 当前页码
  pageSize: number;    // 每页条数
}

// 分页结果
export interface PaginationResult<T> {
  list: T[];           // 列表数据
  total: number;       // 总记录数
  pageNum: number;     // 当前页码
  pageSize: number;    // 每页条数
} 
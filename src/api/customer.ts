import { Customer, CustomerListParams, PaginationResult } from '@/types/customer'

// 模拟客户列表数据
export const getCustomerList = (params: CustomerListParams): Promise<PaginationResult<Customer>> => {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟数据
      const list: Customer[] = [
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

      resolve({
        list,
        total: 4,
        pageNum: params.pageNum,
        pageSize: params.pageSize
      })
    }, 500)
  })
}

// 添加客户
export const addCustomer = (data: Omit<Customer, 'id' | 'updateTime'>): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 500)
  })
}

// 更新客户
export const updateCustomer = (data: Customer): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 500)
  })
}

// 删除客户
export const deleteCustomer = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 500)
  })
} 
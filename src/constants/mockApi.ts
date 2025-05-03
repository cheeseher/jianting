import { MonitorAddress } from '@/types/monitor'
import { TelegramBot } from '@/types/telegram'
import { ElMessage } from 'element-plus'

// 添加监听地址
export const addAddress = (data: MonitorAddress): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('添加成功')
      resolve(true)
    }, 500)
  })
}

// 删除监听地址
export const deleteAddress = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('删除成功')
      resolve(true)
    }, 500)
  })
}

// 批量删除监听地址
export const batchDeleteAddress = (ids: string[]): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success(`成功删除${ids.length}条记录`)
      resolve(true)
    }, 500)
  })
}

// 保存公链
export const saveBlockchain = (data: any): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('保存成功')
      resolve(true)
    }, 500)
  })
}

// 删除公链
export const deleteBlockchain = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('删除成功')
      resolve(true)
    }, 500)
  })
}

// 保存代币
export const saveToken = (data: any): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('保存成功')
      resolve(true)
    }, 500)
  })
}

// 删除代币
export const deleteToken = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('删除成功')
      resolve(true)
    }, 500)
  })
}

// 添加客户
export const addCustomer = (data: any): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('添加成功')
      resolve(true)
    }, 500)
  })
}

// 更新客户
export const updateCustomer = (data: any): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('更新成功')
      resolve(true)
    }, 500)
  })
}

// 删除客户
export const deleteCustomer = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('删除成功')
      resolve(true)
    }, 500)
  })
}

// 添加TG机器人设置
export const addTelegramBot = (data: TelegramBot): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('添加成功')
      resolve(true)
    }, 500)
  })
}

// 更新TG机器人设置
export const updateTelegramBot = (data: TelegramBot): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('更新成功')
      resolve(true)
    }, 500)
  })
}

// 删除TG机器人设置
export const deleteTelegramBot = (id: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      ElMessage.success('删除成功')
      resolve(true)
    }, 500)
  })
} 
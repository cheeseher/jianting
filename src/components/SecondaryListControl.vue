<template>
  <div class="secondary-list-control" style="width: 100%">
    <el-select
      v-model="mode"
      placeholder="请选择二次列表模式"
      style="width: 180px"
      @change="handleModeChange"
    >
      <el-option label="关闭" value="" />
      <el-option label="手动开启" value="manual" />
      <el-option label="自动开启" value="auto" />
    </el-select>
    
    <el-tag
      v-if="mode"
      :type="address.isInSecondaryList ? 'success' : 'warning'"
      style="margin-left: 12px"
    >
      {{ address.isInSecondaryList ? '已进入二次列表' : '待触发进入' }}
    </el-tag>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { MonitorAddress } from '@/types/monitor'
import { ElMessageBox } from 'element-plus'

const props = defineProps<{
  address: MonitorAddress
}>()

const emit = defineEmits<{
  (e: 'update', address: MonitorAddress): void
}>()

const mode = computed({
  get: () => props.address.secondaryListMode || '',
  set: (value) => {
    const newAddress = { ...props.address }
    newAddress.secondaryListMode = value
    
    // 当模式改变时，重置二次列表状态
    if (value === '') {
      newAddress.isInSecondaryList = false
    } else if (value === 'manual') {
      // 手动模式下，保持当前状态
    } else if (value === 'auto') {
      // 自动模式下，初始状态为未进入
      newAddress.isInSecondaryList = false
    }
    
    emit('update', newAddress)
  }
})

const handleModeChange = async (value: string) => {
  if (value === 'manual') {
    try {
      await ElMessageBox.confirm(
        '手动开启后，该地址的所有交易将直接自动执行闪电转账，无需命中监控条件。确认开启？',
        '确认手动开启',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      // 手动模式确认后，直接设置为已进入状态
      const newAddress = { ...props.address }
      newAddress.secondaryListMode = value
      newAddress.isInSecondaryList = true
      emit('update', newAddress)
    } catch {
      // 用户取消，恢复状态
      const newAddress = { ...props.address }
      newAddress.secondaryListMode = ''
      newAddress.isInSecondaryList = false
      emit('update', newAddress)
    }
  }
}
</script>

<style scoped>
.secondary-list-control {
  display: flex;
  align-items: center;
}
</style> 
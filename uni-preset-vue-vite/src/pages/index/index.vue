<template>
  <view class="page-container">
    <!-- 通知栏 -->
    <van-notice-bar
      scrollable
      text="欢迎来到撸咖健身！"  
      class="notice-bar"
      color="#323233"
      background="#ffffff"
      left-icon="volume-o"
    />

    <!-- 轮播图 -->
    <van-swipe 
      class="swipe-container" 
      :autoplay="3000" 
      indicator-color="var(--primary-color)"
      :show-indicators="true"
      :duration="500"
    >
      <van-swipe-item v-for="(item, index) in 4" :key="index" class="swipe-item">
        <image :src="`/static/banner/${index + 1}.jpg`" class="swipe-image" mode="aspectFill" />
      </van-swipe-item>
    </van-swipe>

    <!-- 手动推送按钮 -->
    <view class="manual-push">
      <van-button type="primary" size="normal" icon="bullhorn-o" round block @click="sendManualNotification">
        <template #icon>
          <van-icon name="bullhorn-o" class="push-icon" />
        </template>
        发送会员到期提醒
      </van-button>
    </view>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <!-- 会员分类折叠面板 -->
      <view class="category-panels">
        <!-- 一个月会员分类 -->
        <view class="category-panel">
          <view class="panel-header" @click="togglePanel('oneMonth')">
            <text class="panel-title">月卡</text>
            <van-icon :name="activePanels.oneMonth ? 'arrow-up' : 'arrow-down'" class="panel-icon" />
          </view>
          <view class="panel-content" :class="{ 'expanded': activePanels.oneMonth }">
            <view 
              v-for="member in getFilteredMembers('oneMonth')" 
              :key="member.id" 
              class="list-item"
              @click="goToDetail(member.id)"
            >
              <view class="list-item-header">
                <text class="item-id">{{ member.id }}</text>
                <text class="item-name">{{ member.username }}</text>
                <text :class="['tag', isMemberActive(member) ? 'tag-success' : 'tag-danger']">
                  {{ isMemberActive(member) ? '正常' : '过期' }}
                </text>
              </view>
              
              <view class="list-item-content">
                <text class="member-type" :class="{ 'member-type-vip': member.membership_type === 2 }">
                  {{ member.membership_type === 2 ? 'VIP会员' : '普通会员' }}
                </text>
                <text class="member-info">{{ member.phone }}</text>
              </view>
              
              <view class="list-item-footer">
                <text class="date-range">
                  到期时间：{{ formatDate(member.end_date) }}
                </text>
              </view>
            </view>
            <view v-if="getFilteredMembers('oneMonth').length === 0" class="empty-list">
              暂无月卡会员
            </view>
          </view>
        </view>
        
        <!-- 三个月会员分类 -->
        <view class="category-panel">
          <view class="panel-header" @click="togglePanel('threeMonths')">
            <text class="panel-title">季卡</text>
            <van-icon :name="activePanels.threeMonths ? 'arrow-up' : 'arrow-down'" class="panel-icon" />
          </view>
          <view class="panel-content" :class="{ 'expanded': activePanels.threeMonths }">
            <view 
              v-for="member in getFilteredMembers('threeMonths')" 
              :key="member.id" 
              class="list-item"
              @click="goToDetail(member.id)"
            >
              <view class="list-item-header">
                <text class="item-id">{{ member.id }}</text>
                <text class="item-name">{{ member.username }}</text>
                <text :class="['tag', isMemberActive(member) ? 'tag-success' : 'tag-danger']">
                  {{ isMemberActive(member) ? '正常' : '过期' }}
                </text>
              </view>
              
              <view class="list-item-content">
                <text class="member-type" :class="{ 'member-type-vip': member.membership_type === 2 }">
                  {{ member.membership_type === 2 ? 'VIP会员' : '普通会员' }}
                </text>
                <text class="member-info">{{ member.phone }}</text>
              </view>
              
              <view class="list-item-footer">
                <text class="date-range">
                  到期时间：{{ formatDate(member.end_date) }}
                </text>
              </view>
            </view>
            <view v-if="getFilteredMembers('threeMonths').length === 0" class="empty-list">
              暂无季卡会员
            </view>
          </view>
        </view>
        
        <!-- 六个月会员分类 -->
        <view class="category-panel">
          <view class="panel-header" @click="togglePanel('sixMonths')">
            <text class="panel-title">半年卡</text>
            <van-icon :name="activePanels.sixMonths ? 'arrow-up' : 'arrow-down'" class="panel-icon" />
          </view>
          <view class="panel-content" :class="{ 'expanded': activePanels.sixMonths }">
            <view 
              v-for="member in getFilteredMembers('sixMonths')" 
              :key="member.id" 
              class="list-item"
              @click="goToDetail(member.id)"
            >
              <view class="list-item-header">
                <text class="item-id">{{ member.id }}</text>
                <text class="item-name">{{ member.username }}</text>
                <text :class="['tag', isMemberActive(member) ? 'tag-success' : 'tag-danger']">
                  {{ isMemberActive(member) ? '正常' : '过期' }}
                </text>
              </view>
              
              <view class="list-item-content">
                <text class="member-type" :class="{ 'member-type-vip': member.membership_type === 2 }">
                  {{ member.membership_type === 2 ? 'VIP会员' : '普通会员' }}
                </text>
                <text class="member-info">{{ member.phone }}</text>
              </view>
              
              <view class="list-item-footer">
                <text class="date-range">
                  到期时间：{{ formatDate(member.end_date) }}
                </text>
              </view>
            </view>
            <view v-if="getFilteredMembers('sixMonths').length === 0" class="empty-list">
              暂无半年卡会员
            </view>
          </view>
        </view>
        
        <!-- 十二个月会员分类 -->
        <view class="category-panel">
          <view class="panel-header" @click="togglePanel('twelveMonths')">
            <text class="panel-title">年卡</text>
            <van-icon :name="activePanels.twelveMonths ? 'arrow-up' : 'arrow-down'" class="panel-icon" />
          </view>
          <view class="panel-content" :class="{ 'expanded': activePanels.twelveMonths }">
            <view 
              v-for="member in getFilteredMembers('twelveMonths')" 
              :key="member.id" 
              class="list-item"
              @click="goToDetail(member.id)"
            >
              <view class="list-item-header">
                <text class="item-id">{{ member.id }}</text>
                <text class="item-name">{{ member.username }}</text>
                <text :class="['tag', isMemberActive(member) ? 'tag-success' : 'tag-danger']">
                  {{ isMemberActive(member) ? '正常' : '过期' }}
                </text>
              </view>
              
              <view class="list-item-content">
                <text class="member-type" :class="{ 'member-type-vip': member.membership_type === 2 }">
                  {{ member.membership_type === 2 ? 'VIP会员' : '普通会员' }}
                </text>
                <text class="member-info">{{ member.phone }}</text>
              </view>
              
              <view class="list-item-footer">
                <text class="date-range">
                  到期时间：{{ formatDate(member.end_date) }}
                </text>
              </view>
            </view>
            <view v-if="getFilteredMembers('twelveMonths').length === 0" class="empty-list">
              暂无年卡会员
            </view>
          </view>
        </view>
        
        <!-- 普通会员分类 - 已注释，因为不需要
        <view class="category-panel">
          <view class="panel-header" @click="togglePanel('normal')">
            <text class="panel-title">所有普通会员</text>
            <van-icon :name="activePanels.normal ? 'arrow-up' : 'arrow-down'" class="panel-icon" />
          </view>
          <view class="panel-content" :class="{ 'expanded': activePanels.normal }">
            <view 
              v-for="member in getFilteredMembers('normal')" 
              :key="member.id" 
              class="list-item"
              @click="goToDetail(member.id)"
            >
              <view class="list-item-header">
                <text class="item-id">{{ member.id }}</text>
                <text class="item-name">{{ member.username }}</text>
                <text :class="['tag', isMemberActive(member) ? 'tag-success' : 'tag-danger']">
                  {{ isMemberActive(member) ? '正常' : '过期' }}
                </text>
              </view>
              
              <view class="list-item-content">
                <text class="member-type">普通会员</text>
                <text class="member-info">{{ member.phone }}</text>
              </view>
              
              <view class="list-item-footer">
                <text class="date-range">
                  到期时间：{{ formatDate(member.end_date) }}
                </text>
              </view>
            </view>
            <view v-if="getFilteredMembers('normal').length === 0" class="empty-list">
              暂无普通会员
            </view>
          </view>
        </view>
        -->
        
        <!-- VIP会员分类 - 已注释，因为不需要
        <view class="category-panel">
          <view class="panel-header" @click="togglePanel('vip')">
            <text class="panel-title">所有VIP会员</text>
            <van-icon :name="activePanels.vip ? 'arrow-up' : 'arrow-down'" class="panel-icon" />
          </view>
          <view class="panel-content" :class="{ 'expanded': activePanels.vip }">
            <view 
              v-for="member in getFilteredMembers('vip')" 
              :key="member.id" 
              class="list-item"
              @click="goToDetail(member.id)"
            >
              <view class="list-item-header">
                <text class="item-id">{{ member.id }}</text>
                <text class="item-name">{{ member.username }}</text>
                <text :class="['tag', isMemberActive(member) ? 'tag-success' : 'tag-danger']">
                  {{ isMemberActive(member) ? '正常' : '过期' }}
                </text>
              </view>
              
              <view class="list-item-content">
                <text class="member-type member-type-vip">VIP会员</text>
                <text class="member-info">{{ member.phone }}</text>
              </view>
              
              <view class="list-item-footer">
                <text class="date-range">
                  到期时间：{{ formatDate(member.end_date) }}
                </text>
              </view>
            </view>
            <view v-if="getFilteredMembers('vip').length === 0" class="empty-list">
              暂无VIP会员
            </view>
          </view>
        </view>
        -->
      </view>
    </van-pull-refresh>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getMemberList, sendWechatNotification } from '@/api/request'
import { calculateRemainingDays, isMemberActive as isActive, formatDate as formatDateUtil } from '@/utils/dateUtils'

const memberList = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
let checkInterval = null

// 管理面板的展开/折叠状态
const activePanels = ref({
  oneMonth: false,
  threeMonths: false,
  sixMonths: false,
  twelveMonths: false,
  normal: false,
  vip: false
})

// 切换面板展开/折叠状态
const togglePanel = (panelName) => {
  activePanels.value[panelName] = !activePanels.value[panelName]
}

// 根据不同类别筛选会员列表
const getFilteredMembers = (category) => {
  if (!memberList.value || memberList.value.length === 0) {
    return []
  }
  
  switch (category) {
    case 'oneMonth':
      // 过滤出开通时长为一个月的会员
      return memberList.value.filter(member => member.duration === 1);
    case 'threeMonths':
      // 过滤出开通时长为三个月的会员
      return memberList.value.filter(member => member.duration === 3);
    case 'sixMonths':
      // 过滤出开通时长为六个月的会员
      return memberList.value.filter(member => member.duration === 6);
    case 'twelveMonths':
      // 过滤出开通时长为十二个月的会员
      return memberList.value.filter(member => member.duration === 12);
    case 'normal':
      // 过滤出所有普通会员
      return memberList.value.filter(member => member.membership_type === 1);
    case 'vip':
      // 过滤出所有VIP会员
      return memberList.value.filter(member => member.membership_type === 2);
    default:
      return memberList.value;
  }
}

// 加载会员列表
const loadMembers = async () => {
  try {
    loading.value = true
    const response = await getMemberList()
    if (response.code === 200) {
      if (refreshing.value) {
        memberList.value = []
        refreshing.value = false
      }
      // 直接使用response.data数组，因为API直接返回会员列表数组
      memberList.value.push(...response.data)
      // 由于API返回的是完整列表，设置finished为true
      finished.value = true
    } else {
      uni.showToast({
        title: response.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('加载会员列表失败:', error)
    uni.showToast({
      title: '加载失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 下拉刷新
const onRefresh = () => {
  finished.value = false
  currentPage.value = 1
  loadMembers()
}

// 上拉加载
const onLoad = () => {
  currentPage.value++
  loadMembers()
}

// 跳转到详情页
const goToDetail = (id) => {
  // 先存储要查看的会员ID
  uni.setStorageSync('currentMemberId', id)
  // 使用switchTab导航到详情页
  uni.switchTab({
    url: '/pages/detail/detail'
  })
}

// 使用工具函数
const formatDate = formatDateUtil
const isMemberActive = (member) => isActive(member.end_date)

// 发送手动推送
const sendManualNotification = async () => {
  try {
    const expiringMembers = []
    const expiredMembers = []
    
    memberList.value.forEach(member => {
      const remainingDays = calculateRemainingDays(member.end_date)
      console.log(`会员 ${member.username} 到期日期: ${member.end_date}, 剩余天数: ${remainingDays}`)
      
      if (remainingDays === 3) {
        console.log(`${member.username} 将在3天后到期，添加到提醒列表`)
        expiringMembers.push(member)
      } else if (remainingDays === 0) {
        console.log(`${member.username} 已过期，添加到过期列表`)
        expiredMembers.push(member)
      }
    })
    
    console.log('即将到期会员:', expiringMembers.map(m => m.username))
    console.log('已过期会员:', expiredMembers.map(m => m.username))
    
    // 发送推送
    if (expiringMembers.length > 0 || expiredMembers.length > 0) {
      try {
        const result = await sendWechatNotification(expiringMembers, expiredMembers)
        console.log('手动推送结果:', result)
        uni.showToast({
          title: '会员到期提醒已发送',
          icon: 'success',
          duration: 2000
        })
      } catch (error) {
        console.error('通过API推送失败，尝试使用链接方式:', error)
        // 如果API推送失败，使用直接链接方式
        openPushLink(expiringMembers, expiredMembers)
      }
    } else {
      uni.showToast({
        title: '没有需要提醒的会员',
        icon: 'none',
        duration: 2000
      })
    }
  } catch (error) {
    console.error('手动推送失败:', error)
    uni.showToast({
      title: '手动推送失败',
      icon: 'none',
      duration: 2000
    })
  }
}

// 使用链接方式发送推送
const openPushLink = (expiringMembers, expiredMembers) => {
  const token = 'WGEEX4QE5CMb7b1hcsL670AIR'
  const title = '撸咖健身-会员到期提醒'
  
  let content = `提醒时间: ${new Date().toLocaleDateString()}\n\n`
  
  if (expiringMembers && expiringMembers.length > 0) {
    content += '【即将到期会员】\n'
    expiringMembers.forEach(member => {
      const endDate = new Date(member.end_date).toLocaleDateString()
      content += `${member.username} - 仅剩3天 (到期日期: ${endDate})\n`
    })
  }
  
  if (expiredMembers && expiredMembers.length > 0) {
    content += '\n【已到期会员】\n'
    expiredMembers.forEach(member => {
      const endDate = new Date(member.end_date).toLocaleDateString()
      content += `${member.username} - 已到期 (到期日期: ${endDate})\n`
    })
  }
  
  content += '\n撸咖健身提醒您及时联系会员续费，感谢您的使用。'
  
  // 创建URL
  const url = `https://wx.xtuis.cn/${token}.send?text=${encodeURIComponent(title)}&desp=${encodeURIComponent(content)}`
  
  // 在新窗口中打开URL
  window.open(url, '_blank')
  
  uni.showToast({
    title: '已打开推送链接',
    icon: 'success',
    duration: 2000
  })
}

// 检查是否需要发送提醒
const checkAndSendNotification = async () => {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // 如果是早上7:55，刷新列表
  if (hours === 7 && minutes === 55) {
    console.log('7:55 - 刷新会员列表')
    await loadMembers()
  }
  
  // 如果是早上8:00，发送提醒
  if (hours === 8 && minutes === 0) {
    console.log('8:00 - 发送会员到期提醒')
    await sendManualNotification()
  }
}

// 启动定时检查
const startScheduledCheck = () => {
  // 每分钟检查一次
  checkInterval = setInterval(checkAndSendNotification, 60000)
  console.log('已启动定时检查')
}

// 停止定时检查
const stopScheduledCheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
    console.log('已停止定时检查')
  }
}

// 组件挂载时加载会员列表并启动定时检查
onMounted(() => {
  loadMembers()
  startScheduledCheck()
})

// 在组件卸载时停止定时检查
onUnmounted(() => {
  stopScheduledCheck()
})

</script>

<style>
.page-container {
  min-height: 100vh;
  background-color: #ffffff;
  padding: 16px !important;
  padding-bottom: 0 !important;
  --van-notice-bar-background-color: #fff;
  --van-notice-bar-height: 40px;
  --van-swipe-indicator-size: 6px;
  --van-swipe-indicator-margin: 4px;
  --van-pull-refresh-head-height: 50px;
  --van-list-text-color: #64748b;
  --van-list-text-font-size: 14px;
  --van-list-loading-icon-size: 16px;
}

/* 通知栏样式 */
.notice-bar {
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

:deep(.van-notice-bar__content) {
  font-size: 14px;
}

:deep(.van-notice-bar__left-icon) {
  margin-right: 6px;
  font-size: 16px;
  color: #3b82f6;
}

/* 轮播图样式 */
.swipe-container {
  margin: 0 0 16px 0;
  width: 100%;
  height: 340rpx !important;
  border-radius: 16px;
  overflow: hidden;
  background-color: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.swipe-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f5f5f5;
}

.swipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--border-radius);
}

:deep(.van-swipe__track) {
  height: 100% !important;
}

:deep(.van-swipe__indicators) {
  bottom: 12px !important;
}

:deep(.van-swipe__indicator) {
  width: 6px !important;
  height: 6px !important;
  background-color: rgba(255, 255, 255, 0.6) !important;
  opacity: 1 !important;
  margin: 0 4px !important;
}

:deep(.van-swipe__indicator--active) {
  width: 18px !important;
  border-radius: 3px !important;
  background-color: var(--primary-color) !important;
}

/* 类别面板样式 */
.category-panels {
  margin-top: 16px;
  transform: translateZ(0); /* 启用硬件加速 */
}

.category-panel {
  margin-bottom: 16px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  will-change: transform;
  transform: translateZ(0); /* 启用硬件加速 */
}

.category-panel:active {
  transform: scale(0.99);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px;
  background: linear-gradient(to right, #f9fafc, #f1f5f9);
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  position: relative;
  z-index: 1; /* 确保在内容上方 */
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.panel-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: #3b82f6;
  border-radius: 2px;
  margin-right: 10px;
}

.panel-icon {
  font-size: 16px;
  color: #64748b;
  transition: transform 0.3s ease;
  will-change: transform;
}

.panel-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out, opacity 0.2s ease-out, transform 0.2s ease-out, padding 0.15s ease-out;
  padding: 0;
  opacity: 0;
  transform: translateY(-8px);
  will-change: max-height, opacity, transform, padding;
  transform: translateZ(0); /* 启用硬件加速 */
  backface-visibility: hidden; /* 优化渲染性能 */
  -webkit-backface-visibility: hidden;
}

.panel-content.expanded {
  max-height: 2000px;
  padding: 16px;
  opacity: 1;
  transform: translateY(0);
  transition: max-height 0.4s ease-in, opacity 0.25s ease-in, transform 0.25s ease-in, padding 0.1s ease;
}

.empty-list {
  padding: 24px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 12px;
  margin: 8px 0;
}

/* 列表项样式 */
.list-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.list-item:last-child {
  margin-bottom: 0;
}

.list-item:active {
  transform: scale(0.98);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
}

.list-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.item-id {
  color: #94a3b8;
  font-size: 14px;
  margin-right: 12px;
}

.item-name {
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  flex: 1;
}

.tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  background: #e2f2ff;
  color: #3b82f6;
  font-weight: 500;
}

.tag-success {
  background: #dcfce7;
  color: #10b981;
}

.tag-danger {
  background: #fee2e2;
  color: #ef4444;
}

.list-item-content {
  display: flex;
  align-items: center;
  margin: 8px 0;
  gap: 12px;
}

.member-type {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  background: #e0f2fe;
  color: #3b82f6;
  font-weight: 500;
}

.member-type-vip {
  background: #fff7ed;
  color: #f59e0b;
}

.member-info {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.list-item-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
}

.date-range {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* 手动推送按钮样式 */
.manual-push {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  padding: 0 16px;
}

.manual-push .van-button {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  border: none;
  height: 44px;
  width:70%;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.manual-push .van-button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
}

.push-icon {
  margin-right: 4px;
  font-size: 16px;
}
</style>


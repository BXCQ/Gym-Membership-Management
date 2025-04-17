<template>
  <!-- 页面容器 -->
  <view class="page-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="nav-title">会员详情</view>
      <view class="nav-actions">
        <!-- 添加会员按钮 -->
        <van-button size="small" color="#3b82f6" type="primary" icon="plus" round
          @click="showAddUserModal">添加会员</van-button>
      </view>
    </view>

    <!-- 主内容区 - 仅在有用户ID时显示 -->
    <view class="content-container" v-if="userId">
      <!-- 会员资料卡片 -->
      <view class="profile-card">
        <!-- 会员资料头部 - VIP会员有特殊样式 -->
        <view class="profile-header" :class="{ 'vip-header': userInfo.membership_type === 2 }">
          <!-- 会员头像容器 -->
          <view class="avatar-container">
            <image class="avatar" :src="userInfo.avatar || '/static/avatar/default_avatar.jpg'" mode="aspectFill" />
          </view>
          <!-- 会员基本信息 -->
          <view class="profile-info">
            <view class="profile-name-row">
              <!-- 会员姓名 -->
              <text class="profile-name">{{ userInfo.username || '未设置' }}</text>
              <!-- 会员状态标签 - 根据到期状态显示不同样式 -->
              <view class="membership-badge" :class="{ 'expired': isExpired, 'expiring': isExpiring }">
                {{ membershipStatus }}
              </view>
            </view>
            <view class="profile-meta">
              <!-- 会员ID -->
              <text class="member-id">ID: {{ userId }}</text>
              <!-- 会员类型 -->
              <text class="member-type">{{ userInfo.membership_type === 2 ? 'VIP会员' : '普通会员' }}</text>
            </view>
          </view>
        </view>

        <!-- 会员详细信息区域 -->
        <view class="info-section">
          <view class="info-grid">
            <!-- 剩余课程信息 - 仅VIP会员显示 -->
            <view class="info-item" v-if="userInfo.membership_type === 2">
              <van-icon name="coupon-o" class="info-icon" />
              <view class="info-content">
                <text class="info-label">剩余课程</text>
                <!-- 课程数量低于3节时警告显示 -->
                <text class="info-value highlight" :class="{ 'warning': calculateRemainingCourses <= 3 }">{{
                  calculateRemainingCourses }}节</text>
              </view>
            </view>
            <!-- 联系电话 -->
            <view class="info-item">
              <van-icon name="phone-o" class="info-icon" />
              <view class="info-content">
                <text class="info-label">联系电话</text>
                <text class="info-value">{{ userInfo.phone || '未设置' }}</text>
              </view>
            </view>
            <!-- 性别 -->
            <view class="info-item">
              <van-icon name="contact" class="info-icon" />
              <view class="info-content">
                <text class="info-label">性别</text>
                <text class="info-value">{{ formatGender(userInfo.gender) }}</text>
              </view>
            </view>
            <!-- 注册时间 -->
            <view class="info-item">
              <van-icon name="clock-o" class="info-icon" />
              <view class="info-content">
                <text class="info-label">注册时间</text>
                <text class="info-value">{{ formatDate(userInfo.start_date) }}</text>
              </view>
            </view>
            <!-- 到期时间 -->
            <view class="info-item">
              <van-icon name="clock" class="info-icon" />
              <view class="info-content">
                <text class="info-label">到期时间</text>
                <text class="info-value">{{ formatDate(userInfo.end_date) }}</text>
              </view>
            </view>
            <!-- 剩余天数 -->
            <view class="info-item">
              <van-icon name="underway-o" class="info-icon" />
              <view class="info-content">
                <text class="info-label">剩余天数</text>
                <!-- 剩余天数少于7天显示警告 -->
                <text class="info-value" :class="{ 'warning': remainingDays <= 7 }">{{ remainingDays }}天</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 会员操作区域 - 可折叠 -->
        <view class="action-section" v-if="userInfo.membership_type">
          <!-- 标题栏 - 点击可切换展开/收起 -->
          <view class="section-header" @click="toggleServiceSection">
            <view class="section-title-row">
              <text class="section-title">会员服务</text>
              <!-- 展开/收起图标 -->
              <van-icon :name="isServiceExpanded ? 'arrow-up' : 'arrow-down'" class="section-icon" />
            </view>
          </view>

          <!-- 服务内容 - 可展开/收起 -->
          <view class="service-content" :class="{ 'expanded': isServiceExpanded }">
            <!-- 续费时长选择区域 -->
            <view class="action-group">
              <view class="action-title">
                <van-icon name="clock-o" />
                <text>续费时长</text>
              </view>
              <!-- 续费时长选项网格 -->
              <view class="options-grid">
                <view v-for="(option, index) in renewOptions" :key="index" class="option-item"
                  :class="{ 'selected': selectedRenewOption === index }" @click="selectRenewOption(index)">
                  <text class="option-text">{{ option.text }}</text>
                </view>
              </view>
            </view>

            <!-- VIP会员课程增加选择 - 仅VIP会员显示 -->
            <view class="action-group" v-if="userInfo.membership_type === 2">
              <view class="action-title">
                <van-icon name="records" />
                <text>增加课程</text>
              </view>
              <!-- 课程数量选项网格 -->
              <view class="options-grid">
                <view v-for="(count, index) in courseCountOptions" :key="index" class="option-item"
                  :class="{ 'selected': selectedCourseCount === count.value }" @click="selectCourseCount(count.value)">
                  <text class="option-text">{{ count.text }}</text>
                </view>
              </view>
            </view>

            <!-- 操作按钮组 -->
            <view class="button-group">
              <!-- 续费按钮 - 未选择时禁用 -->
              <van-button type="primary" block round size="large" icon="success" :disabled="!canRenew"
                @click="handleRenew">
                确认续费
              </van-button>
              <!-- 删除会员按钮 -->
              <van-button type="danger" block round size="large" icon="delete" @click="handleDelete"
                style="margin-top: 16px;">
                删除会员
              </van-button>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 空状态提示 -->
    <view v-else class="empty-state">
      <van-empty description="请添加会员" />
    </view>

    <!-- 添加新会员弹窗 -->
    <van-popup v-model:show="showAddUser" round position="center" :style="{ width: '92%', maxHeight: '90%' }" closeable
      close-icon="close" @close="closeAddUserModal" class="add-user-popup">
      <view class="popup-container">
        <!-- 弹窗标题 -->
        <view class="popup-header">
          <text class="popup-title">添加新会员</text>
        </view>
        <!-- 弹窗内容 -->
        <view class="popup-content">
          <!-- 添加会员表单 -->
          <van-form @submit="handleAddUser">
            <van-cell-group inset>
              <!-- 会员姓名输入框 -->
              <van-field v-model="newUser.name" name="name" label="会员姓名" placeholder="请输入会员姓名"
                :rules="[{ required: true, message: '请填写会员姓名' }]" input-align="right" :border="false" />
              <!-- 手机号码输入框 -->
              <van-field v-model="newUser.phone" name="phone" label="手机号码" placeholder="请输入手机号码"
                :rules="[{ required: true, message: '请填写手机号码' }]" input-align="right" :border="false" />
              <!-- 性别选择框 -->
              <van-field v-model="newUser.gender" name="gender" label="性别" placeholder="请选择性别" readonly
                input-align="right" :border="false" is-link @click="showGenderPicker = true" />
              <!-- 会员类型选择框 -->
              <van-field v-model="newUser.userType" name="userType" label="会员类型" placeholder="请选择会员类型" readonly
                input-align="right" :border="false" is-link @click="showMembershipPicker = true" />
              <!-- 开始日期选择框 -->
              <van-field v-model="newUser.startDate" name="startDate" label="开始日期" placeholder="请选择开始日期" readonly
                input-align="right" :border="false" is-link @click="openDatePicker" />
              <!-- 开通时长选择框 -->
              <van-field v-model="newUser.duration" name="duration" label="开通时长" placeholder="请选择开通时长" readonly
                input-align="right" :border="false" is-link @click="showDurationPicker = true" />
              <!-- 课程数量选择框 - 仅VIP会员显示 -->
              <van-field v-if="newUser.userType === 'VIP会员'" v-model="newUser.total_courses" name="total_courses"
                label="课程数量" placeholder="请选择课程数量" readonly input-align="right" :border="false" is-link
                @click="showCourseCountPicker = true" />
            </van-cell-group>
            <!-- 表单底部 - 提交按钮 -->
            <view class="form-footer">
              <van-button round block type="primary" native-type="submit" :loading="isSubmitting">
                确认添加
              </van-button>
            </view>
          </van-form>
        </view>
      </view>
    </van-popup>

    <!-- 选择器组件集 -->
    <!-- 开通时长选择器 -->
    <van-popup v-model:show="showDurationPicker" round position="bottom">
      <van-picker :columns="durationOptions" @confirm="onDurationConfirm" @cancel="showDurationPicker = false"
        title="选择开通时长" show-toolbar />
    </van-popup>

    <!-- 会员类型选择器 -->
    <van-popup v-model:show="showMembershipPicker" round position="bottom">
      <van-picker :columns="membershipTypes" @confirm="onMembershipConfirm" @cancel="showMembershipPicker = false"
        title="选择会员类型" show-toolbar />
    </van-popup>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGenderPicker" round position="bottom">
      <van-picker :columns="genderOptions" @confirm="onGenderConfirm" @cancel="showGenderPicker = false" title="选择性别"
        show-toolbar />
    </van-popup>

    <!-- 课程数量选择器 -->
    <van-popup v-model:show="showCourseCountPicker" round position="bottom">
      <van-picker :columns="courseCountOptions" @confirm="onCourseCountConfirm" @cancel="showCourseCountPicker = false"
        title="选择课程数量" show-toolbar />
    </van-popup>

    <!-- 开始日期选择器 -->
    <van-popup v-model:show="showStartDatePicker" round position="bottom">
      <van-picker class="start-date-picker" title="选择开始日期" show-toolbar :columns="dateColumns"
        @confirm="onStartDateConfirm" @cancel="showStartDatePicker = false" />
    </van-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { getMemberDetail, createMember, renew, deleteMember } from '@/api/request'
import { showDialog } from 'vant'
import { calculateRemainingDays, formatDate as formatDateUtil } from '@/utils/dateUtils'

// 用户ID引用，用于标识当前正在查看的会员
const userId = ref('')
// 用户详细信息数据
const userInfo = ref({
  username: '',           // 会员姓名
  phone: '',              // 手机号码
  gender: '',             // 性别
  avatar: null,           // 头像
  status: 1,              // 状态
  membership_type: 1,     // 会员类型：1-普通会员，2-VIP会员
  end_date: '',           // 到期日期
  created_at: '',         // 创建时间
  updated_at: '',         // 更新时间
  total_courses: '',      // 总课程数
  completed_courses: '',  // 已完成课程数
  additional_course_count: '' // 新增课程数量字段
})

// 添加新会员相关的状态
const showAddUser = ref(false)     // 控制添加会员弹窗的显示/隐藏
const isSubmitting = ref(false)    // 控制表单提交状态
// 新会员信息表单数据
const newUser = ref({
  name: '',               // 会员姓名
  phone: '',              // 手机号码
  gender: '',             // 性别
  userType: '',           // 会员类型
  startDate: '',          // 开始日期
  duration: '',           // 开通时长
  total_courses: ''       // 课程总数
})

// 选择器相关的状态 - 控制各类选择器的显示/隐藏
const showGenderPicker = ref(false)        // 性别选择器
const showMembershipPicker = ref(false)    // 会员类型选择器
const showStartDatePicker = ref(false)     // 开始日期选择器
const showDurationPicker = ref(false)      // 开通时长选择器
const showCourseCountPicker = ref(false)   // 课程数量选择器

// 日期选择器配置
const currentDate = ref(new Date())                // 当前日期
const minDate = new Date('2024-01-01')            // 最小可选日期
const maxDate = new Date('2028-12-31')            // 最大可选日期

/**
 * 生成日期选择器的数据，从2024-1-1开始，默认显示当天
 * @returns {Array} 日期选择器的三列数据：年、月、日
 */
const generateDateColumns = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 年份列 (2024年开始，到当前年份的后5年)
  const years = [];
  for (let i = 2024; i <= currentYear + 5; i++) {
    years.push({ text: `${i}年`, value: i });
  }

  // 月份列
  const months = Array.from({ length: 12 }, (_, i) => ({ text: `${i + 1}月`, value: i + 1 }));

  // 日期列
  const days = Array.from({ length: 31 }, (_, i) => ({ text: `${i + 1}日`, value: i + 1 }));

  return [years, months, days];
};

// 日期列数据
const dateColumns = ref(generateDateColumns());

/**
 * 设置默认日期为当天，并打开日期选择器
 */
const setDefaultDate = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 在打开日期选择器时设置默认日期
  showStartDatePicker.value = true;

  // 延迟一帧，确保选择器已渲染
  setTimeout(() => {
    // 找到picker实例并设置默认值
    // 注意：这里我们使用的是索引，而不是具体的值
    const yearIdx = dateColumns.value[0].findIndex(y => y.value === currentYear);
    const monthIdx = currentMonth - 1;
    const dayIdx = currentDay - 1;

    // 让picker组件滚动到默认值位置
    const picker = document.querySelector('.start-date-picker');
    if (picker) {
      picker.setColumnIndex(0, Math.max(0, yearIdx));
      picker.setColumnIndex(1, monthIdx);
      picker.setColumnIndex(2, dayIdx);
    }
  }, 50);
};

// 选择器选项配置
// 性别选项
const genderOptions = [
  { text: '男', value: 1 },
  { text: '女', value: 2 }
]

// 会员类型选项
const membershipTypes = [
  { text: '普通会员', value: 1 },
  { text: 'VIP会员', value: 2 }
]

// 会员开通时长选项
const durationOptions = [
  { text: '月卡', value: 1 },
  { text: '季卡', value: 3 },
  { text: '半年卡', value: 6 },
  { text: '年卡', value: 12 }
]

// 课程数量选项
const courseCountOptions = [
  { text: '5节', value: 5 },
  { text: '11节', value: 11 },
  { text: '12节', value: 12 },
  { text: '25节', value: 25 }
]

// 计算属性
// 计算会员剩余天数
const remainingDays = computed(() => {
  return calculateRemainingDays(userInfo.value.end_date)
})

// 判断会员是否已过期
const isExpired = computed(() => {
  return remainingDays.value === 0
})

// 判断会员是否即将过期（剩余7天内）
const isExpiring = computed(() => {
  return remainingDays.value > 0 && remainingDays.value <= 7
})

// 根据剩余天数确定会员状态文本
const membershipStatus = computed(() => {
  if (isExpired.value) return '已过期'
  if (isExpiring.value) return '即将到期'
  return '会员有效'
})

// 计算剩余课程数
const calculateRemainingCourses = computed(() => {
  // 确保所有值都存在并且是数字
  const totalCourses = userInfo.value.total_courses ? parseInt(userInfo.value.total_courses) : 0;
  const completedCourses = userInfo.value.completed_courses ? parseInt(userInfo.value.completed_courses) : 0;

  // 计算剩余课程数 (总课程-已完成)
  return totalCourses - completedCourses;
});

/**
 * 获取会员详情
 * @param {string} id 会员ID
 */
const loadMemberDetail = async (id) => {
  try {
    // 检查是否有登录令牌
    const token = uni.getStorageSync('token')
    console.log('Current token:', token)

    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      // 如果未登录，跳转到个人资料页（登录页）
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/profile/profile'
        })
      }, 1500)
      return
    }

    console.log('Fetching member detail for ID:', id)
    // 调用API获取会员详情
    const response = await getMemberDetail(id)
    console.log('API response:', response)

    if (response.code === 200) {
      // 更新会员信息
      userInfo.value = response.data
      userId.value = id
    } else {
      // 显示错误提示
      uni.showToast({
        title: response.message || '加载失败',
        icon: 'none'
      })
    }
  } catch (error) {
    // 错误处理
    console.error('加载会员详情失败:', error)
    console.error('Error details:', {
      status: error.response?.status,
      headers: error.response?.headers,
      data: error.response?.data
    })

    // 如果是401未授权错误，提示用户重新登录
    if (error.response?.status === 401) {
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/profile/profile'
        })
      }, 1500)
      return
    }
    uni.showToast({
      title: '加载失败，请稍后重试',
      icon: 'none'
    })
  }
}

// 格式化日期的工具函数
const formatDate = formatDateUtil

/**
 * 格式化性别
 * @param {number} gender 性别值：1-男，2-女
 * @returns {string} 格式化后的性别文本
 */
const formatGender = (gender) => {
  return gender === 1 ? '男' : '女'
}

// 页面显示时重新加载数据
onShow(() => {
  // 从本地存储获取当前查看的会员ID
  const id = uni.getStorageSync('currentMemberId')
  console.log('Page shown with ID:', id)

  if (id) {
    // 加载会员详情
    loadMemberDetail(id)
  } else {
    // 如果没有会员ID，显示提示
    uni.showToast({
      title: '未选择会员',
      icon: 'none'
    })
  }
})

/**
 * 日期选择器确认事件处理
 * @param {Object} e 事件对象，包含选中的选项
 */
const onStartDateConfirm = (e) => {
  const { selectedOptions } = e;
  if (selectedOptions && selectedOptions.length >= 3) {
    // 从选中的选项中获取年月日并格式化
    const year = selectedOptions[0].value;
    const month = selectedOptions[1].value.toString().padStart(2, '0');
    const day = selectedOptions[2].value.toString().padStart(2, '0');
    // 设置到表单数据中
    newUser.value.startDate = `${year}-${month}-${day}`;
  }
  // 关闭选择器
  showStartDatePicker.value = false;
}

// 组件挂载时加载数据
onMounted(() => {
  // 从本地存储获取当前查看的会员ID
  const id = uni.getStorageSync('currentMemberId')
  console.log('Page mounted with ID:', id)

  if (id) {
    // 加载会员详情
    loadMemberDetail(id)
  } else {
    // 如果没有会员ID，显示提示
    uni.showToast({
      title: '未选择会员',
      icon: 'none'
    })
  }
})

/**
 * 显示添加会员弹窗
 */
const showAddUserModal = () => {
  showAddUser.value = true;
  // 设置默认开始日期为当天
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  newUser.value.startDate = `${year}-${month}-${day}`;
}

/**
 * 处理删除会员操作
 */
const handleDelete = async () => {
  try {
    // 显示确认对话框
    uni.showModal({
      title: '确认删除',
      content: '确定要删除该会员吗？此操作不可恢复！',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 用户确认后调用删除API
            const response = await deleteMember(userId.value);
            if (response.code === 200) {
              // 删除成功提示
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              });

              // 清空当前会员信息
              userInfo.value = {
                username: '',
                phone: '',
                gender: '',
                avatar: null,
                status: 1,
                membership_type: 1,
                end_date: '',
                created_at: '',
                updated_at: '',
                total_courses: '',
                completed_courses: ''
              };
              userId.value = '';

              // 重新加载首页内容
              setTimeout(() => {
                uni.switchTab({
                  url: '/pages/index/index'
                });
              }, 1000);
            } else {
              // 处理API返回的错误
              handleApiError(response);
            }
          } catch (error) {
            // 处理异常错误
            handleApiError(error.response?.data || error);
          }
        }
      }
    });
  } catch (error) {
    // 处理操作过程中的错误
    console.error('删除会员失败:', error);
    handleApiError(error.response?.data || error);
  }
}

/**
 * 关闭添加会员弹窗并重置表单
 */
const closeAddUserModal = () => {
  showAddUser.value = false
  // 重置表单
  newUser.value = {
    name: '',
    phone: '',
    gender: '',
    userType: '',
    startDate: '',
    duration: '',
    total_courses: ''
  }
}

// 选择器确认事件处理函数

/**
 * 性别选择器确认事件
 * @param {Object} e 事件对象
 */
const onGenderConfirm = (e) => {
  const { value, selectedOptions } = e;
  newUser.value.gender = selectedOptions[0].text;
  showGenderPicker.value = false;
}

/**
 * 会员类型选择器确认事件
 * @param {Object} e 事件对象
 */
const onMembershipConfirm = (e) => {
  const { value, selectedOptions } = e;
  newUser.value.userType = selectedOptions[0].text;
  // 如果切换到普通会员，清空课程数量
  if (selectedOptions[0].text === '普通会员') {
    newUser.value.total_courses = '';
  }
  showMembershipPicker.value = false;
}

/**
 * 开通时长选择器确认事件
 * @param {Object} e 事件对象
 */
const onDurationConfirm = (e) => {
  const { value, selectedOptions } = e;
  newUser.value.duration = selectedOptions[0].text;
  showDurationPicker.value = false;
}

/**
 * 课程数量选择器确认事件
 * @param {Object} e 事件对象
 */
const onCourseCountConfirm = (e) => {
  const { value, selectedOptions } = e;
  newUser.value.total_courses = selectedOptions[0].text;
  showCourseCountPicker.value = false;
}

// 判断是否可以续费的计算属性
const canRenew = computed(() => {
  if (userInfo.value.membership_type === 2) {
    // VIP会员：可以选择续费时长或增加课程数量
    return selectedRenewOption.value !== null || selectedCourseCount.value !== null;
  } else {
    // 普通会员：必须选择续费时长
    return selectedRenewOption.value !== null;
  }
});

/**
 * 处理会员续费操作
 */
const handleRenew = async () => {
  try {
    // 检查是否可以续费
    if (!canRenew.value) {
      uni.showToast({
        title: userInfo.value.membership_type === 2 ?
          '请选择续费时长或增加课程数量' :
          '请选择续费时长',
        icon: 'none'
      });
      return;
    }

    // 获取选中的续费选项
    const selectedOption = selectedRenewOption.value !== null ?
      renewOptions.value[selectedRenewOption.value] : null;

    // 获取选中的增加课程数量（仅VIP会员）
    const additional_course_count = userInfo.value.membership_type === 2 ?
      selectedCourseCount.value : null;

    // 调用续费API
    const response = await renew(
      userId.value,
      selectedOption ? selectedOption.value : 0,
      additional_course_count
    );

    if (response.code === 200) {
      // 续费成功提示
      uni.showToast({
        title: '续费成功',
        icon: 'success'
      });
      // 重新加载会员详情
      loadMemberDetail(userId.value);
      // 重置选择项
      selectedRenewOption.value = null;
      selectedCourseCount.value = null;
    } else {
      // 处理API返回的错误
      handleApiError(response);
    }
  } catch (error) {
    // 处理异常错误
    handleApiError(error.response?.data || error);
  }
}

/**
 * 统一的API错误处理函数
 * @param {Object} error 错误对象
 */
const handleApiError = (error) => {
  if (!error) {
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
    return;
  }

  // 处理特定错误码
  switch (error.code) {
    case 409:
      // 数据冲突错误
      showDialog({
        title: '提示',
        message: error.message || '该操作与现有数据冲突',
        confirmButtonText: '确定'
      });
      break;
    case 400:
      // 参数错误
      showDialog({
        title: '提示',
        message: error.message || '请求参数错误',
        confirmButtonText: '确定'
      });
      break;
    default:
      // 其他错误
      uni.showToast({
        title: error.message || '操作失败，请重试',
        icon: 'none'
      });
  }
}

/**
 * 处理添加会员表单提交
 */
const handleAddUser = async () => {
  try {
    // 设置提交状态
    isSubmitting.value = true;

    // 验证表单
    if (!newUser.value.name || !newUser.value.phone || !newUser.value.gender ||
      !newUser.value.userType || !newUser.value.startDate || !newUser.value.duration) {
      uni.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      isSubmitting.value = false;
      return;
    }

    // 如果是VIP会员，验证课程数量
    if (newUser.value.userType === 'VIP会员' && !newUser.value.total_courses) {
      uni.showToast({
        title: '请选择课程数量',
        icon: 'none'
      });
      isSubmitting.value = false;
      return;
    }

    // 从duration中提取数字
    let durationValue;
    switch(newUser.value.duration) {
      case '月卡':
        durationValue = 1;
        break;
      case '季卡':
        durationValue = 3;
        break;
      case '半年卡':
        durationValue = 6;
        break;
      case '年卡':
        durationValue = 12;
        break;
      default:
        durationValue = 1;
    }

    // 构建请求数据
    const requestData = {
      username: newUser.value.name,
      phone: newUser.value.phone,
      gender: newUser.value.gender === '男' ? 1 : 2,
      membership_type: newUser.value.userType === '普通会员' ? 1 : 2,
      start_date: newUser.value.startDate,
      duration: durationValue,
      total_courses: newUser.value.userType === 'VIP会员' ? parseInt(newUser.value.total_courses.replace('节', '')) : 0
    };

    // 调用创建会员API
    const response = await createMember(requestData);

    if (response.code === 200) {
      // 添加成功提示
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      });
      // 关闭弹窗并跳转回首页
      closeAddUserModal();
      uni.switchTab({
        url: '/pages/index/index'
      });
    } else {
      // 处理API返回的错误
      handleApiError(response);
    }
  } catch (error) {
    // 处理异常错误
    handleApiError(error.response?.data || error);
  } finally {
    // 重置提交状态
    isSubmitting.value = false;
  }
}

// 续费选项配置
const renewOptions = ref([
  { text: '1个月', value: 1 },
  { text: '3个月', value: 3 },
  { text: '6个月', value: 6 },
  { text: '12个月', value: 12 }
])

// 当前选中的续费选项索引
const selectedRenewOption = ref(null)

/**
 * 选择续费选项
 * @param {number} index 选项索引
 */
const selectRenewOption = (index) => {
  // 如果再次点击已选中的选项，则取消选择
  if (selectedRenewOption.value === index) {
    selectedRenewOption.value = null
  } else {
    selectedRenewOption.value = index
  }
  console.log('Selected option:', index) // 添加调试日志
}

/**
 * 选择课程数量
 * @param {number} value 课程数量
 */
const selectCourseCount = (value) => {
  // 如果再次点击已选中的选项，则取消选择
  if (selectedCourseCount.value === value) {
    selectedCourseCount.value = null
  } else {
    selectedCourseCount.value = value
  }
}

// 当前选中的课程数量
const selectedCourseCount = ref(null)

/**
 * 打开日期选择器
 */
const openDatePicker = () => {
  // 获取当前日期作为默认值
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // 如果没有选择过日期，设置今天为默认值
  if (!newUser.value.startDate) {
    newUser.value.startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
  }

  // 显示日期选择器
  showStartDatePicker.value = true;
}

// 控制服务部分展开/收起的状态
const isServiceExpanded = ref(false)

/**
 * 切换服务部分的展开/收起状态
 */
const toggleServiceSection = () => {
  isServiceExpanded.value = !isServiceExpanded.value
}
</script>

<style>
.page-container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 24px;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.content-container {
  padding: 16px;
  flex: 1;
}

.empty-state {
  padding: 40px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
}

/* 会员资料卡片 */
.profile-card {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.profile-header {
  display: flex;
  padding: 20px;
  background: linear-gradient(to right, #60a5fa, #3b82f6);
  position: relative;
}

.vip-header {
  background: linear-gradient(to right, #fbbf24, #f59e0b);
}

.avatar-container {
  margin-right: 16px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 32px;
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.profile-name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
}

.membership-badge {
  background: #4ade80;
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.membership-badge.expired {
  background: #ef4444;
}

.membership-badge.expiring {
  background: #f97316;
}

.profile-meta {
  display: flex;
  align-items: center;
}

.member-id {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  margin-right: 16px;
}

.member-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

/* 信息区域 */
.info-section {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.info-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #64748b;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 2px;
}

.info-value {
  font-size: 15px;
  color: #334155;
  font-weight: 500;
}

.info-value.warning {
  color: #ef4444;
}

.info-value.highlight {
  color: #3b82f6;
  font-weight: 600;
}

/* 操作区域 */
.action-section {
  padding: 20px;
}

.section-header {
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}

.section-header:active {
  opacity: 0.8;
}

.section-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  cursor: pointer;
}

.section-icon {
  font-size: 18px;
  color: #64748b;
  transition: transform 0.3s ease;
}

.service-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  opacity: 0;
}

.service-content.expanded {
  max-height: 1000px;
  opacity: 1;
  transition: max-height 0.3s ease-in, opacity 0.3s ease-in;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #334155;
}

.action-group {
  margin-bottom: 24px;
}

.action-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #475569;
}

.action-title .van-icon {
  margin-right: 8px;
  color: #64748b;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 768px) {
  .options-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.option-item {
  padding: 12px;
  background: #f1f5f9;
  border-radius: 10px;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.option-item:active {
  opacity: 0.8;
}

.option-item.selected {
  background: #e0f2fe;
  border: 1px solid #38bdf8;
}

.option-text {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.button-group {
  margin-top: 24px;
}

/* 弹窗样式 */
:deep(.van-popup) {
  border-radius: 16px !important;
  overflow: hidden !important;
  background-color: #fff !important;
}

.add-user-popup {
  z-index: 2000;
}

.popup-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  max-height: 90vh;
}

.popup-header {
  position: relative;
  padding: 20px;
  text-align: center;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
}

.popup-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  -webkit-overflow-scrolling: touch;
}

:deep(.van-popup__close-icon) {
  position: absolute;
  top: 16px;
  right: 16px;
  color: #64748b;
  font-size: 18px;
}

.form-footer {
  margin: 24px 16px;
  padding-bottom: env(safe-area-inset-bottom);
}

:deep(.van-cell-group--inset) {
  margin: 0 12px;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.van-field) {
  padding: 14px 16px !important;
}

:deep(.van-field__label) {
  width: 80px !important;
  color: #334155 !important;
}

:deep(.van-field__control) {
  color: #334155 !important;
}

:deep(.van-button--block) {
  height: 48px;
  line-height: 46px;
  font-size: 16px;
  border-radius: 24px;
  font-weight: 500;
}

:deep(.van-button--large) {
  height: 48px;
  line-height: 46px;
}

:deep(.van-button--primary) {
  background: #3b82f6;
  border-color: #3b82f6;
}

:deep(.van-button--danger) {
  background: #ef4444;
  border-color: #ef4444;
}
</style>
<template>
  <!-- 登录页面容器 -->
  <view class="login-container">
    <!-- 登录框 -->
    <view class="login-box">
      <!-- 应用logo -->
      <view class="logo">
        <image src="/static/logo.png" mode="aspectFit" class="logo-image" />
      </view>
      <!-- 应用标题 -->
      <view class="title">撸咖健身</view>
      <!-- 副标题 -->
      <view class="subtitle">管理员登录</view>
      
      <!-- 登录表单 -->
      <van-form @submit="onSubmit" class="login-form">
        <!-- 用户名输入框 -->
        <van-field
          v-model="loginForm.username"
          name="username"
          label="用户名"
          placeholder="请输入管理员用户名"
          :rules="[{ required: true, message: '请输入用户名' }]"
          class="form-field"
          input-align="left"
          clickable
          :auto-focus="false"
        >
          <template #left-icon>
            <van-icon name="user-o" />
          </template>
        </van-field>
        
        <!-- 密码输入框 -->
        <van-field
          v-model="loginForm.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
          class="form-field"
          input-align="left"
          clickable
          :auto-focus="false"
        >
          <template #left-icon>
            <van-icon name="lock" />
          </template>
        </van-field>

        <!-- 表单底部按钮区域 -->
        <view class="form-actions">
          <!-- 登录按钮 -->
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit"
            class="submit-btn"
            :loading="isLoading"
          >
            登录
          </van-button>
        </view>
      </van-form>
    </view>
  </view>
</template>

<script>
import { adminLogin } from '@/api/request'

export default {
  data() {
    return {
      // 登录表单数据
      loginForm: {
        username: '',
        password: ''
      },
      // 登录加载状态
      isLoading: false
    }
  },
  // 页面加载完成时检查登录状态
  onLoad() {
    this.checkLoginStatus();
  },
  methods: {
    // 检查登录状态，如果已登录则跳转到首页
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      if (token) {
        uni.switchTab({
          url: '/pages/index/index'
        });
      }
    },
    // 提交登录表单
    async onSubmit() {
      // 如果正在加载中，不重复提交
      if (this.isLoading) return;
      
      // 设置加载状态
      this.isLoading = true;
      
      try {
        // 调用登录API
        const res = await adminLogin(this.loginForm.username, this.loginForm.password);
        
        // 登录成功
        if (res.code === 200) {
          // 保存登录信息到本地存储
          uni.setStorageSync('token', res.data.token);
          uni.setStorageSync('adminInfo', res.data.admin);
          uni.setStorageSync('tokenExpireTime', Date.now() +365* 24 * 60 * 60 * 1000);
          
          // 显示登录成功提示
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          
          // 延迟0.5秒后跳转到首页
          setTimeout(() => {
            uni.switchTab({
              url: '/pages/index/index'
            });
          }, 500);
        }
      } catch (error) {
        // 错误处理已在request.js中统一处理
      } finally {
        // 无论成功失败，都重置加载状态
        this.isLoading = false;
      }
    }
  }
}
</script>

<style>
/* 登录页面容器样式 */
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%);
  padding: 20px;
}

/* 登录框样式 */
.login-box {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(226, 232, 240, 0.8);
}

/* Logo容器样式 */
.logo {
  text-align: center;
  margin-bottom: 20px;
}

/* Logo图片样式 */
.logo-image {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
}

/* 主标题样式 */
.title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  margin-bottom: 8px;
}

/* 副标题样式 */
.subtitle {
  font-size: 16px;
  color: #64748b;
  text-align: center;
  margin-bottom: 30px;
  font-weight: 500;
}

/* 登录表单样式 */
.login-form {
  margin-top: 20px;
}

/* 表单输入框样式 */
.form-field {
  margin-bottom: 20px;
  background: #f8fafc;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

/* 输入框左侧图标样式 */
:deep(.van-field__left-icon) {
  margin: 0 12px;
  color: #64748b;
  display: flex;
  align-items: center;
}

/* 输入框控件样式 */
:deep(.van-field__control) {
  height: 24px;
  color: #0f172a;
  font-size: 14px;
}

/* 输入框标签样式 */
:deep(.van-field__label) {
  color: #64748b;
  font-weight: 500;
  margin-right: 12px;
}

/* 单元格样式 */
:deep(.van-cell) {
  align-items: center;
  padding: 12px 0;
  background: transparent;
}

/* 输入框主体样式 */
:deep(.van-field__body) {
  display: flex;
  align-items: center;
}

/* 输入框占位符样式 */
:deep(.van-field__placeholder) {
  color: #94a3b8;
}

/* 表单操作区样式 */
.form-actions {
  margin-top: 30px;
}

/* 提交按钮样式 */
.submit-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  background: #3b82f6 !important;
  border: none !important;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
}

/* 主要按钮样式覆盖 */
:deep(.van-button--primary) {
  background: #3b82f6 !important;
  border: none !important;
}
</style>

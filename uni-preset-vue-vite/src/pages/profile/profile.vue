<template>
    <view class="page-container">
            <!-- 用户信息卡片 -->
            <view class="user-info-card">
                <view class="avatar-wrapper" @click="handleAvatarClick">
                    <image src="/static/avatar/default_avatar.jpg" class="avatar" mode="aspectFill" />
                    <view v-if="hasLogin" class="edit-avatar">
                        <van-icon name="photograph" size="12px" color="#fff" />
                    </view>
                </view>
                <view class="user-info">
                    <text class="username">{{ username }}</text>
                    <text class="user-id" v-if="hasLogin">ID: {{ userId }}</text>
                    <text class="user-desc" v-if="hasLogin">迷失的人迷失了，相逢的人会再相逢</text>
                </view>
            </view>

        <!-- 登录表单 -->
        <van-form @submit="onSubmit" v-if="!hasLogin" class="login-form">
            <view class="form-header">
                <text class="form-title">账号登录</text>
                <text class="form-subtitle">欢迎回来</text>
            </view>
            <van-field v-model="loginForm.username" name="用户名" placeholder="请输入用户名"
                :rules="[{ required: true, message: '请填写用户名' }]" class="custom-field">
                <template #left-icon>
                    <van-icon name="user-o" size="20px" />
                </template>
            </van-field>
            <van-field v-model="loginForm.password" type="password" name="密码" placeholder="请输入密码"
                :rules="[{ required: true, message: '请填写密码' }]" class="custom-field">
                <template #left-icon>
                    <van-icon name="lock" size="20px" />
                </template>
            </van-field>
            <view class="form-footer">
                <van-button round block type="info" native-type="submit" class="login-btn">
                    登录
                </van-button>
                <view class="additional-links">
                    <text class="link">忘记密码</text>
                </view>
            </view>
        </van-form>

        <!-- 功能菜单 -->
        <view v-if="hasLogin" class="feature-section">
            <!-- 数据概览 -->
            <view class="stats-grid">
                <view class="stats-item">
                    <text class="stats-label">累计会员数：</text>
                    <text class="stats-value">{{ totalMembers }}</text>
                    
                </view>
                <view class="stats-item">
                    <text class="stats-label">当前会员数：</text>
                    <text class="stats-value">{{ activeMembers }}</text>
                    
                </view>
                <view class="stats-item">
                    <text class="stats-label">VIP会员数：</text>
                    <text class="stats-value">{{ vipMembers }}</text>
                    
                </view>
                <view class="stats-item">
                    <text class="stats-label">课程总数量：</text>
                    <text class="stats-value">{{ totalCourses }}</text>
                    
                </view>
            </view>

            <!-- 功能菜单 -->
            <view class="menu-section">
                <view class="menu-title">我的服务</view>
                <view class="menu-grid">
                    <view class="menu-item" v-for="(item, index) in menuItems" :key="index"
                        @click="handleMenuClick(item)">
                        <van-icon :name="item.icon" :color="item.color" size="24px" class="menu-icon" />
                        <text class="menu-label">{{ item.label }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 客服弹窗 -->
        <van-popup v-model:show="showServicePopup" round position="center" :style="{ width: '80%' }" closeable>
            <view class="service-popup">
                <view class="service-title">联系客服</view>
                <view class="service-content">
                    <view class="service-item">
                        <text class="service-label">我的QQ：</text>
                        <text class="service-value" @click="copyText('67656473')">676567473</text>
                    </view>
                    <view class="service-item">
                        <text class="service-label">个人博客：</text>
                        <text class="service-value link" @click="openBlog('')">https://blog.ybyq.wang</text>
                    </view>
                </view>
            </view>
        </van-popup>
    </view>
</template>

<script>
import { Form, Field, Icon, Button } from 'vant';
import { adminLogin, getAdminProfile, getMemberList } from '@/api/request';

const MENU_ITEMS = [
    { icon: 'balance-pay', label: '会员卡', color: '#4A90E2', path: '/pages/member/card' },
    { icon: 'clock', label: '训练记录', color: '#FF9500', path: '/pages/training/record' },
    { icon: 'like', label: '我的收藏', color: '#FF2D55', path: '/pages/user/favorites' },
    { icon: 'medal', label: '我的成就', color: '#5856D6', path: '/pages/user/achievements' },
    { icon: 'friends', label: '我的教练', color: '#34C759', path: '/pages/coach/list' },
    { icon: 'shop', label: '商城', color: '#FF9500', path: '/pages/shop/index' },
    { icon: 'service', label: '客服', color: '#4A90E2', path: '/pages/service/index' },
    { icon: 'setting', label: '设置', color: '#8E8E93', path: '/pages/settings/index' },
    { icon: 'close', label: '退出登录', color: '#FF3B30', action: 'logout' }
];

export default {
    components: {
        [Form.name]: Form,
        [Field.name]: Field,
        [Icon.name]: Icon,
        [Button.name]: Button
    },
    data() {
        return {
            username: '未登录',
            userId: '',
            hasLogin: false,
            isLoading: false,
            loginForm: {
                username: '',
                password: ''
            },
            totalMembers: 0,
            activeMembers: 0,
            vipMembers: 0,
            totalCourses: 0,
            menuItems: MENU_ITEMS,
            showServicePopup: false
        }
    },
    methods: {
        async onSubmit() {
            if (this.isLoading) return;

            if (!this.loginForm.username || !this.loginForm.password) {
                uni.showToast({
                    title: '请填写完整信息',
                    icon: 'none'
                });
                return;
            }

            this.isLoading = true;

            try {
                uni.showLoading({
                    title: '登录中...',
                    mask: true
                });

                const res = await adminLogin(this.loginForm.username, this.loginForm.password);

                if (res.code === 200) {
                    uni.setStorageSync('token', res.data.token);
                    uni.setStorageSync('adminInfo', res.data.admin);

                    this.hasLogin = true;
                    this.username = res.data.admin.username;
                    this.userId = res.data.admin.id;

                    uni.showToast({
                        title: '登录成功',
                        icon: 'success'
                    });

                    await this.getAdminProfile();
                } else {
                    uni.showToast({
                        title: res.message || '登录失败',
                        icon: 'none'
                    });
                }
            } catch (err) {
                console.error("登录失败", err);
            } finally {
                this.isLoading = false;
                uni.hideLoading();
            }
        },
        async loadMemberStats() {
            try {
                const res = await getMemberList();
                if (res.code === 200) {
                    const members = res.data;
                    this.totalMembers = members.length > 0 ? Math.max(...members.map(m => m.id)) : 0;
                    this.activeMembers = members.length;
                    this.vipMembers = members.filter(member => member.membership_type === 2).length;
                    this.totalCourses = members.reduce((sum, member) => sum + (member.total_courses || 0), 0);
                } else {
                    uni.showToast({
                        title: res.message || '获取会员统计信息失败',
                        icon: 'none'
                    });
                }
            } catch (err) {
                console.error("获取会员统计信息失败", err);
                uni.showToast({
                    title: '获取会员统计信息失败，请稍后重试',
                    icon: 'none'
                });
            }
        },
        async getAdminProfile() {
            try {
                const res = await getAdminProfile();
                if (res.code === 200 && res.data) {
                    const adminInfo = res.data;
                    this.username = adminInfo.username;
                    this.userId = adminInfo.id;
                    uni.setStorageSync('adminInfo', adminInfo);
                } else {
                    uni.showToast({
                        title: res.message || '获取管理员信息失败',
                        icon: 'none'
                    });
                }
            } catch (err) {
                console.error("获取管理员信息失败", err);
            }
        },
        handleMenuClick(item) {
            if (!this.hasLogin && item.action !== 'logout' && item.path !== '/pages/settings/index') {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }

            if (item.action === 'logout') {
                this.handleLogout();
                return;
            }

            if (item.label === '客服') {
                this.showServicePopup = true;
                return;
            }

            uni.navigateTo({
                url: item.path,
                fail: () => {
                    uni.showToast({
                        title: '页面开发中',
                        icon: 'none'
                    });
                }
            });
        },
        handleLogout() {
            uni.showModal({
                title: '提示',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        uni.removeStorageSync('token');
                        uni.removeStorageSync('adminInfo');
                        uni.removeStorageSync('tokenExpireTime');
                        uni.removeStorageSync('currentMemberId');
                        
                        this.resetState();
                        
                        uni.reLaunch({
                            url: '/pages/login/index'
                        });
                        
                        uni.showToast({
                            title: '已退出登录',
                            icon: 'success'
                        });
                    }
                }
            });
        },
        resetState() {
            this.hasLogin = false;
            this.username = '未登录';
            this.userId = '';
            this.totalMembers = 0;
            this.activeMembers = 0;
            this.vipMembers = 0;
            this.totalCourses = 0;
        },
        handleAvatarClick() {
            if (!this.hasLogin) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'none'
                });
                return;
            }

            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album', 'camera'],
                success: (res) => {
                    // TODO: 实现头像上传逻辑
                    console.log('选择的图片：', res.tempFilePaths[0]);
                    uni.showToast({
                        title: '头像上传功能开发中',
                        icon: 'none'
                    });
                }
            });
        },
        copyText(text) {
            uni.setClipboardData({
                data: text,
                success: () => {
                    uni.showToast({
                        title: '已复制到剪贴板',
                        icon: 'success'
                    });
                }
            });
        },
        openBlog(url) {
            const fullUrl = url.startsWith('http') ? url : `https://${url}`;
            uni.navigateTo({
                url: `/pages/webview/webview?url=${encodeURIComponent(fullUrl)}`
            });
        }
    },
    onShow() {
        const token = uni.getStorageSync('token');
        const adminInfo = uni.getStorageSync('adminInfo');

        if (token && adminInfo) {
            this.hasLogin = true;
            this.username = adminInfo.username;
            this.userId = adminInfo.id;
            this.loadMemberStats();
        } else {
            uni.removeStorageSync('token');
            uni.removeStorageSync('adminInfo');
            this.resetState();
        }
    }
}

</script>

<style scoped>
/* 基础变量 */
:root {
    --primary-color: #6366f1;
    --primary-light: #818cf8;
    --primary-gradient: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    --text-color: #1e293b;
    --text-secondary: #64748b;
    --text-light: #94a3b8;
    --border-radius: 16px;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}

/* 页面容器 */
.page-container {
    min-height: 100vh;
    background: #f8fafc;
    padding: 0;
}

/* 用户信息卡片 - 缩小尺寸 */
.user-info-card {
    background: #fff;
    border-radius: var(--border-radius);
    padding: 24px;
    display: flex;
    align-items: center;
    position: relative;
    margin: 24px;
    box-shadow: 
        0 4px 12px rgba(0,0,0,0.1),
        0 2px 4px rgba(0,0,0,0.05);
    overflow: hidden;
}

.user-info-card::before {
    height: 80px; /* 缩小背景高度 */
}

/* 头像与文字间距 */
.avatar-wrapper {
    margin-right: 26px;
}

/* 名字和ID布局优化 */
.user-info {
    display: flex;
    flex-direction: column;
    gap: 4px; /* 控制名字和ID的垂直间距 */
}

.username {
    font-size: 18px; /* 缩小字体 */
    margin-bottom: 0; /* 移除原有下边距 */
}

.user-id {
    font-size: 13px; /* 缩小字体 */
    margin-bottom: 0; /* 移除原有下边距 */
}

/* 用户信息卡片 - 毛玻璃效果优化 */
.user-info-card {
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: var(--border-radius);
    padding: 24px;
    display: flex;
    align-items: center;
    position: relative;
    margin: 24px;
    box-shadow: 
        0 4px 12px rgba(0,0,0,0.1),
        0 2px 4px rgba(0,0,0,0.05);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-info-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    background: var(--primary-gradient);
    z-index: -1;
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    opacity: 0.8;
}

/* 用户描述 - 毛玻璃效果优化 */
.user-desc {
    font-size: 14px;
    color: rgba(245, 10, 10, 0.9);
    background: rgba(255,255,255,0.2);
    padding: 6px 0px;
    border-radius: 16px;
    display: inline-block;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.2);
}

/* 登录表单 - 现代设计 */
.login-form {
    margin: 24px;
    padding: 28px 24px;
    background: #fff;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid rgba(0,0,0,0.05);
}

.form-header {
    margin-bottom: 24px;
    text-align: center;
}

.form-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color);
    display: block;
    margin-bottom: 4px;
}

.form-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
}

.custom-field {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    background: #f8fafc;
    padding: 8px 12px;
}

:deep(.van-field__left-icon) {
    display: flex;
    align-items: center;
    height: 20px;
    margin-right: 12px;
    color: #666;
}

:deep(.van-field__control) {
    height: 24px;
    line-height: 24px;
    padding: 0;
}

:deep(.van-field__label) {
    display: flex;
    align-items: center;
    height: 24px;
    line-height: 24px;
    color: #333;
    margin-right: 12px;
}

:deep(.van-field__body) {
    display: flex;
    align-items: center;
    min-height: 24px;
}

:deep(.van-field__placeholder) {
    color: #999;
    height: 24px;
    line-height: 24px;
}

:deep(.van-cell) {
    padding: 0;
    background: transparent;
}

:deep(.van-field__value) {
    display: flex;
    align-items: center;
    min-height: 24px;
}

.login-btn {
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    background: var(--primary-gradient);
    border: none;
    margin-top: 8px;
}

/* 数据概览 - 卡片设计 */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin: 0 24px 24px;
}

.stats-item {
    background: #fff;
    border-radius: var(--border-radius);
    padding: 20px 12px;
    text-align: center;
    box-shadow: 
        0 4px 8px rgba(0,0,0,0.1),
        0 2px 4px rgba(0,0,0,0.05),
        inset 0 -1px 2px rgba(0,0,0,0.05);
    transition: all 0.2s ease;
    border: none;
}

.stats-item:active {
    transform: translateY(2px);
    box-shadow: 
        0 2px 4px rgba(0,0,0,0.1),
        inset 0 -1px 2px rgba(0,0,0,0.05);
}

/* 功能菜单 - 网格布局 */
.menu-section {
    background: #fff;
    border-radius: var(--border-radius);
    margin: 0 24px 32px;
    padding: 24px;
    box-shadow: var(--shadow-md);
}

.menu-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 
        0 4px 8px rgba(0,0,0,0.08),
        0 2px 4px rgba(0,0,0,0.05);
    transition: all 0.2s ease;
}

.menu-item:active {
    transform: translateY(2px) scale(0.98);
    box-shadow: 
        0 2px 4px rgba(0,0,0,0.08),
        0 1px 2px rgba(0,0,0,0.05);
}

.menu-icon {
    margin-bottom: 8px;
}

.menu-label {
    font-size: 12px;
    color: var(--text-color);
}

.menu-title{
    margin-bottom: 15px;
}

/* 响应式设计 */
@media (max-width: 480px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .menu-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }
    
    .avatar {
        width: 72px;
        height: 72px;
    }
}

/* 客服弹窗样式 */
.service-popup {
    padding: 24px;
}

.service-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    text-align: center;
    margin-bottom: 20px;
}

.service-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.service-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
}

.service-label {
    font-size: 14px;
    color: #64748b;
    margin-right: 8px;
}

.service-value {
    font-size: 15px;
    color: #3b82f6;
    font-weight: 500;
    cursor: pointer;
}

.service-value.link {
    text-decoration: underline;
}

.service-value:active {
    opacity: 0.8;
}
</style>

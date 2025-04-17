<template>
    <view class="custom-tabbar">
        <view 
            v-for="(item, index) in tabList" 
            :key="index" 
            class="tabbar-item" 
            :class="{'tabbar-item-active': current === index}" 
            @click="switchTab(item.pagePath)"
        >
            <van-icon 
                :name="current === index ? item.selectedIcon : item.icon" 
                class="tabbar-icon" 
                :class="{'tabbar-icon-active': current === index}" 
            />
            <text>{{ item.text }}</text>
        </view>
    </view>
</template>

<script>
const TAB_ROUTES = {
    '/pages/index/index': 0,
    '/pages/detail/detail': 1,
    '/pages/chat/chat': 2,
    '/pages/profile/profile': 3
};

export default {
    data() {
        return {
            current: 0,
            tabList: [
                {
                    pagePath: '/pages/index/index',
                    text: '首页',
                    icon: 'home-o',
                    selectedIcon: 'home-o'
                },
                {
                    pagePath: '/pages/detail/detail',
                    text: '详情',
                    icon: 'records',
                    selectedIcon: 'records'
                },
                {
                    pagePath: '/pages/chat/chat',
                    text: '课程',
                    icon: 'clock-o',
                    selectedIcon: 'clock-o'
                },
                {
                    pagePath: '/pages/profile/profile',
                    text: '我的',
                    icon: 'contact',
                    selectedIcon: 'contact'
                }
            ]
        }
    },
    methods: {
        switchTab(url) {
            uni.switchTab({ url });
        }
    },
    watch: {
        '$route.path': {
            immediate: true,
            handler(path) {
                this.current = TAB_ROUTES[path] || 0;
            }
        }
    }
}
</script>

<style>
.custom-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 110rpx;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: #fff;
    border-top: 1rpx solid #e2e8f0;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 9999;
    padding-bottom: env(safe-area-inset-bottom);
}

.tabbar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    color: #64748b;
    padding: 10rpx 0;
    transition: all 0.2s ease;
    position: relative;
}

.tabbar-item-active {
    color: #3b82f6;
    font-weight: 600;
}

.tabbar-item:active {
    transform: scale(0.95);
}

:deep(.tabbar-icon) {
    font-size: 48rpx !important;
    margin-bottom: 4rpx;
}

:deep(.tabbar-icon-active) {
    color: #3b82f6 !important;
}

.tabbar-item text {
    margin-top: 6rpx;
    font-weight: 500;
}

.tabbar-item-active:before {
    content: '';
    position: absolute;
    bottom: -10rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 16rpx;
    height: 3px;
    background: #3b82f6;
    border-radius: 3px;
}
</style>
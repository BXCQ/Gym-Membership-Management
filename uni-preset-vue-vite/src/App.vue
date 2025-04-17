<template>
  <view class="app-container">
    <router-view></router-view>
  </view>
</template>

<script>
export default {
  onLaunch: function() {
    this.setupRequestInterceptor();
  },
  onShow: function() {
    this.checkTokenExpiration();
  },
  onHide: function() {
    console.log('App Hide');
  },
  methods: {
    checkTokenExpiration() {
      const token = uni.getStorageSync('token');
      const expireTime = uni.getStorageSync('tokenExpireTime');
      const currentPath = getCurrentPages()[getCurrentPages().length - 1]?.route || '';
      
      if ((!token || (expireTime && Date.now() > expireTime)) && 
          currentPath !== 'pages/login/index') {
        this.handleLogout();
      }
    },
    
    handleLogout() {
      uni.removeStorageSync('token');
      uni.removeStorageSync('adminInfo');
      uni.removeStorageSync('tokenExpireTime');
      
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      });
      
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/index'
        });
      }, 1500);
    },
    
    setupRequestInterceptor() {
      uni.addInterceptor('request', {
        invoke(args) {
          const token = uni.getStorageSync('token');
          if (args.url.indexOf('/login') === -1 && token) {
            args.header = args.header || {};
            args.header['Authorization'] = `Bearer ${token}`;
          }
          return args;
        },
        success(res) {
          if (res.statusCode === 401 || (res.data && res.data.code === 401)) {
            this.handleLogout();
          }
          return res;
        }
      });
    }
  }
}
</script>

<style>
@import './static/style/global.css';

.app-container {
  position: relative;
  min-height: 100vh;
  padding-bottom: 56px; /* 预留TabBar高度的空间 */
}

page {
  background-color: var(--background-color);
}
</style>

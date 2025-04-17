import axios from 'axios'
import { Dialog } from 'vant'

// 后端API配置
const backendAPI = {
    baseUrl: "/api",
}

// 创建axios实例
const instance = axios.create({
    baseURL: backendAPI.baseUrl,
    timeout: 30000,  // 增加超时时间
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
})

// 添加请求重试逻辑
const retryTimes = 3;
const retryDelay = 2000;

// 添加请求拦截器，用于JWT认证
instance.interceptors.request.use(
    config => {
        const token = uni.getStorageSync('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token.trim()}`
        }
        // 添加调试日志
        console.log('Request config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            data: config.data
        });
        config.retryTimes = retryTimes;
        config.retryDelay = retryDelay;
        return config
    },
    error => {
        console.error('Request error:', error);
        return Promise.reject(error)
    }
)

// 响应拦截器
instance.interceptors.response.use(
    response => {
        // 添加调试日志
        console.log('Response:', response);
        return response.data;
    },
    async error => {
        // 添加详细的错误日志
        console.error('Response error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            config: error.config
        });

        // 如果是网络错误
        if (!error.response) {
            uni.showToast({
                title: '网络连接失败，请检查网络设置',
                icon: 'none',
                duration: 2000
            });
            return Promise.reject(error);
        }

        // 如果是服务器错误
        if (error.response.status >= 500) {
            uni.showToast({
                title: '服务器暂时不可用，请稍后重试',
                icon: 'none',
                duration: 2000
            });
            return Promise.reject(error);
        }

        // 如果是认证错误
        if (error.response.status === 401) {
            uni.removeStorageSync('token');
            uni.removeStorageSync('adminInfo');
            uni.removeStorageSync('tokenExpireTime');
            
            uni.showToast({
                title: '登录已过期，请重新登录',
                icon: 'none',
                duration: 2000
            });
            
            setTimeout(() => {
                uni.reLaunch({
                    url: '/pages/login/index'
                });
            }, 2000);
            
            return Promise.reject(error);
        }

        // 统一错误处理
        const errorMessage = error.response?.data?.message || 
            error.message || 
            '请求失败，请稍后重试';
            
        uni.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 2000
        });

        return Promise.reject(error);
    }
)

// API方法
export const {
    adminLogin,
    getAdminProfile,
    getMemberList,
    getMemberDetail,
    createMember,
    renew,
    deleteMember,
    getMembershipInfo,
    getVipMembers,
    getCourseProgress,
    updateCourseProgress,
    sendWechatNotification,
} = {
    adminLogin: (username, password) => instance.post('/admin/login', { username, password })
        .then(response => {
            if (response.code === 200 && response.data.token) {
                uni.setStorageSync('token', response.data.token)
                uni.setStorageSync('adminInfo', response.data.admin)
                uni.setStorageSync('tokenExpireTime', Date.now() + 365 * 24 * 60 * 60 * 1000);
                return response
            }
            return Promise.reject(new Error(response.message || '登录失败'))
        }),

    getAdminProfile: () => instance.get('/admin/profile'),
    getMemberList: () => instance.get('/member/list'),
    getMemberDetail: (id) => instance.get(`/member/detail/${id}`),
    createMember: (data) => instance.post('/member/create', data)
        .catch(error => {
            if (error.response?.status === 409) {
                Dialog.alert({
                    title: '提示',
                    message: error.response.data.message || '该用户名已存在',
                    confirmButtonText: '确定'
                });
            } else if (error.response?.status === 500) {
                Dialog.alert({
                    title: '提示',
                    message: '该手机号码已存在',
                    confirmButtonText: '确定'
                });
            }
            return Promise.reject(error);
        }),
    renew: (id, months, additional_course_count) => instance.post(`/membership/${id}/renew`, { 
        months: parseInt(months),
        additional_course_count: additional_course_count ? parseInt(additional_course_count) : 0
    }),
    deleteMember: (id) => instance.delete(`/member/${id}`),
    getMembershipInfo: (userId) => instance.get(`/membership/${userId}`),
    getCourseProgress: (userId) => instance.get(`/course/progress/${userId}`),
    updateCourseProgress: (userId, completedCourses) => instance.put(`/course/progress/${userId}`, { completedCourses }),
    getVipMembers: () => instance.get('/member/vip'),
    sendWechatNotification: (expiringMembers, expiredMembers) => {
        console.log('推送函数接收到的数据:', { expiringMembers, expiredMembers });
        const token = 'dyhrw3Uf5QIVpFi8orF7J8yW0';
        const title = '撸咖健身-会员到期提醒';
        
        const currentDate = new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        let content = `提醒时间: ${currentDate}\n\n`;
        
        if (expiringMembers && expiringMembers.length > 0) {
            content += '【即将到期会员】\n';
            expiringMembers.forEach(member => {
                const endDate = new Date(member.end_date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                content += `${member.username} - 仅剩3天 (到期日期: ${endDate})\n`;
            });
        }
        
        if (expiredMembers && expiredMembers.length > 0) {
            content += '\n【已到期会员】\n';
            expiredMembers.forEach(member => {
                const endDate = new Date(member.end_date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                content += `${member.username} - 已到期 (到期日期: ${endDate})\n`;
            });
        }
        
        content += '\n撸咖健身提醒您及时联系会员续费，感谢您的使用。';
        
        console.log('即将发送推送，内容:', { title, content });
        
        // 使用代理路径发送请求
        return new Promise((resolve, reject) => {
            uni.request({
                url: `/api/wx-push/${token}.send`,
                method: 'POST',
                header: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                data: {
                    text: title,
                    desp: content
                },
                success: (res) => {
                    console.log('推送成功，响应:', res);
                    resolve(res.data);
                },
                fail: (err) => {
                    console.error('推送失败，错误:', err);
                    reject(err);
                }
            });
        });
    },
}

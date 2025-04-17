# 基于uni-app的健身会员管理系统技术分析

## 项目概述

这是一个基于uni-app开发的健身会员管理系统，主要用于管理会员信息、课程进度以及发送到期提醒等功能。项目采用了Vue 3 + Vite的技术栈，整体架构清晰，代码组织规范。

## 技术栈

- 前端框架：Vue 3
- 构建工具：Vite
- UI组件库：Vant
- HTTP请求：Axios
- 跨端框架：uni-app

## API设计与实现

### 1. 请求配置与拦截器

项目使用了axios进行HTTP请求，并配置了完整的请求拦截和响应拦截机制。让我们来看看具体的实现：

```javascript
// 后端API配置
const backendAPI = {
    baseUrl: "/api",
}

// 创建axios实例
const instance = axios.create({
    baseURL: backendAPI.baseUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
})
```

这段代码创建了一个axios实例，设置了基本的请求配置：
- `baseURL`: 设置API的基础路径
- `timeout`: 设置请求超时时间为30秒
- `headers`: 设置请求头，指定内容类型为JSON
- `withCredentials`: 允许跨域请求携带cookie

#### API路径配置详解

在代码中出现的 `/api` 是一个API的基础路径（base URL），它表示：

1. **代理路径**：
   - 在开发环境中，这个 `/api` 通常会被配置为代理路径
   - 比如当你在本地开发时，请求 `/api/member/list` 实际上会被代理到 `http://localhost:3000/member/list` 这样的实际后端地址

2. **实际作用**：
   - 它作为所有API请求的前缀
   - 比如 `getMemberList` 方法实际请求的完整URL是 `/api/member/list`
   - 这样可以统一管理所有API的路径

3. **配置方式**：
   - 在 `vite.config.js` 中通常会配置代理，类似这样：
   ```javascript
   server: {
     proxy: {
       '/api': {
         target: 'http://localhost:3000',
         changeOrigin: true
       }
     }
   }
   ```

4. **实际部署时**：
   - 在生产环境中，这个 `/api` 可能会指向实际的服务器地址
   - 比如 `https://api.yourdomain.com`

这样设计的好处是：
- 开发时可以使用代理避免跨域问题
- 部署时只需要修改代理配置，不需要改代码
- 统一管理所有API请求的路径前缀

### 2. 请求拦截器

```javascript
instance.interceptors.request.use(
    config => {
        const token = uni.getStorageSync('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token.trim()}`
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
)
```

请求拦截器的主要作用是：
- 在每次请求前自动添加token到请求头
- 使用`uni.getStorageSync`获取本地存储的token
- 如果存在token，则添加到请求头的Authorization字段

### 3. 响应拦截器

```javascript
instance.interceptors.response.use(
    response => {
        return response.data;
    },
    async error => {
        // 错误处理逻辑
        if (!error.response) {
            uni.showToast({
                title: '网络连接失败，请检查网络设置',
                icon: 'none',
                duration: 2000
            });
        }
        // ... 其他错误处理
        return Promise.reject(error);
    }
)
```

响应拦截器的主要功能：
- 统一处理响应数据，直接返回response.data
- 处理各种错误情况，如网络错误、服务器错误等
- 使用uni-app的showToast方法展示错误提示

### 4. API方法封装

项目将所有的API请求方法进行了统一封装，例如：

```javascript
export const {
    adminLogin,
    getAdminProfile,
    getMemberList,
    // ... 其他方法
} = {
    adminLogin: (username, password) => instance.post('/admin/login', { username, password })
        .then(response => {
            if (response.code === 200 && response.data.token) {
                uni.setStorageSync('token', response.data.token)
                uni.setStorageSync('adminInfo', response.data.admin)
                uni.setStorageSync('tokenExpireTime', Date.now() + 365 * 24 * 60 * 60 * 1000)
                return response
            }
            return Promise.reject(new Error(response.message || '登录失败'))
        }),
    // ... 其他方法实现
}
```

这种封装方式的优点：
- 统一管理所有API请求
- 每个方法都有清晰的错误处理
- 登录成功后自动保存token和用户信息
- 使用Promise链式调用，代码更易读

### 5. 权限管理实现

项目中使用了基于token的权限管理机制，主要通过以下方式实现：

1. **登录认证**：
```javascript
adminLogin: (username, password) => instance.post('/admin/login', { username, password })
    .then(response => {
        if (response.code === 200 && response.data.token) {
            // 保存token和用户信息
            uni.setStorageSync('token', response.data.token)
            uni.setStorageSync('adminInfo', response.data.admin)
            uni.setStorageSync('tokenExpireTime', Date.now() + 365 * 24 * 60 * 60 * 1000)
            return response
        }
        return Promise.reject(new Error(response.message || '登录失败'))
    })
```

2. **Token验证**：
- 每次请求都会在请求头中携带token
- 通过请求拦截器自动添加token
```javascript
instance.interceptors.request.use(
    config => {
        const token = uni.getStorageSync('token')
        if (token) {
            config.headers['Authorization'] = `Bearer ${token.trim()}`
        }
        return config
    }
)
```

3. **权限控制**：
- 401错误处理：当token无效或过期时，自动跳转到登录页
```javascript
if (error.response.status === 401) {
    uni.removeStorageSync('token')
    uni.removeStorageSync('adminInfo')
    uni.removeStorageSync('tokenExpireTime')
    
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
}
```

4. **权限特点**：
- 使用JWT（JSON Web Token）进行身份验证
- token有效期设置为1年
- 自动处理token过期情况
- 统一的权限错误处理机制
- 登录状态持久化存储

5. **安全措施**：
- token存储在本地存储中
- 请求时自动添加Bearer认证
- 敏感操作需要重新验证
- 登出时清除所有认证信息

这种权限管理方式的优点：
- 无状态：服务器不需要存储session
- 安全性：使用JWT保证数据完整性
- 灵活性：可以携带用户信息
- 可扩展：易于添加新的权限控制
- 用户体验：自动处理登录状态

#### 权限系统扩展建议

当前系统只实现了管理员登录，如果要支持普通用户和会员登录，可以按以下方式扩展：

1. **用户角色设计**：
```javascript
// 用户角色枚举
const UserRole = {
    ADMIN: 'admin',      // 管理员
    MEMBER: 'member',    // 会员
    USER: 'user'         // 普通用户
}

// 权限级别
const PermissionLevel = {
    SUPER_ADMIN: 3,      // 超级管理员
    ADMIN: 2,            // 普通管理员
    MEMBER: 1,           // 会员
    USER: 0              // 普通用户
}
```

2. **登录接口扩展**：
```javascript
// 扩展登录方法
export const {
    userLogin,    // 普通用户登录
    memberLogin,  // 会员登录
    adminLogin    // 管理员登录
} = {
    userLogin: (username, password) => instance.post('/user/login', { username, password })
        .then(response => {
            if (response.code === 200) {
                uni.setStorageSync('token', response.data.token)
                uni.setStorageSync('userInfo', response.data.user)
                uni.setStorageSync('userRole', UserRole.USER)
                return response
            }
            return Promise.reject(new Error(response.message || '登录失败'))
        }),

    memberLogin: (username, password) => instance.post('/member/login', { username, password })
        .then(response => {
            if (response.code === 200) {
                uni.setStorageSync('token', response.data.token)
                uni.setStorageSync('memberInfo', response.data.member)
                uni.setStorageSync('userRole', UserRole.MEMBER)
                return response
            }
            return Promise.reject(new Error(response.message || '登录失败'))
        })
}
```

3. **权限验证中间件**：
```javascript
// 权限验证工具
const checkPermission = (requiredLevel) => {
    const userRole = uni.getStorageSync('userRole')
    const currentLevel = PermissionLevel[userRole.toUpperCase()]
    return currentLevel >= requiredLevel
}

// 路由守卫
const routerGuard = (to, from, next) => {
    const token = uni.getStorageSync('token')
    if (!token) {
        next('/login')
        return
    }

    // 根据路由meta信息检查权限
    if (to.meta.requiredLevel && !checkPermission(to.meta.requiredLevel)) {
        uni.showToast({
            title: '权限不足',
            icon: 'none'
        })
        next(from.path)
        return
    }

    next()
}
```

4. **API权限控制**：
```javascript
// 请求拦截器中添加角色验证
instance.interceptors.request.use(
    config => {
        const token = uni.getStorageSync('token')
        const userRole = uni.getStorageSync('userRole')
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token.trim()}`
            config.headers['X-User-Role'] = userRole
        }
        
        return config
    }
)
```

5. **功能权限控制示例**：
```javascript
// 会员管理功能
const memberManagement = {
    // 只有管理员可以查看所有会员
    getAllMembers: () => {
        if (!checkPermission(PermissionLevel.ADMIN)) {
            return Promise.reject(new Error('权限不足'))
        }
        return instance.get('/member/list')
    },
    
    // 会员可以查看自己的信息
    getMemberInfo: (id) => {
        const currentUserId = uni.getStorageSync('memberInfo')?.id
        if (id !== currentUserId && !checkPermission(PermissionLevel.ADMIN)) {
            return Promise.reject(new Error('权限不足'))
        }
        return instance.get(`/member/${id}`)
    }
}
```

6. **页面权限控制**：
```javascript
// 页面配置示例
const pages = [
    {
        path: '/admin/dashboard',
        meta: {
            requiredLevel: PermissionLevel.ADMIN,
            title: '管理后台'
        }
    },
    {
        path: '/member/profile',
        meta: {
            requiredLevel: PermissionLevel.MEMBER,
            title: '会员中心'
        }
    },
    {
        path: '/user/home',
        meta: {
            requiredLevel: PermissionLevel.USER,
            title: '用户首页'
        }
    }
]
```


### 6. 微信通知功能

项目中还实现了微信通知功能，用于提醒会员到期：

```javascript
sendWechatNotification: (expiringMembers, expiredMembers) => {
    const token = 'dyhrw3Uf5QIVpFi8orF7J8yW0';
    const title = '撸咖健身-会员到期提醒';
    
    // 格式化日期
    const currentDate = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    // 构建通知内容
    let content = `提醒时间: ${currentDate}\n\n`;
    // ... 构建会员信息内容
    
    // 发送请求
    return new Promise((resolve, reject) => {
        uni.request({
            url: `/api/wx-push/${token}.send`,
            method: 'POST',
            data: {
                text: title,
                desp: content
            },
            success: (res) => resolve(res.data),
            fail: (err) => reject(err)
        });
    });
}
```

这个功能的特点：
- 使用uni.request发送请求
- 支持Promise异步处理
- 格式化日期显示
- 构建结构化的通知内容

## 总结

这个项目展示了如何在一个uni-app项目中：
1. 使用axios进行API请求管理
2. 实现完整的请求拦截和响应拦截
3. 统一处理错误和提示
4. 封装API方法
5. 实现微信通知等特色功能

对于想要学习uni-app开发的同学来说，这个项目是一个很好的参考案例。它展示了如何组织代码、处理API请求、管理状态等实际开发中常见的问题。

## 学习建议

1. 先理解项目的基本架构和目录结构
2. 重点学习API请求的封装方式
3. 掌握错误处理和拦截器的使用
4. 了解uni-app特有的API（如uni.request、uni.showToast等）
5. 尝试自己实现一些简单的功能，如会员信息的增删改查 
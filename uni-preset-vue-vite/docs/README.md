# 撸咖健身系统文档

## 目录
1. [系统概述](#系统概述)
2. [系统设计](#系统设计)
3. [技术栈](#技术栈)
4. [功能实现](#功能实现)
5. [接口文档](#接口文档)
6. [开发指南](#开发指南)
7. [部署说明](#部署说明)

## 系统概述

撸咖健身系统是一个基于 uni-app 开发的健身会员管理系统，主要功能包括：
- 会员信息管理
- 课程进度跟踪
- 会员续费管理
- 管理员系统
- 数据统计分析

### 系统特点
1. 响应式设计，支持多端适配
2. 完善的会员管理功能
3. 直观的课程进度展示
4. 灵活的续费机制
5. 安全的数据存储和传输
6. 友好的用户界面

## 系统设计

### 架构设计
1. 前端架构
   - 基于 uni-app 框架
   - 采用 Vue 3 组合式 API
   - 使用 Vant Weapp 组件库
   - 状态管理采用 Vue 的响应式系统

2. 后端架构
   - 基于 Express 框架
   - RESTful API 设计
   - JWT 认证机制
   - MySQL 数据库存储

3. 数据流设计
   - 单向数据流
   - 集中式状态管理
   - 组件化开发
   - 模块化设计

### 数据库设计
1. 会员表 (members)
   - 基本信息存储
   - 唯一索引优化
   - 状态管理

2. 会员信息表 (memberships)
   - 会员类型管理
   - 时间管理
   - 课程管理

3. 课程进度表 (course_progress)
   - 进度追踪
   - 完成状态管理
   - 时间记录

### 安全设计
1. 认证机制
   - JWT token 认证
   - Token 过期处理
   - 请求拦截器

2. 数据安全
   - 密码加密存储
   - 敏感数据脱敏
   - 请求参数验证

3. 权限控制
   - 角色基础权限
   - 接口访问控制
   - 数据访问控制

## 技术栈

### 前端技术
- 框架：uni-app
- UI组件：Vant Weapp
- 状态管理：Vue 3
- 网络请求：Axios
- 存储：uni.storage
- 样式：SCSS
- 工具库：
  - dayjs (日期处理)
  - lodash (工具函数)

### 后端技术
- 运行环境：Node.js
- Web框架：Express
- 数据库：MySQL
- 认证：JWT
- 工具库：
  - mysql2 (数据库驱动)
  - bcryptjs (密码加密)
  - jsonwebtoken (JWT处理)
  - cors (跨域处理)

## 功能实现

### 1. 会员管理模块
1. 会员列表
   - 分页加载
   - 下拉刷新
   - 状态筛选
   - 搜索功能

2. 会员详情
   - 基本信息展示
   - 会员状态管理
   - 续费操作
   - 课程进度查看

3. 会员操作
   - 新增会员
   - 编辑信息
   - 状态更新
   - 删除会员

### 2. 课程管理模块
1. 课程进度
   - 进度展示
   - 状态更新
   - 完成记录
   - 统计报表

2. 课程操作
   - 课程分配
   - 进度更新
   - 完成确认
   - 记录查询

### 3. 续费管理模块
1. 续费操作
   - 时长选择
   - 课程增加
   - 支付处理
   - 记录保存

2. 续费记录
   - 历史记录
   - 统计报表
   - 到期提醒
   - 自动续费

### 4. 数据统计模块
1. 会员统计
   - 总数统计
   - 类型分布
   - 增长趋势
   - 活跃度分析

2. 课程统计
   - 完成率
   - 参与度
   - 满意度
   - 效果分析

## 接口文档

### 管理员接口
1. 登录认证
```javascript
POST /admin/login
请求参数：
{
    "username": string,  // 用户名
    "password": string   // 密码
}
响应数据：
{
    "code": 200,
    "message": "success",
    "data": {
        "token": string,
        "admin": {
            "id": number,
            "username": string,
            "role": string
        }
    }
}
```

2. 获取管理员信息
```javascript
GET /admin/profile
请求头：
Authorization: Bearer <token>
响应数据：
{
    "code": 200,
    "message": "success",
    "data": {
        "id": number,
        "username": string,
        "role": string,
        "created_at": string,
        "updated_at": string
    }
}
```

### 会员接口
1. 获取会员列表
```javascript
GET /member/list
请求参数：
- page: number (默认值: 1)
- pageSize: number (默认值: 10)
响应数据：
{
    "code": 200,
    "message": "success",
    "data": {
        "list": [
            {
                "id": number,
                "username": string,
                "phone": string,
                "gender": number,
                "avatar": string,
                "status": number,
                "membership_type": number,
                "end_date": string
            }
        ],
        "total": number
    }
}
```

2. 获取会员详情
```javascript
GET /member/detail/:id
响应数据：
{
    "code": 200,
    "message": "success",
    "data": {
        "id": number,
        "username": string,
        "phone": string,
        "gender": number,
        "avatar": string,
        "status": number,
        "membership_type": number,
        "start_date": string,
        "end_date": string,
        "total_courses": number,
        "completed_courses": number
    }
}
```

3. 创建会员
```javascript
POST /member/create
请求参数：
{
    "username": string,
    "phone": string,
    "gender": number,
    "membership_type": number,
    "start_date": string,
    "duration": number,
    "total_courses": number
}
响应数据：
{
    "code": 200,
    "message": "会员创建成功",
    "data": {
        "id": number
    }
}
```

### 课程接口
1. 获取课程进度
```javascript
GET /course/progress/:userId
响应数据：
{
    "code": 200,
    "message": "success",
    "data": [
        {
            "id": number,
            "title": string,
            "description": string,
            "duration": number,
            "difficulty": number,
            "instructor": string,
            "status": number,
            "completed": boolean,
            "completion_date": string
        }
    ]
}
```

2. 更新课程进度
```javascript
PUT /course/progress/:userId
请求参数：
{
    "completedCourses": number
}
响应数据：
{
    "code": 200,
    "message": "进度更新成功",
    "data": null
}
```

## 开发指南

### 项目结构
```
src/
├── api/              # API接口
├── components/       # 公共组件
├── pages/           # 页面文件
├── static/          # 静态资源
├── utils/           # 工具函数
├── App.vue          # 应用入口
└── main.js          # 主文件
```

### 开发规范
1. 命名规范
   - 文件名：小写字母，多个单词用连字符
   - 组件名：大驼峰命名
   - 变量名：小驼峰命名
   - 常量名：大写字母，下划线分隔

2. 代码规范
   - 使用 ESLint 进行代码检查
   - 使用 Prettier 进行代码格式化
   - 遵循 Vue 官方风格指南
   - 保持代码简洁清晰

3. 提交规范
   - feat: 新功能
   - fix: 修复问题
   - docs: 文档修改
   - style: 代码格式修改
   - refactor: 代码重构
   - test: 测试用例修改
   - chore: 其他修改

### 性能优化
1. 前端优化
   - 图片压缩和懒加载
   - 组件按需加载
   - 数据缓存策略
   - 防抖和节流处理

2. 后端优化
   - 数据库索引优化
   - 接口缓存处理
   - 并发请求控制
   - 错误重试机制

## 部署说明

### 开发环境
1. 环境要求
   - Node.js >= 14
   - MySQL >= 5.7
   - npm >= 6

2. 安装步骤
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 生产环境
1. 构建步骤
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

2. 部署注意事项
   - 确保环境变量配置正确
   - 检查数据库连接信息
   - 配置正确的跨域设置
   - 设置适当的缓存策略

### 监控和维护
1. 日志管理
   - 错误日志记录
   - 访问日志记录
   - 性能监控日志

2. 备份策略
   - 数据库定期备份
   - 代码版本控制
   - 配置文件备份

3. 更新维护
   - 定期更新依赖
   - 性能优化
   - 安全漏洞修复 
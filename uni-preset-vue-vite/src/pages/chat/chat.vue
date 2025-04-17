<template>
    <!-- 页面主容器 -->
    <view class="page-container">
        <!-- 页面标题栏 -->
        <view class="header">
            <text class="title">会员课程记录</text>
        </view>
        <!-- 下拉刷新组件 -->
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <!-- 会员列表 -->
            <view class="member-list">
                <!-- 会员卡片 - 循环渲染每个会员 -->
                <view class="member-card" v-for="(member, index) in memberList" :key="index">
                    <!-- 卡片头部 - 可点击展开/收起内容 -->
                    <view class="card-header" @click="toggleExpand(index)">
                        <!-- 会员基本信息 -->
                        <view class="member-info">
                            <!-- 会员头像 -->
                            <image class="avatar" :src="member.avatar || '/static/avatar/default_avatar.jpg'"
                                mode="aspectFill" />
                            <!-- 会员详细信息 -->
                            <view class="info">
                                <!-- 姓名和ID行 -->
                                <view class="name-line">
                                    <text class="name">{{ member.username }}</text>
                                    <text class="id">ID:{{ member.id }}</text>
                                </view>
                                <!-- 课程统计信息 -->
                                <view class="course-stats">
                                    <text class="stat">总课程: {{ member.totalCourses }}</text>
                                    <!-- 剩余课程数量 - 当剩余课程小于等于3节时显示警告样式 -->
                                    <text class="stat" :class="{'stat-warning': member.totalCourses - member.completedCourses <= 3}">
                                        剩余: {{ member.totalCourses - member.completedCourses }}
                                    </text>
                                </view>
                            </view>
                        </view>
                        <!-- 展开/收起图标 -->
                        <van-icon :name="member.expanded ? 'arrow-up' : 'arrow-down'" class="expand-icon" />
                    </view>

                    <!-- 卡片内容区域 - 仅在展开状态显示 -->
                    <view class="card-content" v-if="member.expanded">
                        <!-- 课程进度显示区域 -->
                        <view class="progress-section">
                            <!-- 进度标题和数值 -->
                            <view class="progress-header">
                                <text class="progress-title">课程进度</text>
                                <text class="progress-text">{{ member.completedCourses }}/{{ member.totalCourses }}</text>
                            </view>
                            <!-- 进度条 -->
                            <view class="progress-bar">
                                <!-- 进度条填充部分 - 根据完成比例动态调整宽度 -->
                                <view class="progress-inner"
                                    :style="{ width: `${(member.completedCourses / member.totalCourses) * 100}%` }"
                                    :class="{'progress-complete': member.completedCourses === member.totalCourses}">
                                </view>
                            </view>
                        </view>

                        <!-- 课程网格 - 显示所有课程项目 -->
                        <view class="course-grid">
                            <!-- 课程项目 - 根据完成状态显示不同样式 -->
                            <view v-for="(course, courseIndex) in member.totalCourses" :key="courseIndex"
                                class="course-item" :class="{
                                    'completed': courseIndex < member.completedCourses, // 已完成课程
                                    'current': courseIndex === member.completedCourses, // 当前即将完成的课程
                                    'disabled': courseIndex > member.completedCourses  // 尚未达到的课程
                                }" @click="toggleCourse(index, courseIndex)">
                                <!-- 课程内容 -->
                                <view class="course-content">
                                    <!-- 完成/未完成图标 -->
                                    <van-icon :name="courseIndex < member.completedCourses ? 'checked' : 'circle'"
                                        :class="{'check-icon': courseIndex < member.completedCourses}" />
                                    <!-- 课程编号 -->
                                    <text class="course-number">#{{ courseIndex + 1 }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </van-pull-refresh>
    </view>
</template>

<script>
import { getVipMembers, getCourseProgress, updateCourseProgress } from '@/api/request'

export default {
    // 组件数据
    data() {
        return {
            memberList: [],       // 会员列表数据
            loading: false,       // 加载状态标志
            error: false,         // 错误状态标志
            refreshing: false     // 刷新状态标志
        }
    },
    // 页面加载时执行
    onLoad() {
        // 加载会员列表数据
        this.loadMemberList();
    },
    // 页面显示时执行
    onShow() {
        // 确保页面显示时也刷新数据，仅当列表为空时加载
        if (!this.memberList.length) {
            this.loadMemberList();
        }
    },
    // 组件方法
    methods: {
        /**
         * 下拉刷新处理函数
         * 设置刷新标志并重新加载会员列表
         */
        onRefresh() {
            this.refreshing = true;
            this.loadMemberList();
        },
        
        /**
         * 加载会员列表数据
         * 从API获取VIP会员数据并处理
         */
        async loadMemberList() {
            try {
                // 设置加载状态
                this.loading = true;
                this.error = false;

                // 调用API获取VIP会员数据
                const vipRes = await getVipMembers();
                if (vipRes.code === 200) {
                    // 处理API返回的数据
                    this.memberList = vipRes.data.map(member => ({
                        ...member,
                        expanded: false,                       // 初始状态为折叠
                        totalCourses: member.total_courses,    // 总课程数
                        completedCourses: member.completed_courses // 已完成课程数
                    }));
                } else {
                    // 记录错误状态并显示提示
                    this.error = true;
                    uni.showToast({
                        title: vipRes.message || '获取VIP会员失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                // 处理异常错误
                console.error('加载会员列表失败:', error);
                this.error = true;
                uni.showToast({
                    title: error.message || '加载失败',
                    icon: 'none'
                });
            } finally {
                // 无论成功失败，都重置加载状态
                this.loading = false;
                this.refreshing = false; // 刷新完成
            }
        },

        /**
         * 切换课程完成状态
         * @param {Number} memberIndex - 会员在列表中的索引
         * @param {Number} courseIndex - 课程索引
         */
        async toggleCourse(memberIndex, courseIndex) {
            const member = this.memberList[memberIndex];
            const newCompletedCount = courseIndex + 1;
            
            // 如果点击的是已完成的课程，则取消选择
            if (courseIndex < member.completedCourses) {
                try {
                    // 更新本地UI状态
                    member.completedCourses = courseIndex;
                    
                    // 调用API更新后端数据
                    const res = await updateCourseProgress(member.id, courseIndex);
                    
                    if (res.code === 200) {
                        // 使用后端返回的最新进度数据更新本地状态
                        const latestProgress = res.data[0];
                        member.completedCourses = latestProgress.completed_courses;
                        member.totalCourses = latestProgress.total_courses;
                        
                        // 显示操作成功提示
                        uni.showToast({
                            title: '已取消选择',
                            icon: 'success'
                        });
                    } else {
                        // API返回错误，回滚本地状态
                        member.completedCourses = courseIndex + 1;
                        uni.showToast({
                            title: res.message || '更新失败',
                            icon: 'none'
                        });
                    }
                } catch (error) {
                    // 处理异常错误，回滚本地状态
                    console.error('更新进度失败:', error);
                    member.completedCourses = courseIndex + 1;
                    uni.showToast({
                        title: '更新失败，请重试',
                        icon: 'none'
                    });
                }
                return;
            }

            // 选择未完成的课程，标记为已完成
            try {
                // 先更新本地UI状态
                member.completedCourses = newCompletedCount;
                
                // 调用API更新后端数据
                const res = await updateCourseProgress(member.id, newCompletedCount);
                
                if (res.code === 200) {
                    // 使用后端返回的最新进度数据更新本地状态
                    const latestProgress = res.data[0];
                    member.completedCourses = latestProgress.completed_courses;
                    member.totalCourses = latestProgress.total_courses;
                    
                    // 显示操作成功提示
                    uni.showToast({
                        title: '更新成功',
                        icon: 'success'
                    });
                } else {
                    // API返回错误，回滚本地状态
                    member.completedCourses = newCompletedCount - 1;
                    uni.showToast({
                        title: res.message || '更新失败',
                        icon: 'none'
                    });
                }
            } catch (error) {
                // 处理异常错误，回滚本地状态
                console.error('更新进度失败:', error);
                member.completedCourses = newCompletedCount - 1;
                uni.showToast({
                    title: '更新失败，请重试',
                    icon: 'none'
                });
            }
        },

        /**
         * 切换会员卡片的展开/折叠状态
         * @param {Number} index - 会员在列表中的索引
         */
        toggleExpand(index) {
            // 使用Vue的$set确保响应式更新
            this.$set(this.memberList, index, {
                ...this.memberList[index],
                expanded: !this.memberList[index].expanded
            });
        },
    }
}
</script>

<style>
/* 基础样式 */
.page-container {
    padding: 0;
    /* background: #f1f5f9; */
    min-height: 100vh;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 下拉刷新样式 */
:deep(.van-pull-refresh__track) {
    min-height: calc(100vh - 100px);
}

:deep(.van-pull-refresh__head) {
    height: 50px;
}

/* 标题样式 */
.header {
    padding: 20px 16px 10px;
    background: #ffffff;
    margin-bottom: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    border-bottom: 1px solid #e2e8f0;
}

.title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    display: block;
    letter-spacing: -0.3px;
}

/* 会员列表样式 */
.member-list {
    padding: 12px;
}

/* 会员卡片样式 - 凸起效果 */
.member-card {
    background: #ffffff;
    border-radius: 10px;
    margin-bottom: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.07);
    overflow: hidden;
    transition: all 0.2s ease;
    border: 1px solid #e2e8f0;
}

.member-card:active {
    transform: translateY(2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

/* 卡片头部样式 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    cursor: pointer;
    position: relative;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
}

.card-header:after {
    content: none;
}

/* 会员信息样式 */
.member-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.avatar {
    width: 56px;
    height: 56px;
    border-radius: 28px;
    border: 2px solid #e2e8f0;
    object-fit: cover;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.info {
    flex: 1;
}

.name-line {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.name {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.3px;
}

.id {
    font-size: 12px;
    color: #fff;
    background: #3b82f6;
    padding: 2px 8px;
    border-radius: 16px;
    letter-spacing: 0.2px;
    font-weight: 500;
}

/* 课程统计样式 */
.course-stats {
    display: flex;
    gap: 12px;
}

.stat {
    font-size: 13px;
    color: #334155;
    background: #f1f5f9;
    padding: 5px 12px;
    border-radius: 8px;
    font-weight: 600;
    letter-spacing: 0.2px;
}

.stat-warning {
    color: #dc2626;
    background: #fee2e2;
}

/* 展开图标样式 */
.expand-icon {
    font-size: 18px;
    color: #64748b;
    transition: transform 0.3s ease;
    background: #f8fafc;
    padding: 8px;
    border-radius: 50%;
    /* box-shadow: 0 2px 4px rgba(0,0,0,0.05); */
}

/* 卡片内容样式 */
.card-content {
    padding: 20px;
    background: #f8fafc;
}

/* 进度条样式 */
.progress-section {
    margin-bottom: 20px;
    background: #ffffff;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.progress-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.3px;
}

.progress-text {
    font-size: 16px;
    font-weight: 700;
    color: #3b82f6;
    background: #eff6ff;
    padding: 4px 12px;
    border-radius: 8px;
    letter-spacing: -0.3px;
}

.progress-bar {
    height: 10px;
    background: #e2e8f0;
    border-radius: 5px;
    overflow: hidden;
}

.progress-inner {
    height: 100%;
    background: #3b82f6;
    border-radius: 5px;
    transition: width 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.progress-complete {
    background: #10b981;
}

/* 课程网格样式 */
.course-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
}

.course-item {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    border: 1px solid #e2e8f0;
}

.course-item:active {
    transform: scale(0.95);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.course-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

.course-number {
    font-size: 14px;
    color: #334155;
    font-weight: 600;
    letter-spacing: -0.3px;
}

/* 课程状态样式 */
.course-item.completed {
    background: #f0fdf4;
    border: 1px solid #86efac;
}

.course-item.current {
    background: #eff6ff;
    border: 2px solid #3b82f6;
}

.course-item.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}

.check-icon {
    color: #10b981 !important;
    font-weight: bold;
}

:deep(.van-icon) {
    font-size: 22px;
    color: #64748b;
}

/* 响应式调整 */
@media (min-width: 768px) {
    .course-grid {
        grid-template-columns: repeat(5, 1fr);
    }
}
</style>
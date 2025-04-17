/**
 * 计算剩余天数的工具函数
 * @param {string|Date} endDate 结束日期
 * @returns {number} 剩余天数
 */
export const calculateRemainingDays = (endDate) => {
  if (!endDate) return 0;
  
  // 创建日期对象并去除时间部分
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 计算天数差异
  const diffTime = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * 判断会员是否有效（未过期）
 * @param {string|Date} endDate 结束日期
 * @returns {boolean} 是否有效
 */
export const isMemberActive = (endDate) => {
  if (!endDate) return false;
  return calculateRemainingDays(endDate) > 0;
};

/**
 * 格式化日期为本地字符串
 * @param {string|Date} date 日期
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date) return '未设置';
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}; 
// 帅帅亲子乐园 - 员工工作台
const app = getApp();

Page({
  data: {
    adminInfo: null,
    currentDate: '',
    currentTime: '',
    todayStats: {
      verified: 0,
      tickets: 0,
      revenue: 0,
    },
    pendingVerify: 0,
    recentRecords: [],
  },

  onLoad() {
    this.checkLogin();
    this.initData();
  },

  onShow() {
    this.updateTime();
  },

  onPullDownRefresh() {
    this.initData();
    wx.stopPullDownRefresh();
  },

  // 检查登录状态
  checkLogin() {
    const adminInfo = wx.getStorageSync('adminInfo');
    if (!adminInfo || adminInfo.role !== 'employee') {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: () => {
          wx.redirectTo({ url: '/pages/admin/login/login' });
        },
      });
      return;
    }
    this.setData({ adminInfo });
  },

  // 初始化数据
  initData() {
    this.updateTime();
    this.loadTodayStats();
    this.loadRecentRecords();
  },

  // 更新时间
  updateTime() {
    const now = new Date();
    const date = `${now.getMonth() + 1}月${now.getDate()}日`;
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.setData({ currentDate: date, currentTime: time });
  },

  // 加载今日统计
  loadTodayStats() {
    //模拟数据，实际从服务器获取
    const stats = wx.getStorageSync('todayStats') || { verified: 12, tickets: 8, revenue: 1568 };
    this.setData({ todayStats: stats });
  },

  // 加载最近核销记录
  loadRecentRecords() {
    const records = wx.getStorageSync('verifyRecords') || [];
    this.setData({
      recentRecords: records.slice(0, 5),
      pendingVerify: records.filter(r => r.status === 'pending').length,
    });
  },

  // 跳转到核销页面
  goToVerify() {
    wx.navigateTo({ url: '/pages/admin/verify/verify' });
  },

  // 提交日报
  goToDailyReport() {
    wx.showModal({
      title: '📊 提交日报',
      content: '请选择班次类型：',
      confirmText: '早班(9-14点)',
      cancelText: '晚班(14-21点)',
      success: (res) => {
        if (res.confirm) {
          this.submitReport('早班');
        } else {
          this.submitReport('晚班');
        }
      },
    });
  },

  // 提交日报内容
  submitReport(shift) {
    const { todayStats, adminInfo } = this.data;
    const now = new Date();
    const report = {
      date: now.toISOString().split('T')[0],
      shift,
      employeeId: adminInfo.employeeId,
      employeeName: adminInfo.name,
      verifiedCount: todayStats.verified,
      ticketCount: todayStats.tickets,
      revenue: todayStats.revenue,
      submittedAt: now.toISOString(),
    };

    // 保存日报
    const reports = wx.getStorageSync('dailyReports') || [];
    reports.unshift(report);
    wx.setStorageSync('dailyReports', reports);

    wx.showToast({ title: '日报已提交', icon: 'success' });
  },

  // 特殊情况上报
  reportSpecial() {
    wx.showModal({
      title: '⚠️ 特殊情况上报',
      content: '请选择情况类型：',
      confirmText: '设备故障',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.showSpecialForm('设备故障');
        }
      },
    });
  },

  // 显示特殊情况表单
  showSpecialForm(type) {
    wx.showModal({
      title: `⚠️ ${type}上报`,
      content: '请简要描述情况：',
      editable: true,
      placeholderText: '描述具体情况...',
      success: (res) => {
        if (res.confirm && res.content) {
          this.sendSpecialReport(type, res.content);
        }
      },
    });
  },

  // 发送特殊情况报告
  sendSpecialReport(type, description) {
    const { adminInfo } = this.data;
    const now = new Date();

    const report = {
      type,
      description,
      employeeId: adminInfo.employeeId,
      employeeName: adminInfo.name,
      time: now.toISOString(),
      priority: 'high',
    };

    // 保存并通知老板（模拟）
    const reports = wx.getStorageSync('specialReports') || [];
    reports.unshift(report);
    wx.setStorageSync('specialReports', reports);

    // 模拟通知老板
    this.notifyBoss(type, description, adminInfo.name);

    wx.showToast({ title: '已通知老板', icon: 'success' });
  },

  // 通知老板（实际需要对接消息推送）
  notifyBoss(type, description, employeeName) {
    // 实际项目中调用老板通知接口
    console.log(`通知老板：员工${employeeName}上报${type} - ${description}`);
  },

  // 查看全部记录
  viewAllRecords() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定退出登录？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminInfo');
          wx.redirectTo({ url: '/pages/admin/login/login' });
        }
      },
    });
  },
});
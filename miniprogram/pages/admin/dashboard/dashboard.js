// 帅帅亲子乐园 - 老板后台
const app = getApp();

Page({
  data: {
    currentTab: 'overview',
    adminInfo: null,

    // 统计数据
    todayStats: { revenue: 0, visitors: 0, verified: 0 },
    monthStats: { revenue: 0 },
    liveEvents: [],

    // 价格管理
    tickets: [],
    originalPrices: {},

    // 日报
    todayDate: '',
    yesterdayDate: '',
    reportDate: '',
    reportStats: { verified: 0, tickets: 0, revenue: 0 },
    reportList: [],

    // 员工管理
    employeeList: [],
    newEmployeeOpenid: '',
    newEmployeeName: '',

    // 通知
    notifyCount: 0,
    notifications: [],
  },

  onLoad() {
    this.checkLogin();
    this.initDates();
    this.loadData();
  },

  onShow() {
    this.loadNotifications();
  },

  // 检查登录状态
  checkLogin() {
    const adminInfo = wx.getStorageSync('adminInfo');
    if (!adminInfo || adminInfo.role !== 'boss') {
      wx.showModal({
        title: '提示',
        content: '请先以老板身份登录',
        success: () => {
          wx.redirectTo({ url: '/pages/admin/login/login' });
        },
      });
      return;
    }
    this.setData({ adminInfo });
  },

  // 初始化日期
  initDates() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (d) => d.toISOString().split('T')[0];

    this.setData({
      todayDate: formatDate(today),
      yesterdayDate: formatDate(yesterday),
      reportDate: formatDate(today),
    });
  },

  // 加载数据
  loadData() {
    this.loadStats();
    this.loadTickets();
    this.loadLiveEvents();
    this.loadDailyReports();
    this.loadNotifications();
    this.loadEmployeeList();
  },

  // 加载员工列表
  loadEmployeeList() {
    const employeeList = wx.getStorageSync('employeeList') || [
      { openid: 'o6zAJs老板openid', name: '老板', role: 'boss', isBoss: true },
      { openid: 'o6zAJszt2TtvczyAbFJBPEeS63wg', name: '张三', role: 'employee', isBoss: false },
    ];
    this.setData({ employeeList });
  },

  // 输入新员工OpenID
  onNewEmployeeOpenid(e) {
    this.setData({ newEmployeeOpenid: e.detail.value });
  },

  // 输入新员工昵称
  onNewEmployeeName(e) {
    this.setData({ newEmployeeName: e.detail.value });
  },

  // 添加新员工
  addNewEmployee() {
    const { newEmployeeOpenid, newEmployeeName } = this.data;

    if (!newEmployeeOpenid || !newEmployeeName) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const employeeList = this.data.employeeList;

    // 检查是否已存在
    if (employeeList.some(e => e.openid === newEmployeeOpenid)) {
      wx.showToast({ title: '该账号已是员工', icon: 'none' });
      return;
    }

    // 添加新员工
    employeeList.push({
      openid: newEmployeeOpenid,
      name: newEmployeeName,
      role: 'employee',
      isBoss: false,
      addTime: new Date().toISOString(),
    });

    wx.setStorageSync('employeeList', employeeList);
    this.setData({
      employeeList,
      newEmployeeOpenid: '',
      newEmployeeName: '',
    });

    wx.showToast({ title: '员工已添加', icon: 'success' });
  },

  // 加载统计数据
  loadStats() {
    const todayStats = wx.getStorageSync('todayStats') || { revenue: 1568, visitors: 42, verified: 12 };
    const monthStats = wx.getStorageSync('monthStats') || { revenue: 45680 };

    this.setData({ todayStats, monthStats });
  },

  // 加载票种数据
  loadTickets() {
    const tickets = app.globalData.ticketTypes.map(t => ({ ...t }));
    const originalPrices = {};
    tickets.forEach(t => {
      originalPrices[t.id] = t.price;
    });

    this.setData({ tickets, originalPrices });
  },

  // 加载实时动态
  loadLiveEvents() {
    const events = [
      { id: 1, icon: '🎫', text: '抖音券码 382947182739核销成功', time: '10:32' },
      { id: 2, icon: '💰', text: '售出10次卡1张，金额¥388', time: '10:28' },
      { id: 3, icon: '👶', text: '新顾客入场，当前在场42人', time: '10:25' },
      { id: 4, icon: '⭐', text: '大众点评券码 928471294 核销成功', time: '10:20' },
      { id: 5, icon: '🎂', text: '生日派对房预订，6月15日', time: '10:15' },
    ];

    this.setData({ liveEvents: events });
  },

  // 加载日报数据
  loadDailyReports() {
    const reports = wx.getStorageSync('dailyReports') || [
      { id: 1, employeeName: '员工1001', shift: '早班', verifiedCount: 8, ticketCount: 5, revenue: 688, submittedAt: '14:05' },
      { id: 2, employeeName: '员工1001', shift: '晚班', verifiedCount: 4, ticketCount: 3, revenue: 880, submittedAt: '21:02' },
    ];

    const { reportDate } = this.data;

    const filteredReports = reports.filter(r => {
      const reportDateStr = r.date || '';
      return reportDateStr === reportDate;
    });

    const reportStats = filteredReports.reduce((acc, r) => ({
      verified: acc.verified + r.verifiedCount,
      tickets: acc.tickets + r.ticketCount,
      revenue: acc.revenue + r.revenue,
    }), { verified: 0, tickets: 0, revenue: 0 });

    this.setData({
      reportList: filteredReports,
      reportStats,
    });
  },

  // 加载通知
  loadNotifications() {
    const notifications = wx.getStorageSync('notifications') || [];
    this.setData({
      notifications,
      notifyCount: notifications.filter(n => !n.read).length,
    });
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // 价格输入
  onPriceInput(e) {
    const id = e.currentTarget.dataset.id;
    const price = parseFloat(e.detail.value) || 0;

    const tickets = this.data.tickets.map(t =>
      t.id === id ? { ...t, price } : t
    );

    this.setData({ tickets });
  },

  // 保存价格调整
  savePrices() {
    const { tickets, originalPrices } = this.data;
    const changedTickets = [];
    const changes = [];

    tickets.forEach(t => {
      if (t.price !== originalPrices[t.id]) {
        changedTickets.push(t);
        changes.push({
          name: t.name,
          oldPrice: originalPrices[t.id],
          newPrice: t.price,
        });
      }
    });

    if (changedTickets.length === 0) {
      wx.showToast({ title: '价格未变动', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '⚠️ 价格调整确认',
      content: `即将调整 ${changedTickets.length} 个票种价格：\n${changes.map(c => `${c.name}：¥${c.oldPrice} → ¥${c.newPrice}`).join('\n')}\n\n是否确认？`,
      success: (res) => {
        if (res.confirm) {
          // 保存新价格
          app.globalData.ticketTypes = tickets;
          wx.setStorageSync('ticketTypes', tickets);

          // 发送通知给老板自己（价格变动通知）
          this.sendPriceChangeNotification(changes);

          wx.showToast({ title: '价格已保存', icon: 'success' });
        }
      },
    });
  },

  // 发送价格变动通知
  sendPriceChangeNotification(changes) {
    const { adminInfo } = this.data;
    const now = new Date();

    const notification = {
      id: Date.now(),
      type: 'price',
      title: '价格调整通知',
      description: `员工${adminInfo.name}调整了${changes.length}个票种价格`,
      details: changes,
      from: adminInfo.name,
      time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      createdAt: now.toISOString(),
    };

    const notifications = wx.getStorageSync('notifications') || [];
    notifications.unshift(notification);
    wx.setStorageSync('notifications', notifications);

    //模拟推送通知（实际项目中调用消息推送API）
    this.simulatePushNotification(notification);
  },

  // 模拟推送通知
  simulatePushNotification(notification) {
   console.log('📢 推送通知:', notification);
    // 实际项目中：调用微信订阅消息或企业微信/钉钉API
  },

  // 恢复默认价格
  resetPrice() {
    wx.showModal({
      title: '提示',
      content: '确定恢复默认价格？',
      success: (res) => {
        if (res.confirm) {
          const originalTickets = app.globalData.ticketTypes.map(t => ({
            ...t,
            price: t.originalPrice,
          }));

          app.globalData.ticketTypes = originalTickets;
          this.setData({ tickets: originalTickets });

          wx.showToast({ title: '已恢复默认价格', icon: 'success' });
        }
      },
    });
  },

  // 选择日报日期
  selectReportDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ reportDate: date });
    this.loadDailyReports();
  },

  // 选择本周
  selectWeek() {
    wx.showToast({ title: '本周汇总功能开发中', icon: 'none' });
  },

  // 处理通知
  handleNotify(e) {
    const id = e.currentTarget.dataset.id;
    const notifications = this.data.notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );

    wx.setStorageSync('notifications', notifications);

    this.setData({
      notifications,
      notifyCount: notifications.filter(n => !n.read).length,
    });

    // 显示详情
    const notify = notifications.find(n => n.id === id);
    if (notify) {
      let content = notify.description;
      if (notify.details) {
        content += '\n\n' + notify.details.map(d => `${d.name}：¥${d.oldPrice} → ¥${d.newPrice}`).join('\n');
      }

      wx.showModal({
        title: notify.title,
        content,
        showCancel: false,
        confirmText: '我知道了',
      });
    }
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
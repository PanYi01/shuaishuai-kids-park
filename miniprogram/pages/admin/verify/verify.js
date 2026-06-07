// 帅帅亲子乐园 - 核销验证页面
const app = getApp();

Page({
  data: {
    platform: 'douyin',
    platformName: '抖音',
    voucherCode: '',
    todayStats: {
      douyin: 5,
      dianping: 3,
      meituan: 2,
      total: 10,
    },
    todayRecords: [],
  },

  onLoad() {
    this.loadTodayRecords();
  },

  // 选择平台
  selectPlatform(e) {
    const platform = e.currentTarget.dataset.platform;
    const platformNames = { douyin: '抖音', dianping: '大众点评', meituan: '美团' };
    this.setData({
      platform,
      platformName: platformNames[platform],
      voucherCode: '',
    });
  },

  // 输入券码
  onCodeInput(e) {
    this.setData({ voucherCode: e.detail.value });
  },

  // 清空输入
  clearCode() {
    this.setData({ voucherCode: '' });
  },

  // 扫码核销
  scanCode() {
    wx.scanCode({
      success: (res) => {
        this.setData({ voucherCode: res.result });
        this.verifyCode();
      },
      fail: () => {
        wx.showToast({ title: '扫码失败，请手动输入', icon: 'none' });
      },
    });
  },

  // 验证券码
  verifyCode() {
    const { voucherCode, platform } = this.data;

    if (!voucherCode) {
      wx.showToast({ title: '请输入券码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '验证中...' });

    // 模拟验证请求
    setTimeout(() => {
      wx.hideLoading();

      const now = new Date();
      const record = {
        id: Date.now(),
        platform,
        code: voucherCode,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        status: 'success',
        verifiedAt: now.toISOString(),
      };

      // 保存记录
      const records = wx.getStorageSync('verifyRecords') || [];
      records.unshift(record);
      wx.setStorageSync('verifyRecords', records);

      // 更新统计
      this.updateStats(platform);
      this.loadTodayRecords();

      // 成功提示
      wx.showModal({
        title: '✅ 核销成功',
        content: `券码 ${voucherCode}核销成功！\n请引导顾客入场，祝游玩愉快！`,
        showCancel: false,
        confirmText: '知道了',
      });

      this.setData({ voucherCode: '' });
    }, 1000);
  },

  // 更新统计
  updateStats(platform) {
    const stats = wx.getStorageSync('todayStats') || { verified: 0, tickets: 0, revenue: 0 };
    stats.verified += 1;
    wx.setStorageSync('todayStats', stats);

    const todayStats = { ...this.data.todayStats };
    todayStats[platform] += 1;
    todayStats.total += 1;
    this.setData({ todayStats });
  },

  // 加载今日记录
  loadTodayRecords() {
    const allRecords = wx.getStorageSync('verifyRecords') || [];
    const today = new Date().toISOString().split('T')[0];

    const todayRecords = allRecords.filter(r => {
      const recordDate = r.verifiedAt ? r.verifiedAt.split('T')[0] : '';
      return recordDate === today;
    });

    this.setData({ todayRecords });
  },
});
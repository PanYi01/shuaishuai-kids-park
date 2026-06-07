// 帅帅亲子乐园 - 首页逻辑
const app = getApp();

Page({
  data: {
    activities: [],
  },

  onLoad() {
    this.loadActivities();
  },

  onShow() {
    //每次显示时刷新数据
  },

  onPullDownRefresh() {
    this.loadActivities();
    wx.stopPullDownRefresh();
  },

  // 加载活动数据
  loadActivities() {
    const activities = app.globalData.activities.slice(0, 3);
    this.setData({ activities });
  },

  // 跳转到购票页面
  goToTickets() {
    wx.switchTab({
      url: '/pages/tickets/tickets',
    });
  },

  // 跳转到活动页面
  goToActivity() {
    wx.switchTab({
      url: '/pages/activity/activity',
    });
  },

  // 跳转到会员中心
  goToMember() {
    wx.switchTab({
      url: '/pages/member/member',
    });
  },

  // 跳转到游玩指南
  goToGuide() {
    wx.navigateTo({
      url: '/pages/guide/guide',
    });
  },

  // 跳转到活动详情
  goToActivityDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/activity/activity?id=${id}`,
    });
  },

  // 跳转促销专题页
  goToPromo() {
    wx.navigateTo({
      url: '/pages/promo/promo',
    });
  },

  // 跳转后台管理（隐藏入口）
  goToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/login/login',
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '帅帅亲子乐园 - 给孩子一个快乐的童年',
      path: '/pages/index/index',
      imageUrl: '/images/share-poster.png',
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '帅帅亲子乐园 - 带孩子来玩吧',
      query: '',
      imageUrl: '/images/share-poster.png',
    };
  },
});
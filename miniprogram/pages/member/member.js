// 帅帅亲子乐园 - 会员中心逻辑
const app = getApp();

Page({
  data: {
    isLogin: false,
    userInfo: null,
    memberInfo: null,
    couponCount: 0,
  },

  onLoad() {
    this.checkLoginStatus();
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = app.getUserInfo();
    const memberInfo = app.getMemberInfo();
    const isLogin = !!userInfo;

    this.setData({
      isLogin,
      userInfo: userInfo || { avatar: '', nickname: '', phone: '' },
      memberInfo,
    });
  },

  // 去登录
  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },

  // 显示会员卡
  showMemberCard() {
    wx.showToast({ title: '会员卡功能开发中', icon: 'none' });
  },

  // 我的订单
  goToOrders() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/orders/orders',
    });
  },

  // 优惠券
  goToCoupons() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/coupons/coupons',
    });
  },

  // 我的活动
  goToActivities() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/activities/activities',
    });
  },

  // 我的收藏
  goToFavorites() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/favorites/favorites',
    });
  },

  // 游玩记录
  goToHistory() {
    if (!this.checkLogin()) return;
    wx.navigateTo({
      url: '/pages/history/history',
    });
  },

  // 设置
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings',
    });
  },

  // 帮助与反馈
  goToHelp() {
    wx.navigateTo({
      url: '/pages/help/help',
    });
  },

  // 联系客服
  callService() {
    wx.makePhoneCall({
      phoneNumber: '400-XXX-XXXX',
    });
  },

  // 检查登录
  checkLogin() {
    if (!this.data.isLogin) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再进行操作',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            this.goLogin();
          }
        },
      });
      return false;
    }
    return true;
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '帅帅亲子乐园 - 会员中心',
      path: '/pages/member/member',
    };
  },
});
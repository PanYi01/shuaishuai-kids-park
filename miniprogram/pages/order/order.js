// 帅帅亲子乐园 - 订单确认页面逻辑
const app = getApp();

Page({
  data: {
    orderType: 'buyTicket', // buyTicket | activity
    ticketInfo: null,
    activityInfo: null,
    orderDate: '',
    quantity: 1,
    originalAmount: 0,
    actualAmount: 0,
    couponDiscount: 0,
    pointsDiscount: 0,
    selectedCoupon: null,
    usePoints: false,
    availablePoints: 0,
    memberBalance: 0,
    paymentMethod: 'wechat',
    agreeTerms: false,
  },

  onLoad(options) {
    this.initOrder(options);
  },

  // 初始化订单
  initOrder(options) {
    const { type, ticketId, date, quantity, totalPrice, activityId } = options;

    this.setData({ orderType: type });

    if (type === 'buyTicket') {
      // 票务订单
      const ticket = app.globalData.ticketTypes.find(t => t.id === parseInt(ticketId));
      const qty = parseInt(quantity);
      const total = parseFloat(totalPrice);

      this.setData({
        ticketInfo: ticket,
        orderDate: date,
        quantity: qty,
        originalAmount: total,
        actualAmount: total,
      });
    } else if (type === 'activity') {
      // 活动订单
      const activity = app.globalData.activities.find(a => a.id === parseInt(activityId));
      this.setData({
        activityInfo: activity,
        quantity: 1,
        originalAmount: 0, // 活动暂时免费
        actualAmount: 0,
      });
    }

    // 模拟会员数据
    this.setData({
      availablePoints: 500,
      memberBalance: 200,
    });
  },

  // 打开优惠券选择器
  openCouponPicker() {
    wx.showToast({ title: '优惠券功能开发中', icon: 'none' });
  },

  // 切换积分使用
  togglePoints(e) {
    const usePoints = e.detail.value;
    this.setData({ usePoints });
    this.calculateAmount();
  },

  // 选择支付方式
  selectPayment(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ paymentMethod: method });
  },

  // 计算实际金额
  calculateAmount() {
    const { originalAmount, couponDiscount, pointsDiscount } = this.data;
    const actualAmount = originalAmount - couponDiscount - pointsDiscount;
    this.setData({ actualAmount: Math.max(0, actualAmount) });
  },

  // 切换用户协议勾选
  toggleTerms() {
    this.setData({
      agreeTerms: !this.data.agreeTerms,
    });
  },

  // 显示游玩须知
  showTerms() {
    wx.showModal({
      title: '游玩须知',
      content: '1. 请家长全程看护好儿童\n2. 请穿着防滑袜入场\n3. 禁止携带外来食品\n4. 请保管好随身物品\n5. 如有不适请及时告知工作人员',
      showCancel: false,
      confirmText: '我知道了',
    });
  },

  // 显示退票规则
  showRefund() {
    wx.showModal({
      title: '退票规则',
      content: '1. 游玩日前1天可免费退票\n2. 游玩日当天退票收取10%手续费\n3. 逾期不支持退票\n4. 如遇乐园特殊情况可全额退票',
      showCancel: false,
      confirmText: '我知道了',
    });
  },

  // 提交订单
  submitOrder() {
    if (!this.data.agreeTerms) {
      wx.showToast({ title: '请阅读并同意相关条款', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '正在提交...' });

    // 模拟订单提交
    setTimeout(() => {
      wx.hideLoading();
      this.showPaymentSuccess();
    }, 1500);
  },

  // 支付成功
  showPaymentSuccess() {
    wx.showModal({
      title: '下单成功',
      content: '恭喜您！订单已提交成功，请到我的订单中查看电子票。',
      showCancel: false,
      confirmText: '查看订单',
      success: (res) => {
        if (res.confirm) {
          // 跳转到订单列表
          wx.switchTab({
            url: '/pages/member/member',
          });
        }
      },
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '帅帅亲子乐园 - 订单确认',
      path: '/pages/order/order',
    };
  },
});
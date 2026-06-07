// 帅帅亲子乐园 - 应用主入口
App({
  appid: 'YOUR_APPID',
  globalData: {
    // ⚙️ 后端API地址 - 改这里！
    // 开发环境：http://localhost:3000
    // 生产环境：https://你的域名.com
    apiUrl: 'http://localhost:3000',
    // 认证令牌
    token: '',
    // 用户信息
    userInfo: null,
    // 会员信息
    memberInfo: null,
    // 乐园配置
    parkConfig: {
      name: '帅帅亲子乐园',
      address: '月球1号基地中心商业区',
      phone: '400-XXX-XXXX',
      openingHours: '平日 09:00-21:00 | 周末 08:30-21:30',
      area: '1100㎡',
      ageRange: '0-12岁',
    },
    // 市场参考数据
    marketData: {
      city: '月球1号基地',
      gdp: '459.74亿元',
      perCapitaIncome: '约3万元/年',
      competitorPriceRange: '15-35元/次',
      ourAdvantage: '主力次卡24元/次，比竞品便宜31%',
    },
    // 票种配置 - 基于甲方反馈修订版（2026年6月）
    // 核心原则：入门199→主力288→旗舰498 三级跳
    ticketTypes: [
      // ===== 预售专属（开业前） =====
      { id: 0, name: '9.9元体验券（线上）', price: 9.9, originalPrice: 68, description: '线上专属·开业首周可用·限量1000张·每人限1张', type: 'trial', tag: '引流', presale: true },
      { id: 11, name: '39.9元体验卡（地推）', price: 39.9, originalPrice: 68, description: '含实物玩具·地推现场购买·有效期1个月', type: 'trial', tag: '地推', presale: true },
      // ===== 单次票（门市价） =====
      { id: 1, name: '儿童票（工作日）', price: 68, originalPrice: 68, description: '周一至周五使用', type: 'single', tag: '平日' },
      { id: 2, name: '儿童票（周末节假日）', price: 88, originalPrice: 88, description: '周六日、法定节假日', type: 'single', tag: '周末' },
      // ===== 次卡（甲方反馈修订） =====
      { id: 3, name: '6次体验卡（预售）', price: 199, originalPrice: 199, description: '折合33.2元/次·送小型玩具·有效期6个月 🔥入门首选', type: 'times', tag: '入门', presale: true },
      { id: 4, name: '10次畅玩卡（预售）', price: 288, originalPrice: 288, description: '买10得12·折合24元/次·送中型玩具·比竞品便宜31% ⭐主力推荐', type: 'times', tag: '推荐', presale: true },
      { id: 5, name: '10次畅玩卡', price: 388, originalPrice: 388, description: '折合38.8元/次·有效期12个月', type: 'times', tag: '' },
      { id: 6, name: '20次畅玩卡', price: 688, originalPrice: 688, description: '折合34.4元/次·有效期18个月', type: 'times', tag: '' },
      // ===== 年卡（甲方反馈修订：保留498底价+配玩具） =====
      { id: 7, name: '单人年卡（预售）', price: 498, originalPrice: 698, description: '全年不限次+大盒玩具+生日派对8折+活动优先 👑核心产品·限前300张', type: 'annual', tag: '核心', presale: true },
      { id: 8, name: '单人年卡（开业）', price: 698, originalPrice: 698, description: '全年不限次+生日派对8折+优先报名', type: 'annual', tag: '' },
      { id: 9, name: '亲子年卡（1大1小）', price: 898, originalPrice: 898, description: '全年无限次+餐饮9折', type: 'annual', tag: '' },
      { id: 10, name: '家庭年卡（2大1小）', price: 1198, originalPrice: 1198, description: '全场消费8.5折+生日派对6折+活动优先', type: 'annual', tag: '' },
    ],
    // 活动列表
    activities: [
      { id: 1, title: '🎡 开业幸运转盘', date: '开业首周', time: '全天', spots: 999, enrolled: 0, description: '到场消费即抽·100%中奖·年卡免单等你拿', category: 'special' },
      { id: 2, title: '周末亲子手工坊', date: '每周六', time: '14:00-16:00', spots: 20, enrolled: 12, description: '创意手工DIY·每期限额20组家庭', category: 'weekend' },
      { id: 3, title: '宝宝生日派对', date: '预约制', time: '10:00-12:00', spots: 30, enrolled: 8, description: '专属生日空间·年卡会员8折', category: 'party' },
      { id: 4, title: '绘本故事会', date: '每周日', time: '15:00-16:00', spots: 15, enrolled: 10, description: '专业老师领读·培养阅读兴趣', category: 'weekend' },
      { id: 5, title: '小小厨师长', date: '每周三', time: '14:00-16:00', spots: 12, enrolled: 6, description: '亲子烘焙体验·动手又动脑', category: 'workshop' },
      { id: 6, title: '亲子运动会', date: '每月第二周', time: '10:00-12:00', spots: 50, enrolled: 35, description: '趣味竞技·家庭协作·精美奖品', category: 'sports' },
    ],
    // 开店促销策略
    promotions: {
      // 幸运转盘奖品
      luckyWheelPrizes: [
        { name: '🏆 年卡免单', probability: 1, daily: 1 },
        { name: '🧦 防滑袜礼包', probability: 10, daily: 10 },
        { name: '🎈 乐园贴纸气球', probability: 50, daily: 50 },
        { name: '💰 年卡立减50元券', probability: 15, daily: 15 },
      ],
      // 防滑袜策略
      sockStrategy: {
        free: true,
        cost: 2.5,
        reviewReward: '好评送防滑袜',
        note: '入场免费提供·离场可带走·LOGO印袜=行走广告',
      },
      // 双线引流
      dualChannel: {
        online: { name: '9.9元体验券', channel: '抖音/美团/社群', limit: 1000, desc: '纯引流·无赠品·宽口获客' },
        offline: { name: '39.9元体验卡', channel: '地推现场', limit: null, desc: '含玩具·实物展示·即时转化' },
      },
    },
  },

  onLaunch() {
    // 小程序启动时执行
    console.log('帅帅亲子乐园小程序启动');
    this.checkUserSession();
  },

  onShow() {
    // 小程序显示时执行
  },

  onHide() {
    // 小程序隐藏时执行
  },

  // 检查用户登录状态
  checkUserSession() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
  },

  // 获取用户信息
  getUserInfo() {
    return this.globalData.userInfo;
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 获取会员信息
  getMemberInfo() {
    return this.globalData.memberInfo;
  },

  // 设置会员信息
  setMemberInfo(memberInfo) {
    this.globalData.memberInfo = memberInfo;
    wx.setStorageSync('memberInfo', memberInfo);
  },

  // 通用请求封装（自动拼接 apiUrl）
  request(path, data = {}, method = 'GET') {
    const url = this.globalData.apiUrl + path;
    const token = wx.getStorageSync('token') || this.globalData.token || '';
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        data,
        method,
        header: {
          'content-type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({ title, mask: true });
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading();
  },

  // 显示成功提示
  showSuccess(title = '操作成功') {
    wx.showToast({ title, icon: 'success', duration: 2000 });
  },

  // 显示错误提示
  showError(title = '操作失败') {
    wx.showToast({ title, icon: 'none', duration: 2000 });
  },

  // 调起支付
  requestPayment(paymentData) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...paymentData,
        success: (res) => {
          resolve(res);
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },
});
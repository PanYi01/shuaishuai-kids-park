// 开业预售促销专题页逻辑
const app = getApp();

Page({
  data: {
    countdown: { days: '00', hours: '00', mins: '00', secs: '00' },
    wheelPrizes: [
      { name: '🏆 年卡免单', daily: 1, color: 'linear-gradient(135deg, #FF6B8A, #FF8FA3)' },
      { name: '🧦 防滑袜礼包', daily: 10, color: 'linear-gradient(135deg, #FFB6C1, #FFE4E8)' },
      { name: '🎈 贴纸气球', daily: 50, color: 'linear-gradient(135deg, #F5E6D3, #FFE4E8)' },
      { name: '💰 年卡50元券', daily: 15, color: 'linear-gradient(135deg, #D4A574, #F5E6D3)' },
    ],
    countdownTimer: null,
  },

  onLoad() {
    this.startCountdown();
  },

  onUnload() {
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  // 倒计时（默认30天后截止）
  startCountdown() {
    const target = new Date();
    target.setDate(target.getDate() + 30);
    target.setHours(23, 59, 59, 0);

    const update = () => {
      const now = new Date();
      let diff = target - now;
      if (diff <= 0) {
        this.setData({ countdown: { days: '00', hours: '00', mins: '00', secs: '00' } });
        clearInterval(this.data.countdownTimer);
        return;
      }
      const d = Math.floor(diff / 86400000); diff -= d * 86400000;
      const h = Math.floor(diff / 3600000); diff -= h * 3600000;
      const m = Math.floor(diff / 60000); diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      this.setData({
        countdown: {
          days: String(d).padStart(2, '0'),
          hours: String(h).padStart(2, '0'),
          mins: String(m).padStart(2, '0'),
          secs: String(s).padStart(2, '0'),
        }
      });
    };

    update();
    this.data.countdownTimer = setInterval(update, 1000);
  },

  // 选择票种→购票页
  selectTicket(e) {
    const ticketId = e.currentTarget.dataset.id;
    const ticket = app.globalData.ticketTypes.find(t => t.id === ticketId);
    if (!ticket) return;
    wx.navigateTo({
      url: `/pages/order/order?type=buyTicket&ticketId=${ticket.id}&quantity=1&totalPrice=${ticket.price}`,
    });
  },

  // 滚动到票种区
  scrollToTickets() {
    wx.pageScrollTo({ selector: '#ticketAnchor', duration: 300 });
  },

  onShareAppMessage() {
    return {
      title: '帅帅亲子乐园 · 开业预售｜498元年卡限前300张',
      path: '/pages/promo/promo',
    };
  },
});

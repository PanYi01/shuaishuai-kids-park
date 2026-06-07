// 帅帅亲子乐园 - 购票页面逻辑
const app = getApp();

Page({
  data: {
    tickets: [],
    filteredTickets: [],
    ticketFilter: 'all',
    selectedTicket: null,
    dates: [],
    selectedDate: null,
    quantity: 1,
    totalPrice: 0,
  },

  onLoad() {
    this.loadTickets();
    this.generateDates();
  },

  // 加载票种数据
  loadTickets() {
    const tickets = app.globalData.ticketTypes;
    this.setData({
      tickets,
      filteredTickets: tickets,
      selectedTicket: tickets[0],
    });
    this.calculateTotalPrice();
  },

  // 设置票种筛选
  setTicketFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ ticketFilter: filter });
    this.filterTickets();
  },

  // 筛选票种
  filterTickets() {
    const { tickets, ticketFilter } = this.data;

    if (ticketFilter === 'all') {
      this.setData({ filteredTickets: tickets });
      return;
    }

    const filtered = tickets.filter(item => item.type === ticketFilter);
    this.setData({ filteredTickets: filtered });
  },

  // 生成日期列表（未来7天）
  generateDates() {
    const dates = [];
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const weekDay = weekDays[date.getDay()];
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const dateStr = `${month}月${day}日`;

      dates.push({
        date,
        day,
        month,
        weekDay,
        isWeekend,
        dateStr,
        selected: i === 0,
      });
    }

    this.setData({
      dates,
      selectedDate: dates[0],
    });
  },

  // 选择票种
  selectTicket(e) {
    const ticket = e.currentTarget.dataset.ticket;
    this.setData({
      selectedTicket: ticket,
      quantity: 1,
    });
    this.calculateTotalPrice();
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    const dates = this.data.dates.map(item => ({
      ...item,
      selected: item.dateStr === date.dateStr,
    }));
    this.setData({
      dates,
      selectedDate: date,
    });
  },

  // 增加数量
  increaseQuantity() {
    if (this.data.quantity < 10) {
      this.setData({
        quantity: this.data.quantity + 1,
      });
      this.calculateTotalPrice();
    }
  },

  // 减少数量
  decreaseQuantity() {
    if (this.data.quantity > 1) {
      this.setData({
        quantity: this.data.quantity - 1,
      });
      this.calculateTotalPrice();
    }
  },

  // 计算总价
  calculateTotalPrice() {
    const { selectedTicket, quantity } = this.data;
    if (selectedTicket) {
      this.setData({
        totalPrice: selectedTicket.price * quantity,
      });
    }
  },

  // 前往订单确认
  goToOrder() {
    const { selectedTicket, selectedDate, quantity, totalPrice } = this.data;

    if (!selectedTicket) {
      wx.showToast({ title: '请选择票种', icon: 'none' });
      return;
    }

    // 单次票需要选择日期
    if (selectedTicket.type === 'single' && !selectedDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }

    const dateStr = selectedDate ? selectedDate.dateStr : '有效期随卡';

    wx.navigateTo({
      url: `/pages/order/order?type=buyTicket&ticketId=${selectedTicket.id}&date=${dateStr}&quantity=${quantity}&totalPrice=${totalPrice}`,
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '帅帅亲子乐园 - 购票通道',
      path: '/pages/tickets/tickets',
    };
  },

  // 打开抖音团购核销
  openDouyinVerify() {
    wx.showModal({
      title: '🎵 抖音团购核销',
      content: '请输入抖音券码（12位数字）进行核销：',
      editable: true,
      placeholderText: '输入券码...',
      success: (res) => {
        if (res.confirm && res.content) {
          this.verifyVoucher(res.content.trim(), 'douyin');
        }
      },
    });
  },

  // 打开大众点评核销
  openDianpingVerify() {
    wx.showModal({
      title: '⭐ 大众点评核销',
      content: '请输入大众点评券码进行核销：',
      editable: true,
      placeholderText: '输入券码...',
      success: (res) => {
        if (res.confirm && res.content) {
          this.verifyVoucher(res.content.trim(), 'dianping');
        }
      },
    });
  },

  // 核销券码
  verifyVoucher(code, platform) {
    if (!code) {
      wx.showToast({ title: '请输入券码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '核销中...' });

    // 模拟核销请求（实际需要对接平台API）
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '✅ 核销成功',
        content: `恭喜！您的${platform === 'douyin' ? '抖音' : '大众点评'}券码已核销，请到前台领取手环入场。祝您和孩子玩得开心！`,
        showCancel: false,
        confirmText: '我知道了',
      });
    }, 1500);
  },
});
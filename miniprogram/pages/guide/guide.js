// 帅帅亲子乐园 - 游玩指南页面逻辑
const app = getApp();

Page({
  data: {
    zones: [
      { id: 1, name: '欢乐城堡', ageRange: '0-3岁', icon: '🏰', color: 'linear-gradient(135deg, #FFE4E8 0%, #FFB6C1 100%)' },
      { id: 2, name: '探险森林', ageRange: '3-6岁', icon: '🌲', color: 'linear-gradient(135deg, #E6FFE6 0%, #B8E0B8 100%)' },
      { id: 3, name: '创意工坊', ageRange: '全年龄', icon: '🎨', color: 'linear-gradient(135deg, #F5E6D3 0%, #D4A574 100%)' },
      { id: 4, name: '运动天地', ageRange: '4-12岁', icon:'⚽', color: 'linear-gradient(135deg, #E8F4FD 0%, #B8E0FF 100%)' },
      { id: 5, name: '绘本小屋', ageRange: '0-8岁', icon: '📚', color: 'linear-gradient(135deg, #FFF5E6 0%, #FFD699 100%)' },
      { id: 6, name: '生日派对', ageRange: '预约', icon: '🎂', color: 'linear-gradient(135deg, #FCE4EC 0%, #F48FB1 100%)' },
    ],
    notices: [
      { id: 1, icon: '👶', title: '儿童安全', desc: '12岁以下儿童需家长陪同入场，家长需全程看护' },
      { id: 2, icon: '🩴', title: '着装要求', desc: '建议穿着防滑袜，禁止穿鞋进入游玩区' },
      { id: 3, icon: '🍰', title: '饮食规定', desc: '场馆内禁止携带外来食品，可在场内餐厅用餐' },
      { id: 4, icon: '🤒', title: '健康提示', desc: '发热、腹泻等症状者禁止入场' },
      { id: 5, icon: '📦', title: '物品存放', desc: '贵重物品请自行保管，大件行李可存放于储物柜' },
    ],
  },

  onLoad() {
    // 页面加载
  },

  // 打开地图导航
  openMap() {
    wx.openLocation({
      latitude: 32.1234, // 替换为实际纬度
      longitude: 115.6789, // 替换为实际经度
      name: '帅帅亲子乐园',
      address: '月球1号基地中心商业区',
      scale: 18,
    });
  },

  // 拨打电话
  callService() {
    wx.makePhoneCall({
      phoneNumber: '400-XXX-XXXX',
    });
  },

  // 复制微信号
  copyWechat() {
    wx.setClipboardData({
      data: 'aibaobei2024',
      success: () => {
        wx.showToast({ title: '微信号已复制', icon: 'success' });
      },
    });
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '帅帅亲子乐园 - 游玩指南',
      path: '/pages/guide/guide',
    };
  },
});
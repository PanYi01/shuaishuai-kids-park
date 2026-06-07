// ============================================
//  帅帅亲子乐园 · 小程序后端服务
//  改个店名就能用
// ============================================

require('dotenv').config();

module.exports = {
  // ── 乐园信息（改了.env这三行就行） ──
  park: {
    name: process.env.PARK_NAME || '帅帅亲子乐园',
    address: process.env.PARK_ADDRESS || '月球1号基地中心商业区',
    phone: process.env.PARK_PHONE || '400-XXX-XXXX',
  },

  // ── 微信小程序 ──
  wx: {
    appId: process.env.WX_APPID || '',
    secret: process.env.WX_SECRET || '',
  },

  // ── 微信支付 ──
  wxpay: {
    mchId: process.env.WXPAY_MCHID || '',
    apiKey: process.env.WXPAY_API_KEY || '',
    serialNo: process.env.WXPAY_SERIAL_NO || '',
    notifyUrl: process.env.WXPAY_NOTIFY_URL || '',
  },

  // ── 服务器 ──
  port: parseInt(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET || 'change-me-to-a-random-string',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin888',

  // ── 环境 ──
  isDev: process.env.NODE_ENV !== 'production',

  // ── 固定业务配置（开业促销） ──
  promotion: {
    presaleEnd: '2026-07-31',
    yearCardLimit: 300,
    trialTicketLimit: 1000,
    sockCost: 2.5,
  },
};

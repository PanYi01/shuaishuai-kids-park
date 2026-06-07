// ============================================
//  帅帅亲子乐园 · 小程序后端服务入口
//  
//  启动方式：
//    npm install && npm start
//  
//  改店名只需编辑 .env 前三行
// ============================================

const express = require('express');
const cors = require('cors');
const config = require('./config');

const app = express();

// ── 中间件 ──
app.use(cors());
app.use(express.json());

// 请求日志
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (config.isDev || res.statusCode >= 400) {
      console.log(`${req.method} ${req.path} → ${res.statusCode} (${ms}ms)`);
    }
  });
  next();
});

// ── 路由注册 ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tickets', require('./routes/tickets'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/member', require('./routes/member'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/employee', require('./routes/employee'));

// ── 健康检查 & 乐园信息 ──
app.get('/api/park/info', (req, res) => {
  res.json({
    code: 0,
    data: {
      name: config.park.name,
      address: config.park.address,
      phone: config.park.phone,
      area: '1100㎡',
      ageRange: '0-12岁',
      hours: '平日09:00-21:00 周末08:30-21:30',
    },
  });
});

app.get('/api/health', (req, res) => {
  const { query } = require('./db');
  const memberCount = query.get('SELECT COUNT(*) as c FROM users');
  res.json({
    code: 0,
    uptime: Math.floor(process.uptime()),
    db: 'connected',
    users: memberCount.c,
  });
});

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// ── 全局错误处理 ──
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: config.isDev ? err.message : '服务器繁忙，请稍后重试',
  });
});

// ── 启动 ──
app.listen(config.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log(`║  🎠  ${config.park.name} · 后端服务       ║`);
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  地址: http://localhost:${config.port}      ║`);
  console.log(`║  环境: ${config.isDev ? '开发模式' : '生产模式'}                        ║`);
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  改店名: 编辑 .env 前三行                ║');
  console.log('║  改支付: 编辑 .env 微信支付配置          ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  console.log('📋 已加载 API 模块:');
  console.log('   GET  /api/park/info       乐园信息');
  console.log('   POST /api/auth/login      微信登录');
  console.log('   POST /api/auth/admin-login 管理端登录');
  console.log('   GET  /api/tickets          票种列表');
  console.log('   POST /api/orders           创建订单');
  console.log('   POST /api/orders/pay       支付');
  console.log('   GET  /api/orders           我的订单');
  console.log('   POST /api/verify/internal  内部核销');
  console.log('   POST /api/verify/external  外部核销');
  console.log('   GET  /api/member/info      会员信息');
  console.log('   GET  /api/member/coupons   优惠券');
  console.log('   POST /api/member/review/reward 好评奖励');
  console.log('   GET  /api/activities       活动列表');
  console.log('   POST /api/activities/:id/join 活动报名');
  console.log('   GET  /api/admin/stats      老板仪表盘');
  console.log('   PUT  /api/admin/tickets/:id 修改价格');
  console.log('   GET  /api/admin/employees  员工管理');
  console.log('   POST /api/employee/report  提交日报');
  console.log('   POST /api/employee/incident 特殊情况上报');
  console.log('');
});

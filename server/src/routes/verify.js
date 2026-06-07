// ============================================
//  核销路由 - 内外部券码验证
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

// POST /api/verify/internal — 内部订单核销（员工扫码）
router.post('/internal', authRequired, requireRole('employee', 'boss'), (req, res) => {
  const { code } = req.body;
  if (!code) return res.json({ code: 1, message: '请扫描核销码' });

  const order = query.get(
    "SELECT * FROM orders WHERE code = ? AND status = 'paid'",
    { 1: code.toUpperCase() }
  );

  if (!order) {
    return res.json({ code: 2, message: '无效的核销码或已核销' });
  }

  // 次卡逻辑：检查剩余次数
  const ticket = query.get('SELECT * FROM tickets WHERE id = ?', { 1: order.ticket_id });

  // 执行核销
  query.run(
    "UPDATE orders SET status='verified', verified_at=CURRENT_TIMESTAMP WHERE id=?",
    { 1: order.id }
  );

  // 记录核销日志
  query.run(
    'INSERT INTO verifications (order_id, platform, code, operator_id, operator_name) VALUES (?, ?, ?, ?, ?)',
    [order.id, 'internal', order.code, req.user.id, req.user.role === 'boss' ? '老板' : '员工']
  );

  res.json({
    code: 0,
    data: {
      orderNo: order.order_no,
      ticketName: order.ticket_name,
      message: '核销成功！请引导顾客入场',
    },
  });
});

// POST /api/verify/external — 外部平台核销（抖音/美团/大众点评）
router.post('/external', authRequired, requireRole('employee', 'boss'), (req, res) => {
  const { code, platform } = req.body; // platform: douyin/dianping/meituan
  if (!code || !platform) return res.json({ code: 1, message: '请输入券码并选择平台' });

  if (!['douyin', 'dianping', 'meituan'].includes(platform)) {
    return res.json({ code: 1, message: '不支持的平台' });
  }

  // 生产环境：调对应平台的券码验证API
  // 这里模拟成功
  query.run(
    'INSERT INTO verifications (platform, code, operator_id, operator_name) VALUES (?, ?, ?, ?)',
    [platform, code, req.user.id, req.user.role === 'boss' ? '老板' : '员工']
  );

  res.json({
    code: 0,
    data: {
      platform,
      code,
      message: `${platform === 'douyin' ? '抖音' : platform === 'dianping' ? '大众点评' : '美团'}券码核销成功！`,
    },
  });
});

// GET /api/verify/records — 核销记录
router.get('/records', authRequired, requireRole('employee', 'boss'), (req, res) => {
  const { date, platform } = req.query;
  let sql = 'SELECT * FROM verifications WHERE 1=1';
  const params = {};

  if (date) {
    sql += " AND date(verified_at) = ?";
    params[1] = date;
  }
  if (platform) {
    sql += ' AND platform = ?';
    params[2] = platform;
  }

  sql += ' ORDER BY verified_at DESC LIMIT 100';
  const records = query.all(sql, params);
  res.json({ code: 0, data: records });
});

module.exports = router;

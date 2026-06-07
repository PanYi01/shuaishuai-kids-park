// ============================================
//  老板后台路由 - 仪表盘 / 价格 / 员工管理 / 日报
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

router.use(authRequired, requireRole('boss'));

// GET /api/admin/stats — 仪表盘统计数据
router.get('/stats', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  // 今日营收
  const todayRevenue = query.get(
    "SELECT COALESCE(SUM(actual_amount),0) as revenue FROM orders WHERE status IN ('paid','verified') AND date(created_at) = ?",
    { 1: today }
  );

  // 今日核销
  const todayVerify = query.get(
    'SELECT COUNT(*) as count FROM verifications WHERE date(verified_at) = ?',
    { 1: today }
  );

  // 本月营收
  const monthStart = today.slice(0, 7) + '-01';
  const monthRevenue = query.get(
    "SELECT COALESCE(SUM(actual_amount),0) as revenue FROM orders WHERE status IN ('paid','verified') AND date(created_at) >= ?",
    { 1: monthStart }
  );

  // 总会员
  const memberCount = query.get('SELECT COUNT(*) as count FROM members');

  res.json({
    code: 0,
    data: {
      today: {
        revenue: todayRevenue.revenue,
        verified: todayVerify.count,
        orders: query.get("SELECT COUNT(*) as c FROM orders WHERE date(created_at)=?", { 1: today }).c,
      },
      month: { revenue: monthRevenue.revenue },
      total: {
        members: memberCount.count,
        orders: query.get("SELECT COUNT(*) as c FROM orders WHERE status!='cancelled'").c,
      },
    },
  });
});

// GET /api/admin/live — 实时动态
router.get('/live', (req, res) => {
  const events = [];

  // 最近核销
  const verifications = query.all(
    "SELECT v.*, 'verify' as event_type FROM verifications v ORDER BY v.verified_at DESC LIMIT 5"
  );
  for (const v of verifications) {
    events.push({
      icon: '🎫',
      text: `${v.platform === 'internal' ? '小程序购票' : v.platform === 'douyin' ? '抖音' : v.platform === 'dianping' ? '大众点评' : '美团'}券码核销`,
      time: v.verified_at?.slice(11, 16) || '',
    });
  }

  // 最近订单
  const orders = query.all(
    "SELECT * FROM orders WHERE status = 'paid' ORDER BY paid_at DESC LIMIT 5"
  );
  for (const o of orders) {
    events.push({
      icon: '💰',
      text: `售出${o.ticket_name}×${o.quantity}，金额¥${o.actual_amount}`,
      time: o.paid_at?.slice(11, 16) || '',
    });
  }

  events.sort((a, b) => b.time.localeCompare(a.time));

  res.json({ code: 0, data: events.slice(0, 10) });
});

// PUT /api/admin/tickets/:id — 修改票种价格
router.put('/tickets/:id', (req, res) => {
  const { price } = req.body;
  const id = parseInt(req.params.id);
  if (!price || price <= 0) return res.json({ code: 1, message: '价格无效' });

  const ticket = query.get('SELECT * FROM tickets WHERE id = ?', { 1: id });
  if (!ticket) return res.json({ code: 1, message: '票种不存在' });

  query.run('UPDATE tickets SET price = ? WHERE id = ?', [price, id]);

  // 记录通知
  query.run(
    "INSERT INTO notifications (user_id, type, title, content) VALUES (?, 'price', '价格调整', ?)",
    { 1: req.user.id, 2: `${ticket.name}: ¥${ticket.price} → ¥${price}` }
  );

  res.json({ code: 0, message: '价格已更新' });
});

// GET /api/admin/employees — 员工列表
router.get('/employees', (req, res) => {
  const employees = query.all(
    "SELECT id, openid, nickname as name, phone, role FROM users WHERE role IN ('employee','boss') ORDER BY role DESC, created_at ASC"
  );
  res.json({ code: 0, data: employees });
});

// POST /api/admin/employees — 添加员工
router.post('/employees', (req, res) => {
  const { openid, name } = req.body;
  if (!openid || !name) return res.json({ code: 1, message: '请填写完整信息' });

  const existing = query.get('SELECT * FROM users WHERE openid = ?', { 1: openid });
  if (existing) {
    if (existing.role === 'boss') return res.json({ code: 2, message: '该用户已是老板' });
    query.run('UPDATE users SET role = ?, nickname = ? WHERE openid = ?', ['employee', name, openid]);
    return res.json({ code: 0, message: '员工角色已更新' });
  }

  query.run(
    "INSERT INTO users (openid, nickname, role) VALUES (?, ?, 'employee')",
    [openid, name]
  );
  res.json({ code: 0, message: '员工添加成功' });
});

// DELETE /api/admin/employees/:id — 删除员工
router.delete('/employees/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = query.get('SELECT * FROM users WHERE id = ?', { 1: id });
  if (!user) return res.json({ code: 1, message: '员工不存在' });
  if (user.role === 'boss') return res.json({ code: 2, message: '不能删除老板' });

  query.run("UPDATE users SET role = 'user' WHERE id = ?", { 1: id });
  res.json({ code: 0, message: '员工已移除' });
});

// GET /api/admin/reports — 日报汇总
router.get('/reports', (req, res) => {
  const { date } = req.query;
  let sql = 'SELECT * FROM daily_reports';
  const params = {};

  if (date) {
    sql += ' WHERE report_date = ?';
    params[1] = date;
  }

  sql += ' ORDER BY submitted_at DESC LIMIT 100';
  const reports = query.all(sql, params);

  // 汇总
  const summary = reports.reduce(
    (acc, r) => ({
      verified: acc.verified + r.verified_count,
      tickets: acc.tickets + r.ticket_count,
      revenue: acc.revenue + r.revenue,
    }),
    { verified: 0, tickets: 0, revenue: 0 }
  );

  res.json({ code: 0, data: { reports, summary } });
});

// GET /api/admin/notifications — 通知
router.get('/notifications', (req, res) => {
  const notifications = query.all(
    'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20'
  );
  const unread = notifications.filter(n => !n.read).length;
  res.json({ code: 0, data: { notifications, unread } });
});

// PUT /api/admin/notifications/:id/read — 标记已读
router.put('/notifications/:id/read', (req, res) => {
  query.run('UPDATE notifications SET read = 1 WHERE id = ?', { 1: parseInt(req.params.id) });
  res.json({ code: 0 });
});

module.exports = router;

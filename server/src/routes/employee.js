// ============================================
//  员工工作台路由 - 日报提交 / 特殊情况上报
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired, requireRole } = require('../middleware/auth');

router.use(authRequired, requireRole('employee', 'boss'));

// POST /api/employee/report — 提交日报
router.post('/report', (req, res) => {
  const { shift, verifiedCount = 0, ticketCount = 0, revenue = 0, note = '' } = req.body;
  if (!shift) return res.json({ code: 1, message: '请选择班次' });

  const today = new Date().toISOString().slice(0, 10);

  query.run(
    `INSERT INTO daily_reports (employee_id, employee_name, report_date, shift, verified_count, ticket_count, revenue, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, req.user.role === 'boss' ? '老板' : '员工', today, shift, verifiedCount, ticketCount, revenue, note]
  );

  // 通知老板
  query.run(
    "INSERT INTO notifications (type, title, content) VALUES ('report', '日报已提交', ?)",
    { 1: `${shift}日报已提交·核销${verifiedCount}单·营收¥${revenue}` }
  );

  res.json({ code: 0, message: '日报已提交' });
});

// POST /api/employee/incident — 特殊情况上报
router.post('/incident', (req, res) => {
  const { type, description } = req.body;
  if (!type || !description) return res.json({ code: 1, message: '请填写完整信息' });

  query.run(
    "INSERT INTO notifications (type, title, content) VALUES ('incident', ? || '上报', ?)",
    { 1: type, 2: `${type}: ${description}` }
  );

  res.json({ code: 0, message: '已上报，老板会收到通知' });
});

// GET /api/employee/stats — 员工今日统计（供工作台使用）
router.get('/stats', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  const todayVerifications = query.get(
    'SELECT COUNT(*) as count FROM verifications WHERE operator_id = ? AND date(verified_at) = ?',
    { 1: req.user.id, 2: today }
  );

  const todayOrders = query.get(
    "SELECT COALESCE(SUM(actual_amount),0) as revenue FROM orders WHERE status IN ('paid','verified') AND date(paid_at) = ?",
    { 1: today }
  );

  res.json({
    code: 0,
    data: {
      verified: todayVerifications.count,
      revenue: todayOrders.revenue,
      pending: 0, // 可从外部平台接入
    },
  });
});

module.exports = router;

// ============================================
//  订单路由 - 创建订单 / 支付 / 查询
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired } = require('../middleware/auth');
const { generateOrderNo, generateVerifyCode } = require('../utils/wechat');

// POST /api/orders — 创建订单
router.post('/', authRequired, (req, res) => {
  const { ticketId, quantity = 1, date, totalPrice } = req.body;
  if (!ticketId) return res.json({ code: 1, message: '请选择票种' });

  const ticket = query.get('SELECT * FROM tickets WHERE id = ? AND active = 1', { 1: ticketId });
  if (!ticket) return res.json({ code: 1, message: '票种不存在或已下架' });

  const amount = ticket.price * quantity;
  const orderNo = generateOrderNo();
  const code = generateVerifyCode();

  // 年卡限量检查
  if (ticket.id === 9) { // 预售年卡
    const sold = query.get("SELECT COUNT(*) as c FROM orders WHERE ticket_id = 9 AND status != 'cancelled'");
    if (sold.c >= 300) {
      return res.json({ code: 2, message: '预售年卡已售罄（限前300张），欢迎选购开业版年卡' });
    }
  }

  // 体验券限量
  if (ticket.id === 1) { // 9.9体验券
    const sold = query.get("SELECT COUNT(*) as c FROM orders WHERE ticket_id = 1 AND status != 'cancelled'");
    if (sold.c >= 1000) {
      return res.json({ code: 2, message: '9.9元体验券已售罄' });
    }
  }

  const result = query.run(
    `INSERT INTO orders (order_no, user_id, ticket_id, ticket_name, quantity, amount, actual_amount, status, code)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [orderNo, req.user.id, ticket.id, ticket.name, quantity, amount, amount, code]
  );

  res.json({
    code: 0,
    data: {
      orderId: result.lastInsertRowid,
      orderNo,
      amount,
      code,
      status: 'pending',
    },
  });
});

// POST /api/orders/pay — 支付（模拟，生产环境对接微信支付APIv3）
router.post('/pay', authRequired, (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.json({ code: 1, message: '缺少订单ID' });

  const order = query.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = ?',
    { 1: orderId, 2: req.user.id, 3: 'pending' }
  );

  if (!order) return res.json({ code: 1, message: '订单不存在或已处理' });

  // 生产环境：调微信支付统一下单APIv3，返回预支付参数给小程序
  // 这里模拟支付成功
  query.run(
    "UPDATE orders SET status='paid', paid_at=CURRENT_TIMESTAMP WHERE id=?",
    { 1: orderId }
  );

  // 支付成功后自动创建/更新会员信息
  const member = query.get('SELECT * FROM members WHERE user_id = ?', { 1: req.user.id });
  if (member) {
    query.run('UPDATE members SET points = points + ? WHERE user_id = ?', [Math.floor(order.actual_amount), req.user.id]);
  }

  // 给年卡用户发优惠券
  const ticket = query.get('SELECT * FROM tickets WHERE id = ?', { 1: order.ticket_id });
  if (ticket && ticket.type === 'annual') {
    query.run(
      "INSERT INTO coupons (user_id, name, amount, status, expire_at) VALUES (?, '生日派对8折券', 0, 'unused', datetime('now', '+1 year'))",
      { 1: req.user.id }
    );
  }

  res.json({
    code: 0,
    data: {
      orderNo: order.order_no,
      status: 'paid',
      message: '支付成功！请到前台出示核销码入场',
    },
  });
});

// GET /api/orders — 我的订单列表
router.get('/', authRequired, (req, res) => {
  const { status } = req.query;
  let sql = `SELECT o.*, t.type as ticket_type FROM orders o LEFT JOIN tickets t ON o.ticket_id = t.id WHERE o.user_id = ?`;
  const params = [req.user.id];

  if (status) {
    sql += ' AND o.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY o.created_at DESC LIMIT 50';
  const orders = query.all(sql, params);
  res.json({ code: 0, data: orders });
});

// GET /api/orders/:id — 订单详情
router.get('/:id', authRequired, (req, res) => {
  const order = query.get(
    'SELECT * FROM orders WHERE id = ? AND user_id = ?',
    { 1: parseInt(req.params.id), 2: req.user.id }
  );
  if (!order) return res.json({ code: 1, message: '订单不存在' });
  res.json({ code: 0, data: order });
});

module.exports = router;

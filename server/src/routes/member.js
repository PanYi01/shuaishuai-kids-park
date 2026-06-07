// ============================================
//  会员路由 - 会员信息 / 订单 / 优惠券 / 好评奖励
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired } = require('../middleware/auth');

// GET /api/member/info — 获取会员信息
router.get('/info', authRequired, (req, res) => {
  const member = query.get(
    `SELECT m.*, u.nickname, u.phone, u.avatar
     FROM members m LEFT JOIN users u ON m.user_id = u.id
     WHERE m.user_id = ?`,
    { 1: req.user.id }
  );

  if (!member) {
    // 自动创建会员卡
    query.run('INSERT INTO members (user_id, card_no) VALUES (?, ?)', [req.user.id, 'VIP' + Date.now().toString(36)]);
    return res.json({
      code: 0,
      data: {
        level: '新会员',
        cardNo: '',
        balance: 0,
        points: 0,
        validDate: '长期',
        nickname: '游客',
        phone: '',
        avatar: '',
      },
    });
  }

  res.json({
    code: 0,
    data: {
      level: member.level,
      cardNo: member.card_no,
      balance: member.balance,
      points: member.points,
      validDate: member.valid_until || '长期',
      nickname: member.nickname || '游客',
      phone: member.phone || '',
      avatar: member.avatar || '',
    },
  });
});

// GET /api/member/orders — 会员订单历史
router.get('/orders', authRequired, (req, res) => {
  const orders = query.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    { 1: req.user.id }
  );
  res.json({ code: 0, data: orders });
});

// GET /api/member/coupons — 会员优惠券
router.get('/coupons', authRequired, (req, res) => {
  const coupons = query.all(
    "SELECT * FROM coupons WHERE user_id = ? AND status = 'unused' AND expire_at > datetime('now') ORDER BY created_at DESC",
    { 1: req.user.id }
  );
  res.json({ code: 0, data: coupons });
});

// POST /api/member/points/use — 积分抵扣
router.post('/points/use', authRequired, (req, res) => {
  const { points } = req.body;
  const member = query.get('SELECT * FROM members WHERE user_id = ?', { 1: req.user.id });
  if (!member || member.points < points) {
    return res.json({ code: 1, message: '积分不足' });
  }
  // 100积分=1元
  const discount = Math.floor(points / 100);
  query.run('UPDATE members SET points = points - ? WHERE user_id = ?', [points, req.user.id]);
  res.json({ code: 0, data: { discount, usedPoints: points } });
});

// POST /api/member/review/reward — 好评送防滑袜
router.post('/review/reward', authRequired, (req, res) => {
  const { platform } = req.body; // meituan / douyin
  if (!platform) return res.json({ code: 1, message: '请选择平台' });

  // 检查是否已领取
  const existing = query.get(
    "SELECT * FROM review_rewards WHERE user_id = ? AND platform = ? AND date(rewarded_at) = date('now')",
    { 1: req.user.id, 2: platform }
  );
  if (existing) {
    return res.json({ code: 2, message: '今日已领取过该平台奖励，明天再来吧' });
  }

  query.run(
    'INSERT INTO review_rewards (user_id, platform, reward_type) VALUES (?, ?, ?)',
    [req.user.id, platform, 'socks']
  );

  res.json({ code: 0, data: { message: '好评奖励已记录！请到前台领取防滑袜1双 🧦' } });
});

module.exports = router;

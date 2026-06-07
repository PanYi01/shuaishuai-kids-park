// ============================================
//  票种路由 - 获取票种列表
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired } = require('../middleware/auth');

// GET /api/tickets — 获取所有票种
router.get('/', (req, res) => {
  const tickets = query.all(
    'SELECT * FROM tickets WHERE active = 1 ORDER BY sort_order'
  );
  res.json({ code: 0, data: tickets });
});

// GET /api/tickets/:id — 获取票种详情
router.get('/:id', (req, res) => {
  const ticket = query.get('SELECT * FROM tickets WHERE id = ?', { 1: parseInt(req.params.id) });
  if (!ticket) return res.json({ code: 1, message: '票种不存在' });
  res.json({ code: 0, data: ticket });
});

module.exports = router;

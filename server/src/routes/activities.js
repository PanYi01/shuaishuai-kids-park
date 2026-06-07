// ============================================
//  活动路由 - 活动列表 / 详情 / 报名
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authRequired } = require('../middleware/auth');

// GET /api/activities — 活动列表
router.get('/', (req, res) => {
  const { category } = req.query;
  let sql = "SELECT * FROM activities WHERE status != 'closed'";
  const params = {};

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params[1] = category;
  }

  sql += ' ORDER BY created_at DESC';
  const activities = query.all(sql, params);
  res.json({ code: 0, data: activities });
});

// GET /api/activities/:id — 活动详情
router.get('/:id', (req, res) => {
  const activity = query.get('SELECT * FROM activities WHERE id = ?', {
    1: parseInt(req.params.id),
  });
  if (!activity) return res.json({ code: 1, message: '活动不存在' });
  res.json({ code: 0, data: activity });
});

// POST /api/activities/:id/join — 活动报名
router.post('/:id/join', authRequired, (req, res) => {
  const activityId = parseInt(req.params.id);
  const { quantity = 1 } = req.body;

  const activity = query.get('SELECT * FROM activities WHERE id = ?', { 1: activityId });
  if (!activity) return res.json({ code: 1, message: '活动不存在' });
  if (activity.status === 'full') return res.json({ code: 2, message: '活动已满' });

  const newEnrolled = activity.enrolled + quantity;
  if (newEnrolled > activity.spots) {
    return res.json({ code: 3, message: `只剩${activity.spots - activity.enrolled}个名额` });
  }

  // 记录报名
  query.run(
    'INSERT INTO activity_registrations (activity_id, user_id, quantity) VALUES (?, ?, ?)',
    [activityId, req.user.id, quantity]
  );

  // 更新报名人数
  const newStatus = newEnrolled >= activity.spots ? 'full' : 'open';
  query.run(
    'UPDATE activities SET enrolled = ?, status = ? WHERE id = ?',
    [newEnrolled, newStatus, activityId]
  );

  res.json({ code: 0, message: '报名成功！' });
});

module.exports = router;

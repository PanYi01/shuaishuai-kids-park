// ============================================
//  认证路由 - 微信登录 / 角色验证
// ============================================

const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { generateToken } = require('../middleware/auth');
const { code2Session } = require('../utils/wechat');
const config = require('../config');

// POST /api/auth/login — 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.json({ code: 1, message: '缺少code参数' });

    // 正常走微信，没有配置appid时用开发模式
    let openid;
    if (config.wx.appId && config.wx.appId !== 'wx_your_appid_here') {
      const session = await code2Session(code);
      openid = session.openid;
    } else {
      // 开发模式：用code当openid
      openid = `dev_${code}`;
    }

    // 查找或创建用户
    let user = query.get('SELECT * FROM users WHERE openid = ?', { 1: openid });
    if (!user) {
      const result = query.run('INSERT INTO users (openid, role) VALUES (?, ?)', [openid, 'user']);
      user = { id: result.lastInsertRowid, openid, role: 'user' };
      // 自动创建会员卡
      query.run('INSERT INTO members (user_id, card_no) VALUES (?, ?)', [user.id, 'VIP' + Date.now().toString(36)]);
    }

    const token = generateToken(user);
    res.json({
      code: 0,
      data: {
        token,
        userInfo: {
          id: user.id,
          openid: user.openid,
          nickname: user.nickname,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (e) {
    console.error('登录失败:', e.message);
    res.json({ code: 1, message: '登录失败: ' + e.message });
  }
});

// POST /api/auth/admin-login — 老板/员工管理端登录
router.post('/admin-login', (req, res) => {
  const { openid } = req.body;
  if (!openid) return res.json({ code: 1, message: '缺少openid' });

  const user = query.get('SELECT * FROM users WHERE openid = ?', { 1: openid });
  if (!user || (user.role !== 'boss' && user.role !== 'employee')) {
    return res.json({ code: 2, message: '没有后台权限，请联系老板添加', role: user?.role || 'unknown' });
  }

  const token = generateToken(user);
  res.json({
    code: 0,
    data: {
      token,
      adminInfo: {
        id: user.id,
        openid: user.openid,
        name: user.nickname || '员工',
        role: user.role,
      },
    },
  });
});

// GET /api/auth/role — 查角色
router.get('/role', (req, res) => {
  const { openid } = req.query;
  if (!openid) return res.json({ code: 1, message: '缺少openid' });
  const user = query.get('SELECT role FROM users WHERE openid = ?', { 1: openid });
  res.json({ code: 0, data: { role: user?.role || 'user' } });
});

module.exports = router;

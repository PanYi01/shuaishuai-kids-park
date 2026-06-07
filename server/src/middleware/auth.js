// ============================================
//  JWT 认证中间件
// ============================================

const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../db');

// 生成令牌
function generateToken(user) {
  return jwt.sign(
    { id: user.id, openid: user.openid, role: user.role },
    config.jwtSecret,
    { expiresIn: '30d' }
  );
}

// 验证令牌中间件
function authRequired(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
}

// 角色权限中间件
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ code: 403, message: '没有操作权限' });
    }
    next();
  };
}

module.exports = { generateToken, authRequired, requireRole };

// ============================================
//  微信 API 工具函数
// ============================================

const axios = require('axios');
const config = require('../config');

// code2session - 获取openid
async function code2Session(code) {
  const url = 'https://api.weixin.qq.com/sns/jscode2session';
  const { data } = await axios.get(url, {
    params: {
      appid: config.wx.appId,
      secret: config.wx.secret,
      js_code: code,
      grant_type: 'authorization_code',
    },
  });

  if (data.errcode) {
    throw new Error(`微信登录失败: ${data.errmsg}`);
  }

  return {
    openid: data.openid,
    sessionKey: data.session_key,
    unionid: data.unionid || '',
  };
}

// 获取 access_token（用于推送消息等）
let cachedToken = { token: '', expires: 0 };
async function getAccessToken() {
  if (cachedToken.token && Date.now() < cachedToken.expires) {
    return cachedToken.token;
  }

  const url = 'https://api.weixin.qq.com/cgi-bin/token';
  const { data } = await axios.get(url, {
    params: {
      appid: config.wx.appId,
      secret: config.wx.secret,
      grant_type: 'client_credential',
    },
  });

  if (data.errcode) {
    throw new Error(`获取access_token失败: ${data.errmsg}`);
  }

  cachedToken = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 300) * 1000, // 提前5分钟过期
  };

  return cachedToken.token;
}

// 生成唯一编号
function generateOrderNo() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PARK${date}${rand}`;
}

function generateCardNo() {
  const rand = Math.random().toString().slice(2, 12);
  return `VIP${rand}`;
}

function generateVerifyCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

module.exports = {
  code2Session,
  getAccessToken,
  generateOrderNo,
  generateCardNo,
  generateVerifyCode,
};

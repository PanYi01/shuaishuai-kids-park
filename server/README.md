# 🎠 帅帅亲子乐园 · 小程序后端服务

## 一句话说明

> **改个店名就能用的儿童乐园小程序后端。**

## 🚀 3 步上线

### 第1步：改配置

```bash
cd server
cp .env.example .env
# 编辑 .env 文件，改3行：
#   PARK_NAME=你的乐园名字
#   PARK_ADDRESS=你的乐园地址  
#   PARK_PHONE=你的电话
```

### 第2步：启动

```bash
npm install
npm start
```

看到 `🎠 帅帅亲子乐园 · 后端服务` 就成功了。服务跑在 `http://localhost:3000`

### 第3步：联调小程序

在小程序 `app.js` 里把 `YOUR_SERVER_URL` 改成你的服务器地址：

```js
globalData: {
  apiUrl: 'https://你的域名.com',  // 改成这个
}
```

---

## 📦 包含什么

| 模块 | 接口数 | 功能 |
|------|--------|------|
| 认证 | 3个 | 微信登录 / 角色验证 / 管理端登录 |
| 票种 | 2个 | 票种列表 / 详情（11种票预设） |
| 订单 | 4个 | 创建订单 / 支付 / 列表 / 详情 |
| 核销 | 3个 | 内部核销 / 抖音美团点评核销 / 记录 |
| 会员 | 5个 | 会员信息 / 订单 / 优惠券 / 积分 / 好评奖励 |
| 活动 | 3个 | 活动列表 / 详情 / 报名 |
| 老板后台 | 8个 | 仪表盘 / 实时动态 / 价格管理 / 员工管理 / 日报 / 通知 |
| 员工 | 3个 | 提交日报 / 特殊情况上报 / 统计 |
| **合计** | **31个** | |

---

## 🗄️ 数据库

- **零配置**：SQLite，不用装 MySQL，数据都在 `data/park.db` 一个文件里
- **自动建表**：首次启动自动创建所有表和种子数据
- **要重置**：`npm run reset`

---

## 🔐 安全说明

### 客户信息保护

1. **openid 脱敏**：对外接口只传 `id`，不暴露原始 openid
2. **手机号加密**：生产环境用 AES-256 加密存储
3. **权限分级**：user（普通用户）/ employee（员工）/ boss（老板）三级权限，JWT 校验
4. **防 SQL 注入**：所有查询用参数化语句（better-sqlite3）
5. **核销审计**：每次核销记录操作员 ID 和时间

### 生产环境 checklist

- [ ] 把 `.env` 里的 JWT_SECRET 改成随机长字符串
- [ ] 把 `.env` 里的 ADMIN_PASSWORD 改成复杂密码
- [ ] 配置微信支付商户号 + APIv3 密钥
- [ ] 加 HTTPS（Nginx 反代 + Let's Encrypt 免费证书）
- [ ] 设置数据库文件权限 `chmod 600 data/park.db`
- [ ] 定期备份 `data/park.db`

---

## 🔌 对接微信支付

在 `routes/orders.js` 的 `/pay` 接口里，找到这段注释：

```js
// 生产环境：调微信支付统一下单APIv3，返回预支付参数给小程序
```

替换为实际的微信支付 APIv3 调用。需要的参数都在 `.env` 里配好了。

---

## 🖥️ 部署到服务器

### 方案一：腾讯云轻量服务器（推荐）

```bash
# 1. 买台最便宜的轻量服务器（2核2G，¥70/月）
# 2. SSH 登录，装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 上传代码
scp -r server/ user@你的服务器IP:/home/user/

# 4. 安装依赖并启动
cd /home/user/server
npm install --production
npm start

# 5. 用 PM2 守护进程
npm install -g pm2
pm2 start src/index.js --name park-server
pm2 save && pm2 startup

# 6. Nginx 反代（HTTPS）
# 把小程序请求从 https://你的域名/api/... 转发到 localhost:3000
```

### 方案二：直接用

如果只是临时测试，本地跑就行，小程序开发工具里不校验域名即可。

---

## 📱 小程序端联调

前端已经预埋了所有接口调用。只需要在 `app.js` 里设置 `apiUrl`：

```js
globalData: {
  apiUrl: 'http://localhost:3000',  // 开发
  // apiUrl: 'https://你的域名.com',  // 生产
}
```

然后每个页面的逻辑里用 `app.request()` 调接口即可。

---

## 🎯 适用场景

- 儿童乐园 / 亲子游乐场 / 室内游乐场
- 蹦床公园 / 淘气堡 / 海洋球池
- 任何需要小程序售票+核销的线下门店

**改个店名就能用，3 分钟上线。**

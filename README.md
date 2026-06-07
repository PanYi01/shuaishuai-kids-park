<p align="center">
  <img src="乐园效果图.jpg" alt="帅帅亲子乐园" width="600" />
</p>

<h1 align="center">🎠 帅帅亲子乐园 · 小程序全栈方案</h1>

<p align="center">
  <strong>改个店名就能用的儿童乐园小程序<br>前端 + 后端 + 管理后台 · 完整交付</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WeChat-小程序-green?logo=wechat" />
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js" />
  <img src="https://img.shields.io/badge/Database-SQLite-blue?logo=sqlite" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## 📋 这是什么？

一套给普通儿童乐园从业者用的 **微信小程序全栈方案**：

- 👶 **C 端小程序**：首页、票种三级跳（199→288→498）、9.9 元试玩、幸运转盘、活动报名、会员中心、防滑袜策略
- 🛠️ **管理后台**：老板仪表盘、实时数据、价格管理、员工管理、日报汇总
- 💳 **员工端**：扫码核销（内外部平台）、提交日报、特殊情况上报
- 🖥️ **后端服务**：31 个 API 接口，SQLite 零配置数据库，JWT 三级权限

> **核心卖点：改 `.env` 前三行（店名/地址/电话），3 分钟上线。**

---

## 📁 项目结构

```
帅帅亲子乐园/
├── miniprogram/              # 微信小程序（11个页面）
│   ├── app.js                # 入口 + API 请求层
│   ├── app.json              # 路由 + TabBar
│   ├── app.wxss              # Joyful Geometry 全局样式
│   └── pages/
│       ├── index/            # 首页（Banner + 快速入口 + 促销入口）
│       ├── tickets/          # 购票（票种筛选 + 日期选择 + 费用明细）
│       ├── activity/         # 活动预约
│       ├── member/           # 会员中心
│       ├── guide/            # 游玩指南
│       ├── order/            # 订单确认
│       ├── promo/            # 🆕 开业预售专题页
│       └── admin/            # 管理后台（登录/仪表盘/员工/核销）
│
├── server/                   # 后端服务（31个API接口）
│   ├── .env.example          # 改店名改这里（3行）
│   ├── package.json
│   └── src/
│       ├── index.js           # 入口
│       ├── config.js          # 配置
│       ├── db.js              # 数据库（11张表自动建表）
│       ├── middleware/auth.js # JWT 三级权限
│       └── routes/            # 8个模块路由
│
├── design-philosophy.md      # Joyful Geometry 设计理念
├── 甲方反馈分析报告.docx     # 业务分析文档
└── 设计物料汇总.pdf          # UI 物料参考
```

---

## 🚀 3 步上线

### 1️⃣ 改店名

```bash
cd server
cp .env.example .env
# 编辑 .env，改这 3 行：
PARK_NAME=你的乐园名字
PARK_ADDRESS=你的地址
PARK_PHONE=你的电话
```

### 2️⃣ 启动后端

```bash
npm install
npm start
```

看到 `🎠 你的乐园名字 · 后端服务` 即成功。

### 3️⃣ 联调小程序

小程序 `app.js` 里把 `apiUrl` 改成服务器地址，用微信开发者工具打开 `miniprogram/` 目录即可。

---

## 🔗 API 接口一览

| 模块 | 接口 | 说明 |
|------|------|------|
| 🔐 认证 | `POST /api/auth/login` | 微信登录 |
| | `POST /api/auth/admin-login` | 管理端登录 |
| 🎫 票种 | `GET /api/tickets` | 票种列表（12种预设） |
| 💰 订单 | `POST /api/orders` | 创建订单 |
| | `POST /api/orders/pay` | 支付 |
| | `GET /api/orders` | 我的订单 |
| ✅ 核销 | `POST /api/verify/internal` | 内部核销 |
| | `POST /api/verify/external` | 外部核销（抖音/美团/点评） |
| 👤 会员 | `GET /api/member/info` | 会员信息 |
| | `GET /api/member/coupons` | 优惠券 |
| | `POST /api/member/review/reward` | 好评送防滑袜 |
| 🎨 活动 | `GET /api/activities` | 活动列表 |
| | `POST /api/activities/:id/join` | 活动报名 |
| 👑 老板 | `GET /api/admin/stats` | 仪表盘 |
| | `PUT /api/admin/tickets/:id` | 修改价格 |
| | `POST /api/admin/employees` | 添加员工 |
| 👷 员工 | `POST /api/employee/report` | 提交日报 |

---

## 🎨 设计系统

**Joyful Geometry（快乐几何）**

| 元素 | 值 |
|------|-----|
| 主色 | `#FFE4E8` 温暖粉 |
| 辅色 | `#FFFFFF` 纯白 |
| 点缀 | `#D4A574` 金 |
| 圆角 | 12-40rpx（柔和） |
| 留白 | 宽松呼吸感 |

---

## 🔐 客户信息安全

- openid 脱敏：对外接口不暴露原始 openid
- JWT 三级权限：user / employee / boss
- 全部参数化查询，防 SQL 注入
- 核销操作全量审计日志

---

## 📄 授权

MIT License — 随便用，改 Logo 和店名就是你的。

---

<p align="center">
  Made with ❤️ for 儿童乐园从业者
</p>

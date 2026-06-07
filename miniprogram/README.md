# 帅帅亲子乐园小程序

基于 Joyful Geometry 设计理念的高端亲子乐园小程序，为0-12岁儿童打造安全、温暖、富有探索乐趣的成长环境。

## 项目结构

```
miniprogram/
├── app.js           # 应用主入口
├── app.json # 应用配置
├── app.wxss        # 全局样式
├── project.config.json  # 项目配置
├── sitemap.json     # 微信索引配置
├── images/ # 图片资源
├── pages/          # 页面目录
│   ├── index/      # 首页
│   ├── tickets/    # 购票页面
│   ├── activity/   # 活动预约
│   ├── member/     # 会员中心
│   ├── guide/      # 游玩指南
│   └── order/      # 订单确认
├── components/     # 组件目录
└── utils/          # 工具函数
```

## 功能模块

### 1. 首页 (index)
- Banner轮播展示
- 快速入口导航
- 乐园信息展示
- 热门活动推荐

### 2. 购票 (tickets)
- 多种票种选择（平日票、周末票、亲子票等）
- 日期选择
- 数量选择
- 价格计算

### 3. 活动预约 (activity)
- 活动筛选分类
- 活动列表展示
- 报名功能

### 4. 会员中心 (member)
- 用户登录/信息
- 会员卡展示
- 功能菜单

### 5. 游玩指南 (guide)
- 乐园分区介绍
- 游玩须知
- 营业时间
- 交通指南
- 联系方式

### 6. 订单确认 (order)
- 订单信息确认
- 优惠券/积分抵扣
- 支付方式选择

## 设计风格

采用 **Joyful Geometry** 设计理念：
- 温暖粉 (#FFE4E8) + 白 (#FFFFFF) + 金色点缀 (#D4A574)
- 柔和圆角设计
- 大量留白
- 精致、高端感

## 如何运行

### 1. 安装微信开发者工具
下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 导入项目
1. 打开微信开发者工具
2. 点击"导入项目"
3. 选择 `miniprogram` 文件夹
4. 填写 AppID（如果没有，可使用测试号）

### 3. 添加占位图片
在 `images/` 目录下添加以下占位图片：
- `tab-home.png` / `tab-home-active.png` - 首页图标
- `tab-ticket.png` / `tab-ticket-active.png` - 购票图标
- `tab-activity.png` / `tab-activity-active.png` - 活动图标
- `tab-member.png` / `tab-member-active.png` - 会员图标
- `default-avatar.png` - 默认头像
- `share-poster.png` - 分享海报

### 4. 编译预览
点击微信开发者工具中的"编译"按钮，即可在模拟器中预览

## 开发说明

### 配置 AppID
1. 打开 `project.config.json`
2. 将 `YOUR_APPID` 替换为你的小程序 AppID
3. 在 [微信公众平台](https://mp.weixin.qq.com/) 注册小程序获取 AppID

### 连接真实后端
1. 在 `app.js` 中的 `request` 方法配置真实接口地址
2.替换 `globalData` 中的示例数据

### 添加 TabBar 图标
使用 iconfont 或自行设计81x81px 的 PNG 图片

## 技术栈

- 微信小程序原生框架
- WXML + WXSS + JavaScript
- 无框架依赖，轻量高效

## 后续扩展

- [ ] 登录注册功能
- [ ] 微信支付集成
- [ ] 会员系统完善
- [ ] 订单管理
- [ ] 优惠券系统
- [ ] 积分系统
- [ ] 消息推送
- [ ] 数据统计

## 联系方式

如有问题或建议，请联系：
- 客服热线：400-XXX-XXXX
- 微信公众号：帅帅亲子乐园

---

**帅帅亲子乐园 - 给孩子一个快乐的童年**
// ============================================
//  SQLite 数据库层 · 零配置 · 自动建表
// ============================================

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'park.db');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// 性能优化
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============ 自动建表 ============
function initDatabase() {
  db.exec(`
    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openid TEXT UNIQUE NOT NULL,
      phone TEXT DEFAULT '',
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      role TEXT DEFAULT 'user' CHECK(role IN ('user','employee','boss')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 会员表
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE REFERENCES users(id),
      card_no TEXT UNIQUE,
      level TEXT DEFAULT '普通会员',
      balance REAL DEFAULT 0,
      points INTEGER DEFAULT 0,
      valid_from DATETIME DEFAULT CURRENT_TIMESTAMP,
      valid_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 票种表
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL NOT NULL,
      description TEXT DEFAULT '',
      type TEXT NOT NULL CHECK(type IN ('trial','single','times','annual')),
      tag TEXT DEFAULT '',
      presale INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    );

    -- 订单表
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id),
      ticket_id INTEGER REFERENCES tickets(id),
      ticket_name TEXT,
      quantity INTEGER DEFAULT 1,
      amount REAL NOT NULL,
      discount REAL DEFAULT 0,
      actual_amount REAL NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','verified','cancelled','refunded')),
      payment_method TEXT DEFAULT 'wechat',
      paid_at DATETIME,
      verified_at DATETIME,
      code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 核销记录
    CREATE TABLE IF NOT EXISTS verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER REFERENCES orders(id),
      platform TEXT CHECK(platform IN ('internal','douyin','dianping','meituan')),
      code TEXT,
      operator_id INTEGER REFERENCES users(id),
      operator_name TEXT,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 活动表
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT DEFAULT '',
      spots INTEGER DEFAULT 20,
      enrolled INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'weekend',
      status TEXT DEFAULT 'open' CHECK(status IN ('open','full','closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 活动报名
    CREATE TABLE IF NOT EXISTS activity_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER REFERENCES activities(id),
      user_id INTEGER REFERENCES users(id),
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 日报表
    CREATE TABLE IF NOT EXISTS daily_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER REFERENCES users(id),
      employee_name TEXT,
      report_date TEXT NOT NULL,
      shift TEXT CHECK(shift IN ('早班','晚班')),
      verified_count INTEGER DEFAULT 0,
      ticket_count INTEGER DEFAULT 0,
      revenue REAL DEFAULT 0,
      note TEXT DEFAULT '',
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 通知表
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      type TEXT,
      title TEXT,
      content TEXT,
      read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 优惠券表
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      name TEXT,
      amount REAL,
      min_order REAL DEFAULT 0,
      status TEXT DEFAULT 'unused' CHECK(status IN ('unused','used','expired')),
      expire_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 评价奖励记录（防滑袜）
    CREATE TABLE IF NOT EXISTS review_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      platform TEXT,
      reward_type TEXT DEFAULT 'socks',
      rewarded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 插入默认票种（如果为空）
  const ticketCount = db.prepare('SELECT COUNT(*) as c FROM tickets').get();
  if (ticketCount.c === 0) {
    seedTickets();
  }

  // 插入默认活动（如果为空）
  const activityCount = db.prepare('SELECT COUNT(*) as c FROM activities').get();
  if (activityCount.c === 0) {
    seedActivities();
  }

  console.log('✅ 数据库已就绪:', DB_PATH);
}

// ============ 种子数据 ============
function seedTickets() {
  const tickets = [
    ['9.9元体验券（线上）', 9.9, 68, '线上专属·开业首周可用·限量1000张', 'trial', '引流', 1, 0],
    ['39.9元体验卡（地推）', 39.9, 68, '含实物玩具·地推现场购买·有效期1个月', 'trial', '地推', 1, 1],
    ['儿童票（工作日）', 68, 68, '周一至周五使用', 'single', '平日', 0, 2],
    ['儿童票（周末节假日）', 88, 88, '周六日、法定节假日', 'single', '周末', 0, 3],
    ['6次体验卡（预售）', 199, 199, '折合33.2元/次·送小型玩具·有效期6个月', 'times', '入门', 1, 4],
    ['10次畅玩卡（预售）', 288, 288, '买10得12·折合24元/次·送中型玩具', 'times', '推荐', 1, 5],
    ['10次畅玩卡', 388, 388, '折合38.8元/次·有效期12个月', 'times', '', 0, 6],
    ['20次畅玩卡', 688, 688, '折合34.4元/次·有效期18个月', 'times', '', 0, 7],
    ['单人年卡（预售）', 498, 698, '全年不限次+大盒玩具+生日派对8折·限前300张', 'annual', '核心', 1, 8],
    ['单人年卡', 698, 698, '全年不限次+生日派对8折+优先报名', 'annual', '', 0, 9],
    ['亲子年卡（1大1小）', 898, 898, '全年无限次+餐饮9折', 'annual', '', 0, 10],
    ['家庭年卡（2大1小）', 1198, 1198, '全场消费8.5折+生日派对6折+活动优先', 'annual', '', 0, 11],
  ];

  const stmt = db.prepare(
    'INSERT INTO tickets (name, price, original_price, description, type, tag, presale, sort_order) VALUES (?,?,?,?,?,?,?,?)'
  );

  const insertMany = db.transaction((items) => {
    for (const t of items) stmt.run(...t);
  });

  insertMany(tickets);
  console.log('✅ 默认票种已导入');
}

function seedActivities() {
  const activities = [
    ['🎡 开业幸运转盘', '2026-07-01', '全天', 999, 0, '到场消费即抽·100%中奖·年卡免单等你拿', 'special'],
    ['周末亲子手工坊', '每周六', '14:00-16:00', 20, 0, '创意手工DIY·每期限额20组家庭', 'weekend'],
    ['宝宝生日派对', '预约制', '10:00-12:00', 30, 0, '专属生日空间·年卡会员8折', 'party'],
    ['绘本故事会', '每周日', '15:00-16:00', 15, 0, '专业老师领读·培养阅读兴趣', 'weekend'],
    ['小小厨师长', '每周三', '14:00-16:00', 12, 0, '亲子烘焙体验·动手又动脑', 'workshop'],
    ['亲子运动会', '每月第二周', '10:00-12:00', 50, 0, '趣味竞技·家庭协作·精美奖品', 'sports'],
  ];

  const stmt = db.prepare(
    'INSERT INTO activities (title, date, time, spots, enrolled, description, category) VALUES (?,?,?,?,?,?,?)'
  );

  const insertMany = db.transaction((items) => {
    for (const a of items) stmt.run(...a);
  });

  insertMany(activities);
  console.log('✅ 默认活动已导入');
}

// ============ 导出便捷查询方法 ============
// 自动处理 {1: val} 和 [val] 两种参数格式
function smartParams(params) {
  if (!params) return { type: 'empty', value: [] };
  if (Array.isArray(params)) return { type: 'spread', value: params };
  if (typeof params === 'object') {
    const numKeys = Object.keys(params).filter(k => /^\d+$/.test(k)).sort((a,b) => parseInt(a)-parseInt(b));
    if (numKeys.length > 0) return { type: 'spread', value: numKeys.map(k => params[k]) };
    if (Object.keys(params).length === 0) return { type: 'empty', value: [] };
    return { type: 'single', value: params }; // 命名参数
  }
  return { type: 'spread', value: [params] };
}

const query = {
  get: (sql, params) => {
    const p = smartParams(params);
    if (p.type === 'empty') return db.prepare(sql).get();
    if (p.type === 'spread') return db.prepare(sql).get(...p.value);
    return db.prepare(sql).get(p.value);
  },
  all: (sql, params) => {
    const p = smartParams(params);
    if (p.type === 'empty') return db.prepare(sql).all();
    if (p.type === 'spread') return db.prepare(sql).all(...p.value);
    return db.prepare(sql).all(p.value);
  },
  run: (sql, params) => {
    const p = smartParams(params);
    if (p.type === 'empty') return db.prepare(sql).run();
    if (p.type === 'spread') return db.prepare(sql).run(...p.value);
    return db.prepare(sql).run(p.value);
  },
  exec: (sql) => db.exec(sql),
};

initDatabase();

module.exports = { db, query, initDatabase };

// 帅帅亲子乐园 - 活动预约页面逻辑
const app = getApp();

Page({
  data: {
    filter: 'all',
    activities: [],
    filteredActivities: [],
  },

  onLoad(options) {
    this.loadActivities();

    // 如果有活动ID传入，显示活动详情
    if (options.id) {
      this.showActivityDetail(parseInt(options.id));
    }
  },

  // 加载活动数据
  loadActivities() {
    const rawActivities = app.globalData.activities;
    const activities = rawActivities.map((item, index) => {
      // 根据活动类型设置封面颜色和图标
      const typeConfig = this.getTypeConfig(item.title);
      // 根据已报名比例设置状态
      const ratio = item.enrolled / item.spots;
      let status = '';
      if (ratio >= 1) {
        status = 'full';
      } else if (ratio >= 0.8) {
        status = 'hot';
      } else if (index === 0) {
        status = 'soon';
      }

      return {
        ...item,
        coverColor: typeConfig.color,
        icon: typeConfig.icon,
        status,
      };
    });

    this.setData({ activities });
    this.filterActivities();
  },

  // 获取活动类型配置
  getTypeConfig(title) {
    if (title.includes('手工')) {
      return { color: 'linear-gradient(135deg, #FFE4E8 0%, #FFB6C1 100%)', icon: '🎨' };
    } else if (title.includes('生日')) {
      return { color: 'linear-gradient(135deg, #F5E6D3 0%, #D4A574 100%)', icon: '🎂' };
    } else if (title.includes('绘本')) {
      return { color: 'linear-gradient(135deg, #E8F4FD 0%, #B8E0FF 100%)', icon: '📚' };
    } else if (title.includes('厨师')) {
      return { color: 'linear-gradient(135deg, #FFF5E6 0%, #FFD699 100%)', icon: '👨‍🍳' };
    } else if (title.includes('运动')) {
      return { color: 'linear-gradient(135deg, #E6FFE6 0%, #B8E0B8 100%)', icon: '🏃' };
    }
    return { color: 'linear-gradient(135deg, #FFE4E8 0%, #F5E6D3 100%)', icon: '🎉' };
  },

  // 设置筛选条件
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ filter });
    this.filterActivities();
  },

  // 筛选活动
  filterActivities() {
    const { activities, filter } = this.data;

    if (filter === 'all') {
      this.setData({ filteredActivities: activities });
      return;
    }

    const filtered = activities.filter(item => {
      switch (filter) {
        case 'weekend':
          return item.date.includes('周六') || item.date.includes('周日');
        case 'workshop':
          return item.title.includes('手工');
        case 'party':
          return item.title.includes('生日');
        case 'sports':
          return item.title.includes('运动');
        default:
          return true;
      }
    });

    this.setData({ filteredActivities: filtered });
  },

  // 跳转到活动详情
  goToActivityDetail(e) {
    const activity = e.currentTarget.dataset.activity;
    if (activity.status === 'full') {
      wx.showToast({ title: '名额已满，看看其他活动吧', icon: 'none' });
      return;
    }

    wx.navigateTo({
      url: `/pages/activity/activity?id=${activity.id}`,
    });
  },

  // 显示活动详情
  showActivityDetail(id) {
    const activity = this.data.activities.find(item => item.id === id);
    if (!activity) return;

    wx.showModal({
      title: activity.title,
      content: `活动时间：${activity.date} ${activity.time}\n\n活动描述：${activity.description || '精彩活动，等你来参与！'}\n\n剩余名额：${activity.spots - activity.enrolled}`,
      confirmText: '立即报名',
      cancelText: '再看看',
      success: (res) => {
        if (res.confirm) {
          this.signUpActivity(activity);
        }
      },
    });
  },

  // 报名活动
  signUpActivity(activity) {
    wx.showLoading({ title: '正在报名...' });

    // 模拟报名请求
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '报名成功！',
        icon: 'success',
        duration: 2000,
      });
    }, 1000);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadActivities();
    wx.stopPullDownRefresh();
  },

  // 分享给朋友
  onShareAppMessage() {
    return {
      title: '帅帅亲子乐园 - 精彩活动',
      path: '/pages/activity/activity',
    };
  },
});
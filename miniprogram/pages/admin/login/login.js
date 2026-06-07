// 帅帅亲子乐园 - 员工/老板微信授权登录
const app = getApp();

Page({
  data: {},

  onLoad(options) {
    // 检查是否已登录
    const adminInfo = wx.getStorageSync('adminInfo');
    if (adminInfo) {
      this.redirectToBackend(adminInfo.role);
    }
  },

  // 微信手机号授权登录
  onGetPhoneNumber(e) {
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      this.processLogin(e.detail);
    } else {
      // 用户拒绝授权，使用静默登录获取openid
      this.silentLogin();
    }
  },

  // 静默登录（获取openid）
  silentLogin() {
    wx.showLoading({ title: '登录中...' });

    wx.login({
      success: (res) => {
        if (res.code) {
          // 实际项目中：发送code到后端换取openid
          // 这里模拟：通过code获取openid
          this.verifyAndLogin(res.code);
        } else {
          wx.hideLoading();
          wx.showToast({ title: '登录失败，请重试', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      },
    });
  },

  // 处理登录（手机号授权）
  processLogin(detail) {
    wx.showLoading({ title: '登录中...' });

    // 实际项目中：后端解密获取手机号和openid
    // 这里模拟：使用静默登录获取openid
    setTimeout(() => {
      this.silentLogin();
    }, 500);
  },

  // 验证并登录
  verifyAndLogin(code) {
    // 实际项目中：
    // 1. 发送 code 到后端
    // 2. 后端调用 wx.login.code2session 获取 openid
    // 3. 后端查询数据库验证身份

    // 模拟：使用存储的员工白名单验证
    const mockOpenid = 'o6zAJszt2TtvczyAbFJBPEeS63wg'; // 模拟获取到的openid

    // 从本地存储获取员工列表
    const employeeList = wx.getStorageSync('employeeList') || [];

    // 查找匹配的员工业主
    const employee = employeeList.find(e => e.openid === mockOpenid);

    wx.hideLoading();

    if (employee) {
      // 保存登录信息
      const adminInfo = {
        openid: employee.openid,
        employeeId: employee.employeeId || employee.openid.slice(-4),
        role: employee.role,
        name: employee.name,
        loginTime: new Date().toISOString(),
      };
      wx.setStorageSync('adminInfo', adminInfo);

      wx.showToast({
        title: `欢迎 ${employee.name}`,
        icon: 'success',
        duration: 1500,
      });

      setTimeout(() => {
        this.redirectToBackend(employee.role);
      }, 1500);
    } else {
      wx.showModal({
        title:'❌ 登录失败',
        content: '您的账号未被授权使用后台管理系统。\n\n请让老板在「员工管理」中添加您的微信号。',
        showCancel: false,
        confirmText: '我知道了',
      });
    }
  },

  // 跳转到对应后台
  redirectToBackend(role) {
    if (role === 'boss') {
      wx.redirectTo({ url: '/pages/admin/dashboard/dashboard' });
    } else {
      wx.redirectTo({ url: '/pages/admin/employee/employee' });
    }
  },

  // 获取当前用户的OpenID（供老板添加）
  getMyOpenid() {
    wx.showLoading({ title: '获取中...' });

    wx.login({
      success: (res) => {
        if (res.code) {
          // 实际项目中：发送code到后端换取openid
          // 这里模拟显示（实际需要后端接口）
          wx.hideLoading();

          // 模拟openid（实际从后端返回）
          const mockOpenid = 'o6zAJszt2TtvczyAbFJBPEeS63wg';

          wx.showModal({
            title:'📋 您的OpenID',
            content: `请将以下OpenID告诉老板：\n\n${mockOpenid}\n\n（实际项目中会自动发送到服务器）`,
            showCancel: false,
            confirmText: '复制',
            success: (result) => {
              if (result.confirm) {
                wx.setClipboardData({
                  data: mockOpenid,
                  success: () => {
                    wx.showToast({ title: '已复制', icon: 'success' });
                  },
                });
              }
            },
          });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '获取失败', icon: 'none' });
      },
    });
  },
});
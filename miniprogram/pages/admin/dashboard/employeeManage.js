// 帅帅亲子乐园 - 员工管理弹窗
const app = getApp();

Component({
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    bossOpenid: {
      type: String,
      value: '',
    },
  },

  data: {
    employeeList: [],
    newEmployee: {
      openid: '',
      name: '',
    },
  },

  lifetimes: {
    attached() {
      this.loadEmployeeList();
    },
  },

  methods: {
    // 加载员工列表
    loadEmployeeList() {
      const employeeList = wx.getStorageSync('employeeList') || [
        { openid: 'o6zAJs老板openid', name: '老板', role: 'boss', isBoss: true },
        { openid: 'o6zAJszt2TtvczyAbFJBPEeS63wg', name: '张三', role: 'employee', isBoss: false },
      ];
      this.setData({ employeeList });
    },

    // 输入OpenID
    onOpenidInput(e) {
      this.setData({
        'newEmployee.openid': e.detail.value,
      });
    },

    // 输入昵称
    onNameInput(e) {
      this.setData({
        'newEmployee.name': e.detail.value,
      });
    },

    // 添加员工
    addEmployee() {
      const { openid, name } = this.data.newEmployee;

      if (!openid || !name) {
        wx.showToast({ title: '请填写完整信息', icon: 'none' });
        return;
      }

      // 检查是否已存在
      const employeeList = this.data.employeeList;
      if (employeeList.some(e => e.openid === openid)) {
        wx.showToast({ title: '该账号已是员工', icon: 'none' });
        return;
      }

      // 添加新员工
      employeeList.push({
        openid,
        name,
        role: 'employee',
        isBoss: false,
        addTime: new Date().toISOString(),
      });

      wx.setStorageSync('employeeList', employeeList);
      this.setData({ employeeList, newEmployee: { openid: '', name: '' } });

      wx.showToast({ title: '员工已添加', icon: 'success' });

      // 通知刷新
      this.triggerEvent('update');
    },

    // 删除员工
    deleteEmployee(e) {
      const openid = e.currentTarget.dataset.openid;

      wx.showModal({
        title: '确认删除',
        content: '确定删除该员工权限？该员工将无法登录后台。',
        success: (res) => {
          if (res.confirm) {
            const employeeList = this.data.employeeList.filter(e => e.openid !== openid);
            wx.setStorageSync('employeeList', employeeList);
            this.setData({ employeeList });

            wx.showToast({ title: '已删除', icon: 'success' });

            // 通知刷新
            this.triggerEvent('update');
          }
        },
      });
    },

    // 关闭弹窗
    closeModal() {
      this.triggerEvent('close');
    },

    // 阻止滑动
    preventTouchMove() {},
  },
});
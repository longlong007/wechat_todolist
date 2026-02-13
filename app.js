App({
  onLaunch() {
    // 从本地存储加载数据
    const todos = wx.getStorageSync('todos') || []
    this.globalData.todos = todos
  },
  globalData: {
    todos: []
  }
})
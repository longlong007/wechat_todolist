Page({
  data: {
    inputValue: '',
    todos: []
  },

  onLoad() {
    this.loadTodos()
  },

  // 从本地存储加载数据
  loadTodos() {
    const todos = wx.getStorageSync('todos') || []
    this.setData({ todos })
  },

  // 保存数据到本地存储
  saveTodos() {
    wx.setStorageSync('todos', this.data.todos)
    // 同步更新到 app.globalData
    const app = getApp()
    app.globalData.todos = this.data.todos
  },

  // 输入框事件
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  // 添加待办事项
  addTodo() {
    const text = this.data.inputValue.trim()
    
    if (!text) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return
    }

    const newTodo = {
      id: Date.now(),
      text: text,
      completed: false
    }

    const todos = [newTodo, ...this.data.todos]
    
    this.setData({
      todos,
      inputValue: ''
    })
    
    this.saveTodos()
  },

  // 切换完成状态
  toggleTodo(e) {
    const id = e.currentTarget.dataset.id
    const todos = this.data.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed }
      }
      return todo
    })
    
    this.setData({ todos })
    this.saveTodos()
  },

  // 更新待办事项文本
  updateTodoText(e) {
    const id = e.currentTarget.dataset.id
    const newText = e.detail.value.trim()
    
    if (!newText) {
      // 如果内容为空，删除该项
      this.deleteTodo(e)
      return
    }
    
    const todos = this.data.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, text: newText }
      }
      return todo
    })
    
    this.setData({ todos })
    this.saveTodos()
  },

  // 删除待办事项
  deleteTodo(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个待办事项吗？',
      success: (res) => {
        if (res.confirm) {
          const todos = this.data.todos.filter(todo => todo.id !== id)
          this.setData({ todos })
          this.saveTodos()
        }
      }
    })
  }
})
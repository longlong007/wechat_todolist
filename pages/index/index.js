Page({
  data: {
    inputValue: '',
    todos: [],
    // 重要性级别
    importanceLevels: ['A', 'B', 'C', 'D'],
    selectedImportance: 'A',
    // 紧急程度
    urgencyLevels: [1, 2, 3, 4],
    selectedUrgency: 1,
    // 排序模式
    sortModes: [
      { id: 'importance', name: '按重要性' },
      { id: 'urgency', name: '按紧急度' },
      { id: 'date', name: '按日期' },
      { id: 'default', name: '默认顺序' }
    ],
    selectedSortMode: 'importance',
    sortModeIndex: 0
  },

  onLoad() {
    // 从本地存储加载排序模式
    const savedSortMode = wx.getStorageSync('sortMode') || 'importance'
    // 计算索引
    const sortModeIndex = this.data.sortModes.findIndex(item => item.id === savedSortMode)
    this.setData({ 
      selectedSortMode: savedSortMode,
      sortModeIndex: sortModeIndex >= 0 ? sortModeIndex : 0
    })
    this.loadTodos()
  },

  // 从本地存储加载数据
  loadTodos() {
    const todos = wx.getStorageSync('todos') || []
    // 根据选择的排序模式排序
    const sortedTodos = this.sortTodos(todos)
    this.setData({ todos: sortedTodos })
  },

  // 保存数据到本地存储
  saveTodos() {
    wx.setStorageSync('todos', this.data.todos)
    // 同步更新到 app.globalData
    const app = getApp()
    app.globalData.todos = this.data.todos
  },

  // 排序函数
  sortTodos(todos) {
    const importanceOrder = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
    
    return todos.sort((a, b) => {
      const sortMode = this.data.selectedSortMode
      
      if (sortMode === 'importance') {
        // 按重要性降序（A>B>C>D），然后按紧急程度升序（1>2>3>4），最后按日期
        const importanceDiff = (importanceOrder[b.importance] || 4) - (importanceOrder[a.importance] || 4)
        if (importanceDiff !== 0) return importanceDiff
        const urgencyDiff = (a.urgency || 1) - (b.urgency || 1)
        if (urgencyDiff !== 0) return urgencyDiff
      } else if (sortMode === 'urgency') {
        // 按紧急程度升序（1>2>3>4），然后按重要性降序
        const urgencyDiff = (a.urgency || 1) - (b.urgency || 1)
        if (urgencyDiff !== 0) return urgencyDiff
        const importanceDiff = (importanceOrder[b.importance] || 4) - (importanceOrder[a.importance] || 4)
        if (importanceDiff !== 0) return importanceDiff
      } else if (sortMode === 'date') {
        // 按日期降序（新的在前）
        return (b.createdAt || b.id) - (a.createdAt || a.id)
      }
      // 默认顺序：按日期降序
      return (b.createdAt || b.id) - (a.createdAt || a.id)
    })
  },

  // 输入框事件
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  // 选择重要性
  onImportanceChange(e) {
    this.setData({
      selectedImportance: this.data.importanceLevels[e.detail.value]
    })
  },

  // 选择紧急程度
  onUrgencyChange(e) {
    this.setData({
      selectedUrgency: this.data.urgencyLevels[e.detail.value]
    })
  },

  // 选择排序模式
  onSortModeChange(e) {
    const sortMode = this.data.sortModes[e.detail.value].id
    this.setData({ 
      selectedSortMode: sortMode,
      sortModeIndex: e.detail.value
    })
    // 保存到本地存储
    wx.setStorageSync('sortMode', sortMode)
    // 重新排序
    const sortedTodos = this.sortTodos(this.data.todos)
    this.setData({ todos: sortedTodos })
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
      completed: false,
      importance: this.data.selectedImportance,
      urgency: this.data.selectedUrgency,
      createdAt: Date.now()
    }

    const todos = this.sortTodos([newTodo, ...this.data.todos])
    
    this.setData({
      todos,
      inputValue: '',
      selectedImportance: 'A',
      selectedUrgency: 1
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

  // 更新重要性
  updateImportance(e) {
    const id = e.currentTarget.dataset.id
    const newImportance = e.detail.value.toUpperCase()
    
    // 验证输入
    if (!['A', 'B', 'C', 'D'].includes(newImportance)) {
      wx.showToast({
        title: '请输入 A-D',
        icon: 'none'
      })
      this.loadTodos()
      return
    }
    
    const todos = this.data.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, importance: newImportance }
      }
      return todo
    })
    
    const sortedTodos = this.sortTodos(todos)
    this.setData({ todos: sortedTodos })
    this.saveTodos()
  },

  // 更新紧急程度
  updateUrgency(e) {
    const id = e.currentTarget.dataset.id
    const newUrgency = parseInt(e.detail.value)
    
    // 验证输入
    if (isNaN(newUrgency) || newUrgency < 1 || newUrgency > 4) {
      wx.showToast({
        title: '请输入 1-4',
        icon: 'none'
      })
      this.loadTodos()
      return
    }
    
    const todos = this.data.todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, urgency: newUrgency }
      }
      return todo
    })
    
    const sortedTodos = this.sortTodos(todos)
    this.setData({ todos: sortedTodos })
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
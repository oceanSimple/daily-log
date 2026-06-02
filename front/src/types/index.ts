// 日程
export interface Schedule {
  id: string
  title: string
  detail: string
  startTime: string   // "HH:mm"
  endTime: string     // "HH:mm"
  completed: boolean
  isTodo?: boolean
}

// 待办事项
export interface Todo {
  id: string
  title: string
  detail: string
  deadline: string    // "HH:mm", 默认 "23:59"
  completed: boolean
  icon: string        // iconfont 图标名
}

// 随笔
export interface Essay {
  id: string
  title: string
  content: string
  category: string    // "Thoughts" | "Summary" | ...
  createdAt: string   // ISO datetime
}

import type { Schedule } from '../../types'

const currentHour = new Date().getHours()

const formatTime = (h: number, m: number = 0) => {
  // Wrap around logically or clamp to ensure valid 24h format
  // For simplicity, let's clamp between 0 and 23
  let clampedH = h
  if (clampedH < 0) clampedH = 0
  if (clampedH > 23) clampedH = 23
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(clampedH)}:${pad(m)}`
}

export const schedulesData: Schedule[] = [
  {
    id: 's1',
    title: '晨间冥想与阅读',
    detail: '阅读《深度工作》第一章',
    startTime: formatTime(currentHour - 3),
    endTime: formatTime(currentHour - 2),
    completed: true
  },
  {
    id: 's2',
    title: '跟进昨日遗留任务',
    detail: '修复生产环境出现的UI错位问题',
    startTime: formatTime(currentHour - 1),
    endTime: formatTime(currentHour - 1, 30),
    completed: false
  },
  {
    id: 's3',
    title: '核心业务逻辑开发',
    detail: '完成用户模块重构',
    startTime: formatTime(currentHour),
    endTime: formatTime(currentHour + 1, 30),
    completed: false
  },
  {
    id: 's4',
    title: '周会与工作同步',
    detail: '同步下周开发排期',
    startTime: formatTime(currentHour + 2),
    endTime: formatTime(currentHour + 3),
    completed: false
  }
]

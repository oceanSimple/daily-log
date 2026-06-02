import type { Essay } from '../../types'

export const essaysData: Essay[] = [
  {
    id: 'e1',
    title: '',
    content: '今天的早晨让我感觉非常平静，呼吸顺畅，内心也更加专注了。',
    category: 'Thoughts',
    createdAt: new Date(new Date().setHours(7, 45, 0, 0)).toISOString()
  },
  {
    id: 'e2',
    title: '',
    content: '今日完成了多个重要任务，积极推进项目进展，并与团队达成共识。',
    category: 'Summary',
    createdAt: new Date(new Date().setHours(12, 10, 0, 0)).toISOString()
  },
  {
    id: 'e3',
    title: '',
    content: '午后整理任务时，发现节奏更清晰，专注感也更稳定。',
    category: 'Thoughts',
    createdAt: new Date(new Date().setHours(15, 20, 0, 0)).toISOString()
  },
  {
    id: 'e4',
    title: '',
    content: '晚间回顾整体安排后，关键任务推进顺利，页面结构也更加明确。',
    category: 'Summary',
    createdAt: new Date(new Date().setHours(21, 30, 0, 0)).toISOString()
  }
]

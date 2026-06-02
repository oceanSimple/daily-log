import type { Todo } from '../../types'

export const todosData: Todo[] = [
  {
    id: 't1',
    title: '给植物浇水',
    detail: '阳台和书房的绿植都需要浇水，顺便修剪枯叶。',
    deadline: '18:00',
    completed: false,
    icon: 'icon-plant'
  },
  {
    id: 't2',
    title: '回复客户邮件',
    detail: '回复关于功能排期与报价确认的邮件，整理重点问题。',
    deadline: '20:00',
    completed: false,
    icon: 'icon-mail'
  },
  {
    id: 't3',
    title: '整理发票',
    detail: '汇总本周报销票据，按类别归档并上传系统。',
    deadline: '23:59', // Today
    completed: false,
    icon: 'icon-document'
  }
]

import type { DayRecord } from '@/types/daily-hub';

export const mockRecords: DayRecord[] = [
  {
    date: '2026-05-07',
    journalEntry: {
      date: '2026-05-07',
      title: '把生活系统重新织起来',
      content: `# 今日记录

今天把 daily hub 的信息架构终于串起来了。

- 先明确首页要以总览为主
- 把任务、日程、日记、总结放进同一个 daily loop
- 下午把几个拖延很久的小任务清掉了

## 体感

专注度不错，但上下文切换还是偏多。`,
    },
    dailySummary: {
      date: '2026-05-07',
      mood: 'focused',
      wins: ['完成 MVP 结构设计', '理清任务与日记的关系', '确定先做前端假数据'],
      blockers: ['晚上精力下降明显', '还没有后端接口'],
      nextFocus: ['完成任务页与日页面交互', '整理后端接口清单'],
      content: `# 每日总结

今天最重要的进展是把产品从“博客”拉回到“个人生活中枢”。

- **做得好的**：决策更果断，范围控制住了
- **要调整的**：明天少开新坑，多收尾
- **明日重点**：先把日页面体验打磨好`,
    },
    tasks: [
      {
        id: 'task-1',
        title: '梳理 dashboard 信息密度',
        status: 'done',
        priority: 'high',
        dueAt: '2026-05-07T11:00:00',
        date: '2026-05-07',
      },
      {
        id: 'task-2',
        title: '补完任务与日记的 mock 数据模型',
        status: 'in_progress',
        priority: 'high',
        dueAt: '2026-05-07T18:30:00',
        date: '2026-05-07',
      },
      {
        id: 'task-3',
        title: '晚间散步 30 分钟',
        status: 'todo',
        priority: 'medium',
        dueAt: '2026-05-07T23:59:00',
        date: '2026-05-07',
        notes: '放空，不带耳机。',
      },
    ],
    events: [
      {
        id: 'event-1',
        title: '晨间计划回顾',
        startAt: '2026-05-07T09:00:00',
        endAt: '2026-05-07T09:30:00',
        date: '2026-05-07',
        completed: true,
      },
      {
        id: 'event-2',
        title: '前端结构实现',
        startAt: '2026-05-07T14:00:00',
        endAt: '2026-05-07T16:30:00',
        date: '2026-05-07',
        completed: false,
      },
    ],
  },
  {
    date: '2026-05-08',
    journalEntry: {
      date: '2026-05-08',
      title: '先收束，再扩展',
      content: `# 明日预写

明天不再继续加功能，优先把已有结构走通。

- 任务列表筛选
- 日页面输入体验
- 接口文档初稿`,
    },
    dailySummary: {
      date: '2026-05-08',
      mood: 'steady',
      wins: ['为明天排好了优先级'],
      blockers: ['还没开始，暂无实际阻塞'],
      nextFocus: ['完成文档与页面联动'],
      content: `# 计划摘要

明天的关键不是做更多，而是把现在这一套做完整。`,
    },
    tasks: [
      {
        id: 'task-4',
        title: '完成任务页筛选和分组',
        status: 'todo',
        priority: 'high',
        dueAt: '2026-05-08T23:59:00',
        date: '2026-05-08',
      },
      {
        id: 'task-5',
        title: '起草后端接口规划文档',
        status: 'todo',
        priority: 'high',
        dueAt: '2026-05-08T16:00:00',
        date: '2026-05-08',
      },
    ],
    events: [
      {
        id: 'event-3',
        title: '本周复盘',
        startAt: '2026-05-08T18:30:00',
        endAt: '2026-05-08T19:15:00',
        date: '2026-05-08',
        completed: false,
      },
    ],
  },
  {
    date: '2026-05-06',
    journalEntry: {
      date: '2026-05-06',
      title: '把想法缩回 MVP',
      content: `# 记录

今天最值钱的不是新功能，而是删掉了很多过早的想法。

## 保留下来的核心

- dashboard
- day log
- tasks
- calendar
- archive`,
    },
    dailySummary: {
      date: '2026-05-06',
      mood: 'energized',
      wins: ['决定单用户 MVP', '确认桌面优先'],
      blockers: ['功能诱惑很多，容易过度设计'],
      nextFocus: ['把 daily record 结构固定下来'],
      content: `# 总结

范围一旦清楚，设计就明显轻起来了。`,
    },
    tasks: [
      {
        id: 'task-6',
        title: '拆解 MVP 页面结构',
        status: 'done',
        priority: 'medium',
        dueAt: '2026-05-06T15:00:00',
        date: '2026-05-06',
      },
    ],
    events: [
      {
        id: 'event-4',
        title: '产品方向讨论',
        startAt: '2026-05-06T20:00:00',
        endAt: '2026-05-06T21:00:00',
        date: '2026-05-06',
        completed: true,
      },
    ],
  },
];

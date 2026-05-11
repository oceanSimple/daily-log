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
    logEntries: [
      {
        id: 'log-1',
        date: '2026-05-07',
        time: '16:40',
        title: '把首页、任务、日历和日志之间的关系重新串起来了',
        notes: '这一步让后面的页面定位终于不再打架。',
        isHighlight: true,
        sourceType: 'event',
        sourceId: 'event-2',
      },
      {
        id: 'log-2',
        date: '2026-05-07',
        time: '11:20',
        title: '梳理完 dashboard 的信息密度，首页终于不再飘',
        notes: '保留总览感，砍掉了几块太像文章页的区域。',
        isHighlight: false,
        sourceType: 'task',
        sourceId: 'task-1',
      },
      {
        id: 'log-3',
        date: '2026-05-07',
        time: '21:10',
        title: '晚上明显更适合收束和复盘，不适合开新坑',
        notes: '这是今天最有价值的体感记录。',
        isHighlight: false,
        sourceType: 'event',
      },
    ],
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
    logEntries: [
      {
        id: 'log-4',
        date: '2026-05-08',
        time: '10:45',
        title: '把任务页筛选与分组方案彻底讲清楚了',
        notes: '先把今天该落地的判断都定住。',
        isHighlight: true,
        sourceType: 'task',
        sourceId: 'task-4',
      },
      {
        id: 'log-5',
        date: '2026-05-08',
        time: '19:20',
        title: '本周复盘里把下一步节奏重新拉回到收尾优先',
        notes: '比继续扩功能更有意义。',
        isHighlight: false,
        sourceType: 'event',
        sourceId: 'event-3',
      },
    ],
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
        isFocus: true,
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
        isFocus: true,
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
    logEntries: [
      {
        id: 'log-6',
        date: '2026-05-06',
        time: '15:30',
        title: '把 MVP 页面结构真正拆成可以执行的模块',
        notes: '删掉了一堆太早的想法，反而更轻。',
        isHighlight: true,
        sourceType: 'task',
        sourceId: 'task-6',
      },
    ],
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
  {
    date: '2026-05-09',
    journalEntry: {
      date: '2026-05-09',
      title: '把时间线摊开看',
      content: `# 今日计划

今天开始把日历从“看月份”变成“看行动窗口”。

- 把历史欠账单独提出来
- 把未来几天按列展开
- 把真正重要的未来事项单独高亮`,
    },
    logEntries: [
      {
        id: 'log-7',
        date: '2026-05-09',
        time: '11:15',
        title: '周视图结构终于不再像把月视图硬掰弯',
        notes: '先把语义列定下来，再讨论样式。',
        isHighlight: true,
        sourceType: 'event',
        sourceId: 'event-5',
      },
      {
        id: 'log-8',
        date: '2026-05-09',
        time: '19:40',
        title: '样式收尾还没做完，但主方向已经对了',
        notes: '继续压噪音。',
        isHighlight: false,
        sourceType: 'task',
        sourceId: 'task-8',
      },
    ],
    dailySummary: {
      date: '2026-05-09',
      mood: 'focused',
      wins: ['明确了日历页的新角色'],
      blockers: ['还需要把交互收束得更顺手'],
      nextFocus: ['完成周视图排版', '连通编辑操作'],
      content: `# 今日推进

先把视图改对，再考虑加更重的管理能力。`,
    },
    tasks: [
      {
        id: 'task-7',
        title: '把 Calendar 改成多列周视图',
        status: 'in_progress',
        priority: 'high',
        dueAt: '2026-05-09T15:00:00',
        date: '2026-05-09',
        isFocus: true,
      },
      {
        id: 'task-8',
        title: '收尾样式细节',
        status: 'todo',
        priority: 'medium',
        dueAt: '2026-05-09T19:30:00',
        date: '2026-05-09',
      },
    ],
    events: [
      {
        id: 'event-5',
        title: '设计走查',
        startAt: '2026-05-09T10:00:00',
        endAt: '2026-05-09T11:00:00',
        date: '2026-05-09',
        completed: false,
      },
    ],
  },
  {
    date: '2026-05-10',
    journalEntry: {
      date: '2026-05-10',
      title: '把关键事情抬出来',
      content: `# 预备记录

明天继续处理高价值事项，不让它们埋在普通列表里。`,
    },
    logEntries: [
      {
        id: 'log-9',
        date: '2026-05-10',
        time: '10:20',
        title: '重新把需求对齐了一遍，避免继续在错误的 UI 上抛光',
        notes: '这次更像是校正方向。',
        isHighlight: true,
        sourceType: 'event',
        sourceId: 'event-6',
      },
    ],
    dailySummary: {
      date: '2026-05-10',
      mood: 'steady',
      wins: [],
      blockers: [],
      nextFocus: ['补完交互状态'],
      content: '',
    },
    tasks: [
      {
        id: 'task-9',
        title: '验证列滚动体验',
        status: 'todo',
        priority: 'medium',
        dueAt: '2026-05-10T16:30:00',
        date: '2026-05-10',
      },
    ],
    events: [
      {
        id: 'event-6',
        title: '和自己对需求再对一遍',
        startAt: '2026-05-10T09:30:00',
        endAt: '2026-05-10T10:15:00',
        date: '2026-05-10',
        completed: false,
        isFocus: true,
      },
    ],
  },
  {
    date: '2026-05-11',
    journalEntry: {
      date: '2026-05-11',
      title: '把未来几天看清楚',
      content: '',
    },
    logEntries: [
      {
        id: 'log-10',
        date: '2026-05-11',
        time: '15:45',
        title: '前端自测把很多看着顺眼、实际难用的地方都挑出来了',
        notes: '视觉问题大多不是功能问题，而是布局和层级问题。',
        isHighlight: true,
        sourceType: 'event',
        sourceId: 'event-7',
      },
      {
        id: 'log-11',
        date: '2026-05-11',
        time: '18:10',
        title: '交付说明需要更直接，少一点概念话术',
        notes: '后面要继续把界面文案压短。',
        isHighlight: false,
        sourceType: 'task',
        sourceId: 'task-10',
      },
      {
        id: 'log-12',
        date: '2026-05-11',
        time: '22:00',
        title: '今天最强的感受是：功能不缺，缺的是秩序',
        notes: '这条保留成纯手写条目。',
        isHighlight: false,
        sourceType: 'task',
      },
    ],
    dailySummary: {
      date: '2026-05-11',
      mood: 'energized',
      wins: [],
      blockers: [],
      nextFocus: ['处理特别关注项'],
      content: '',
    },
    tasks: [
      {
        id: 'task-10',
        title: '整理交付说明',
        status: 'todo',
        priority: 'high',
        dueAt: '2026-05-11T23:59:00',
        date: '2026-05-11',
        isFocus: true,
      },
    ],
    events: [
      {
        id: 'event-7',
        title: '前端自测',
        startAt: '2026-05-11T14:00:00',
        endAt: '2026-05-11T15:30:00',
        date: '2026-05-11',
        completed: false,
      },
    ],
  },
  {
    date: '2026-05-13',
    journalEntry: {
      date: '2026-05-13',
      title: '把更远的提醒保留住',
      content: '',
    },
    logEntries: [
      {
        id: 'log-13',
        date: '2026-05-13',
        time: '11:50',
        title: '下一轮排期的节奏终于有了个像样的骨架',
        notes: '把近几天的重点和更远的提醒区分开了。',
        isHighlight: false,
        sourceType: 'task',
        sourceId: 'task-11',
      },
      {
        id: 'log-14',
        date: '2026-05-13',
        time: '16:15',
        title: '远期重要对齐明确了后续两周真正不能掉的事项',
        notes: '这条算重点事件。',
        isHighlight: true,
        sourceType: 'event',
        sourceId: 'event-8',
      },
    ],
    dailySummary: {
      date: '2026-05-13',
      mood: 'steady',
      wins: [],
      blockers: [],
      nextFocus: ['继续打磨细部'],
      content: '',
    },
    tasks: [
      {
        id: 'task-11',
        title: '准备下一轮排期',
        status: 'todo',
        priority: 'medium',
        dueAt: '2026-05-13T11:30:00',
        date: '2026-05-13',
        isFocus: true,
      },
    ],
    events: [
      {
        id: 'event-8',
        title: '远期重要对齐',
        startAt: '2026-05-13T15:00:00',
        endAt: '2026-05-13T16:00:00',
        date: '2026-05-13',
        completed: false,
        isFocus: true,
      },
      {
        id: 'event-9',
        title: '已完成的旧重点',
        startAt: '2026-05-13T18:00:00',
        endAt: '2026-05-13T18:30:00',
        date: '2026-05-13',
        completed: true,
        isFocus: true,
      },
    ],
  },
];

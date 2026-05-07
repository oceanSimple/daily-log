# Daily Hub Frontend API Needs

这份文档只描述前端 MVP 需要后端提供什么能力，方便后续 Go 项目直接接手。它不绑定具体数据库、鉴权方案或 HTTP 细节。

## 1. 核心资源

### DayRecord
- `date`
- `journalEntry`
- `dailySummary`
- `tasks[]`
- `events[]`

DayRecord 是按天聚合的核心资源。前端的 dashboard、day log、journal archive 都依赖它。

### Task
- `id`
- `title`
- `status`
- `priority`
- `dueAt`
- `date`
- `notes?`

### Event
- `id`
- `title`
- `startAt`
- `endAt`
- `date`
- `notes?`

### JournalEntry
- `date`
- `title`
- `content`

### DailySummary
- `date`
- `mood`
- `wins[]`
- `blockers[]`
- `nextFocus[]`
- `content`

## 2. 页面对应的数据需求

### Dashboard
需要：
- 今日 `DayRecord`
- 未来日期范围内的未完成任务
- 本周事件概览

### Day Log
需要：
- 指定 `date` 的完整 `DayRecord`

### Calendar
需要：
- 指定日期范围内的 `Event[]`
- 最好支持按周返回，便于直接渲染周视图

### Tasks
需要：
- 日期范围内 `Task[]`
- 支持按状态、截止时间、所属日期筛选

### Journal Archive
需要：
- 按日期倒序返回 `DayRecord` 摘要列表
- 最少包含 `date`、日记标题、总结状态、明日重点

## 3. 典型读写动作

### 读取
- 获取某一天的完整记录
- 获取某个日期范围内的任务
- 获取某个日期范围内的事件
- 获取归档列表
- 获取今日总览数据

### 写入
- 新增任务
- 更新任务状态、优先级、截止时间、备注
- 删除任务
- 更新某日日记标题与 Markdown 内容
- 更新某日总结正文和结构化字段
- 新增或更新某日事件
- 删除事件

## 4. 建议的接口分组

前端更关心能力边界，建议后端至少能覆盖这些资源组：

- `day-records`
- `tasks`
- `events`
- `journal-entries`
- `daily-summaries`
- `dashboard`

其中 `dashboard` 可以是聚合接口，也可以由前端拼装；只要响应速度和前端使用成本可接受即可。

## 5. 目前前端默认假设

- 单用户，不涉及账号体系和数据共享
- 日期主键使用 `YYYY-MM-DD`
- 日记与总结正文均为 Markdown 字符串
- 任务系统保持轻量，不需要子任务、标签和复杂重复规则

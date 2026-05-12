# Daily Hub Backend Contract

这份文档描述当前前端已经固定下来的 REST 路由、资源字段与读写能力。目标是让前端先通过统一 API 适配层与“内置假后端”对接，未来真实后端只需遵守这里的契约，前端就可以只改 `API_BASE_URL` / host / port 直接切换。

## 1. 核心资源

### DayRecord
- `date`
- `journalEntry`
- `logEntries[]`
- `dailySummary`
- `tasks[]`
- `events[]`

DayRecord 是按天聚合的核心资源。Dashboard、Day Log、Journal、Calendar 都依赖它。

### Task
- `id`
- `title`
- `status`
- `priority`
- `dueAt`
- `date`
- `notes?`
- `isFocus?`

### Event
- `id`
- `title`
- `startAt`
- `endAt`
- `date`
- `completed`
- `notes?`
- `isFocus?`

### JournalEntry
- `date`
- `title`
- `content`

### LogEntry
- `id`
- `date`
- `time`
- `title`
- `notes?`
- `isHighlight`
- `sourceType` (`task | event`)
- `sourceId?`

### DailySummary
- `date`
- `mood`
- `wins[]`
- `blockers[]`
- `nextFocus[]`
- `content`

## 2. REST 路由

### Dashboard
- `GET /api/dashboard`
  - 返回聚合总览数据：
    - `todayRecord`
    - `upcomingTasks`
    - `currentWeekEvents`

### Day Records
- `GET /api/day-records`
  - 支持查询参数：
    - `from`
    - `to`
- `GET /api/day-records/:date`

### Tasks
- `GET /api/tasks`
  - 支持查询参数：
    - `from`
    - `to`
    - `status`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Events
- `GET /api/events`
  - 支持查询参数：
    - `from`
    - `to`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`

### Journal Entries
- `PATCH /api/journal-entries/:date`

### Daily Summaries
- `PATCH /api/daily-summaries/:date`

### Log Entries
- `POST /api/log-entries`
- `PATCH /api/log-entries/:id`
- `DELETE /api/log-entries/:id`

## 3. 页面数据覆盖

### Dashboard
- `GET /api/dashboard`

### Day Log
- `GET /api/day-records/:date`
- `PATCH /api/journal-entries/:date`
- `PATCH /api/daily-summaries/:date`
- `POST /api/log-entries`
- `PATCH /api/log-entries/:id`
- `DELETE /api/log-entries/:id`

### Calendar
- `GET /api/day-records?from=...&to=...`
  - 或 `GET /api/events?from=...&to=...` 与 `GET /api/tasks?...`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`

### Tasks
- `GET /api/day-records?from=...&to=...`
  - 或 `GET /api/tasks?...`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `POST /api/events`
- `PATCH /api/events/:id`
- `DELETE /api/events/:id`

### Journal
- `GET /api/day-records?from=...&to=...`

## 4. 前端对后端的固定假设

- 单用户，不涉及鉴权与共享
- 日期主键使用 `YYYY-MM-DD`
- 时间字段使用 ISO 风格字符串
- 日记与总结正文均为 Markdown 字符串
- 写接口采用资源细粒度，不使用整天整包覆盖
- 当前前端通过以下环境变量切换：
  - `VITE_API_MODE=mock|http`
  - `VITE_API_BASE_URL=http://<host>:<port>`

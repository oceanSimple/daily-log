# 后端开发指导文档 (Backend API Guidelines)

本文档旨在为后端工程师提供本系统前端所需的 RESTful API 格式及接口契约。前端开发将严格遵循此文档中的定义进行网络请求（目前前端已在 Mock 层实现了如下接口）。

> **接口全局前缀**: `/api`
> **数据返回规范**: 目前前端直接使用响应体的根级数据。如果后期真实后端引入了如 `{ "code": 200, "data": ... }` 的外层包装结构，前端的 `axios` 拦截器中需要相应适配。

---

## 1. 日程模块 (Schedules)

### 1.1 获取所有日程
- **接口路径**: `GET /api/schedules`
- **响应参数**:
  ```json
  [
    {
      "id": "s1",
      "title": "晨间阅读",
      "detail": "阅读第一章",
      "startTime": "07:00",
      "endTime": "08:00",
      "completed": true,
      "isTodo": false
    }
  ]
  ```

### 1.2 创建新日程
- **接口路径**: `POST /api/schedules`
- **请求参数**: 
  (同响应参数，但不包含 `id`)
- **响应参数**: 
  创建成功后的对象（需包含后端生成的 `id`）

### 1.3 删除日程
- **请求方法**: `DELETE`
- **请求路径**: `/api/schedules/:id`
- **响应内容**: 返回 204 No Content

---

## 2. 待办事项模块 (Todos)

### 2.1 获取待办列表
- **接口路径**: `GET /api/todos`
- **响应参数**:
  ```json
  [
    {
      "id": "t1",
      "title": "完成项目重构",
      "detail": "包含接口文档编写",
      "deadline": "23:59",
      "completed": false,
      "icon": "lucide:circle"
    }
  ]
  ```

### 2.2 创建待办事项
- **接口路径**: `POST /api/todos`
- **请求参数**: 
  (同响应参数，但不包含 `id`)
- **响应参数**: 
  创建成功后的对象（需包含后端生成的 `id`）

### 2.3 更新待办状态 (如切换完成状态)
- **接口路径**: `PATCH /api/todos/:id`
- **请求参数**:
  ```json
  {
    "completed": true
  }
  ```
- **响应参数**: 
  更新后的完整 Todo 对象

### 2.4 删除待办
- **请求方法**: `DELETE`
- **请求路径**: `/api/todos/:id`
- **响应内容**: 返回 204 No Content

---

## 3. 随笔模块 (Essays)

### 3.1 获取随笔列表
- **接口路径**: `GET /api/essays`
- **响应参数**:
  ```json
  [
    {
      "id": "e1",
      "title": "关于架构的一些思考",
      "content": "使用 API 驱动的好处在于...",
      "category": "Thoughts",
      "createdAt": "2023-10-27T10:00:00.000Z"
    }
  ]
  ```

### 3.2 创建随笔
- **接口路径**: `POST /api/essays`
- **请求参数**:
  ```json
  {
    "title": "关于架构的一些思考",
    "content": "使用 API 驱动的好处在于...",
    "category": "Thoughts",
    "createdAt": "2023-10-27T10:00:00.000Z"
  }
  ```
- **响应参数**:
  创建成功后的对象（需包含后端生成的 `id`）

### 3.3 删除随笔
- **请求方法**: `DELETE`
- **请求路径**: `/api/essays/:id`
- **响应内容**: 返回 204 No Content

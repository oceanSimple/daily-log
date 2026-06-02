import { http, HttpResponse } from 'msw'
import { schedulesData as initialSchedules } from './data/schedules'
import { todosData as initialTodos } from './data/todos'
import { essaysData as initialEssays } from './data/essays'

// Load from localStorage or use initial data
let schedulesData = JSON.parse(localStorage.getItem('mock_schedules') || 'null') || initialSchedules
let todosData = JSON.parse(localStorage.getItem('mock_todos') || 'null') || initialTodos
let essaysData = JSON.parse(localStorage.getItem('mock_essays') || 'null') || initialEssays

const saveToLocal = () => {
  localStorage.setItem('mock_schedules', JSON.stringify(schedulesData))
  localStorage.setItem('mock_todos', JSON.stringify(todosData))
  localStorage.setItem('mock_essays', JSON.stringify(essaysData))
}

export const handlers = [
  http.get('/api/schedules', () => {
    return HttpResponse.json(schedulesData)
  }),

  http.post('/api/schedules', async ({ request }) => {
    const body = await request.json() as any
    const newSchedule = { ...body, id: `s${Date.now()}` }
    schedulesData.push(newSchedule)
    saveToLocal()
    return HttpResponse.json(newSchedule)
  }),

  http.patch('/api/schedules/:id', async ({ params, request }) => {
    const id = params.id
    const body = await request.json() as { completed: boolean }
    const schedule = schedulesData.find((s: any) => s.id === id)
    if (schedule) {
      schedule.completed = body.completed
      saveToLocal()
      return HttpResponse.json(schedule)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete('/api/schedules/:id', ({ params }) => {
    const id = params.id
    const index = schedulesData.findIndex((s: any) => s.id === id)
    if (index !== -1) {
      schedulesData.splice(index, 1)
      saveToLocal()
      return new HttpResponse(null, { status: 204 })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.get('/api/todos', () => {
    return HttpResponse.json(todosData)
  }),

  http.post('/api/todos', async ({ request }) => {
    const body = await request.json() as any
    const newTodo = { ...body, id: `t${Date.now()}` }
    todosData.push(newTodo)
    saveToLocal()
    return HttpResponse.json(newTodo)
  }),

  http.patch('/api/todos/:id', async ({ params, request }) => {
    const id = params.id
    const body = await request.json() as { completed: boolean }
    const todo = todosData.find((t: any) => t.id === id)
    if (todo) {
      todo.completed = body.completed
      saveToLocal()
      return HttpResponse.json(todo)
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete('/api/todos/:id', ({ params }) => {
    const id = params.id
    const index = todosData.findIndex((t: any) => t.id === id)
    if (index !== -1) {
      todosData.splice(index, 1)
      saveToLocal()
      return new HttpResponse(null, { status: 204 })
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.get('/api/essays', () => {
    return HttpResponse.json(essaysData)
  }),

  http.post('/api/essays', async ({ request }) => {
    const body = await request.json() as any
    const newEssay = { ...body, id: `e${Date.now()}` }
    essaysData.unshift(newEssay)
    saveToLocal()
    return HttpResponse.json(newEssay)
  }),

  http.delete('/api/essays/:id', ({ params }) => {
    const id = params.id
    const index = essaysData.findIndex((e: any) => e.id === id)
    if (index !== -1) {
      essaysData.splice(index, 1)
      saveToLocal()
      return new HttpResponse(null, { status: 204 })
    }
    return new HttpResponse(null, { status: 404 })
  })
]

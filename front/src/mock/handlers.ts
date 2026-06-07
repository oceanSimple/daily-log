import { http, HttpResponse } from 'msw'
import { schedulesData as initialSchedules } from './data/schedules'
import { todosData as initialTodos } from './data/todos'
import { essaysData as initialEssays } from './data/essays'

// Load from localStorage or use initial data
let schedulesData = JSON.parse(localStorage.getItem('mock_schedules') || 'null') || initialSchedules
let todosData = JSON.parse(localStorage.getItem('mock_todos') || 'null') || initialTodos
let essaysData = JSON.parse(localStorage.getItem('mock_essays') || 'null') || initialEssays
let passwordVaultMeta = JSON.parse(localStorage.getItem('mock_password_vault_meta') || 'null') || { initialized: false }
let passwordEntries = JSON.parse(localStorage.getItem('mock_password_entries') || 'null') || []

const saveToLocal = () => {
  localStorage.setItem('mock_schedules', JSON.stringify(schedulesData))
  localStorage.setItem('mock_todos', JSON.stringify(todosData))
  localStorage.setItem('mock_essays', JSON.stringify(essaysData))
  localStorage.setItem('mock_password_vault_meta', JSON.stringify(passwordVaultMeta))
  localStorage.setItem('mock_password_entries', JSON.stringify(passwordEntries))
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
  }),

  http.get('/api/password-vault', () => {
    return HttpResponse.json(passwordVaultMeta)
  }),

  http.post('/api/password-vault', async ({ request }) => {
    passwordVaultMeta = await request.json()
    passwordEntries = []
    saveToLocal()
    return HttpResponse.json(passwordVaultMeta)
  }),

  http.get('/api/passwords', () => {
    return HttpResponse.json(passwordEntries)
  }),

  http.post('/api/passwords', async ({ request }) => {
    const body = await request.json() as any
    const newEntry = { ...body, id: `p${Date.now()}` }
    passwordEntries.unshift(newEntry)
    saveToLocal()
    return HttpResponse.json(newEntry)
  }),

  http.patch('/api/passwords/:id', async ({ params, request }) => {
    const id = params.id
    const body = await request.json() as any
    const index = passwordEntries.findIndex((entry: any) => entry.id === id)
    if (index !== -1) {
      passwordEntries[index] = { ...body, id }
      saveToLocal()
      return HttpResponse.json(passwordEntries[index])
    }
    return new HttpResponse(null, { status: 404 })
  }),

  http.delete('/api/passwords/:id', ({ params }) => {
    const id = params.id
    const index = passwordEntries.findIndex((entry: any) => entry.id === id)
    if (index !== -1) {
      passwordEntries.splice(index, 1)
      saveToLocal()
      return new HttpResponse(null, { status: 204 })
    }
    return new HttpResponse(null, { status: 404 })
  })
]

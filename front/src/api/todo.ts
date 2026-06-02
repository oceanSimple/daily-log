import api from './index'
import type { Todo } from '../types'

export const getTodos = () => {
  return api.get<any, Todo[]>('/todos')
}

export const toggleTodo = (id: string, completed: boolean) => {
  return api.patch<any, Todo>(`/todos/${id}`, { completed })
}

export const addTodo = (data: Omit<Todo, 'id'>) => {
  return api.post<any, Todo>('/todos', data)
}

export const deleteTodo = (id: string) => {
  return api.delete<any, void>(`/todos/${id}`)
}

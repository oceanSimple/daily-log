import api from './index'
import type { Schedule } from '../types'

export const getSchedules = () => {
  return api.get<any, Schedule[]>('/schedules')
}

export const addSchedule = (data: Omit<Schedule, 'id'>) => {
  return api.post<any, Schedule>('/schedules', data)
}

export const toggleSchedule = (id: string, completed: boolean) => {
  return api.patch<any, Schedule>(`/schedules/${id}`, { completed })
}

export const deleteSchedule = (id: string) => {
  return api.delete<any, void>(`/schedules/${id}`)
}

import api from './index'
import type { Essay } from '../types'

export const getEssays = () => {
  return api.get<any, Essay[]>('/essays')
}

export const addEssay = (data: Omit<Essay, 'id'>) => {
  return api.post<any, Essay>('/essays', data)
}

export const deleteEssay = (id: string) => {
  return api.delete<any, void>(`/essays/${id}`)
}

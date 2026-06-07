import api from './index'
import type { EncryptedPasswordEntry, PasswordVaultMeta } from '../types'

export const getPasswordVaultMeta = () => {
  return api.get<any, PasswordVaultMeta>('/password-vault')
}

export const initializePasswordVault = (data: PasswordVaultMeta) => {
  return api.post<any, PasswordVaultMeta>('/password-vault', data)
}

export const getEncryptedPasswords = () => {
  return api.get<any, EncryptedPasswordEntry[]>('/passwords')
}

export const addEncryptedPassword = (data: Omit<EncryptedPasswordEntry, 'id'>) => {
  return api.post<any, EncryptedPasswordEntry>('/passwords', data)
}

export const updateEncryptedPassword = (id: string, data: Omit<EncryptedPasswordEntry, 'id'>) => {
  return api.patch<any, EncryptedPasswordEntry>(`/passwords/${id}`, data)
}

export const deleteEncryptedPassword = (id: string) => {
  return api.delete<any, void>(`/passwords/${id}`)
}

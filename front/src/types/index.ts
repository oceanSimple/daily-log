// 日程
export interface Schedule {
  id: string
  title: string
  detail: string
  startTime: string   // "HH:mm"
  endTime: string     // "HH:mm"
  completed: boolean
  isTodo?: boolean
}

// 待办事项
export interface Todo {
  id: string
  title: string
  detail: string
  deadline: string    // "HH:mm", 默认 "23:59"
  completed: boolean
  icon: string        // iconfont 图标名
}

// 随笔
export interface Essay {
  id: string
  title: string
  content: string
  category: string    // "Thoughts" | "Summary" | ...
  createdAt: string   // ISO datetime
}

export interface PasswordVaultMeta {
  initialized: boolean
  salt?: string
  iterations?: number
  verifierCiphertext?: string
  verifierIv?: string
  kdf?: 'PBKDF2-SHA256'
  cipher?: 'AES-GCM-256'
}

export interface EncryptedPasswordEntry {
  id: string
  ciphertext: string
  iv: string
  createdAt: string
  updatedAt: string
}

export interface PasswordEntry {
  id: string
  title: string
  username: string
  password: string
  url: string
  notes: string
  createdAt: string
  updatedAt: string
}

export type CreatePasswordInput = Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt'>
export type UpdatePasswordInput = CreatePasswordInput

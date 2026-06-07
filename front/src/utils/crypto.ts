const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

export const VAULT_KDF = 'PBKDF2-SHA256' as const
export const VAULT_CIPHER = 'AES-GCM-256' as const
export const VAULT_ITERATIONS = 310_000
export const VAULT_VERIFIER = 'daily-log-password-vault'

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

const base64ToBytes = (base64: string) => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes
}

export const generateSalt = () => {
  const salt = new Uint8Array(16)
  crypto.getRandomValues(salt)
  return bytesToBase64(salt)
}

const generateIv = () => {
  const iv = new Uint8Array(12)
  crypto.getRandomValues(iv)
  return iv
}

export const deriveVaultKey = async (rootPassword: string, salt: string, iterations: number) => {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(rootPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: base64ToBytes(salt),
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export const encryptText = async (key: CryptoKey, text: string) => {
  const iv = generateIv()
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    textEncoder.encode(text)
  )

  return {
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv)
  }
}

export const decryptText = async (key: CryptoKey, ciphertext: string, iv: string) => {
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(iv) },
    key,
    base64ToBytes(ciphertext)
  )

  return textDecoder.decode(plaintext)
}

export const encryptJson = async <T>(key: CryptoKey, value: T) => {
  return encryptText(key, JSON.stringify(value))
}

export const decryptJson = async <T>(key: CryptoKey, ciphertext: string, iv: string) => {
  return JSON.parse(await decryptText(key, ciphertext, iv)) as T
}

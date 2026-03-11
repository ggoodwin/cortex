export interface UserPayload {
  _type: 'user'
  username: string
  password_hash: string
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  username: string
}

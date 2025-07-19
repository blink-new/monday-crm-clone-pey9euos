import { blink } from '../lib/blink'
import type { User } from '../lib/blink'

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    try {
      const user = await blink.auth.me()
      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        avatar: user.avatar,
        role: 'admin', // Default role for now
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  static async updateProfile(data: Partial<User>) {
    try {
      await blink.auth.updateMe({
        displayName: data.displayName,
        avatar: data.avatar
      })
      return true
    } catch (error) {
      console.error('Failed to update profile:', error)
      return false
    }
  }

  static async login(redirectUrl?: string) {
    blink.auth.login(redirectUrl)
  }

  static async logout(redirectUrl?: string) {
    blink.auth.logout(redirectUrl)
  }

  static isAuthenticated(): boolean {
    return blink.auth.isAuthenticated()
  }

  static onAuthStateChanged(callback: (state: {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
  }) => void) {
    return blink.auth.onAuthStateChanged(async (state) => {
      let user: User | null = null
      
      if (state.user) {
        user = {
          id: state.user.id,
          email: state.user.email,
          displayName: state.user.displayName || state.user.email.split('@')[0],
          avatar: state.user.avatar,
          role: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }

      callback({
        user,
        isLoading: state.isLoading,
        isAuthenticated: state.isAuthenticated
      })
    })
  }
}
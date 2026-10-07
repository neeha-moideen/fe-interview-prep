const KEY = 'fe-interview-prep:has-session'

export const sessionHint = {
  has(): boolean {
    try {
      return window.localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  },
  set() {
    try {
      window.localStorage.setItem(KEY, '1')
    } catch {
      return
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      return
    }
  },
}

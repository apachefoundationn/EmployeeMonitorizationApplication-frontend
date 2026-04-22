const AUTH_KEY = 'ttas.auth'

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null')
  } catch {
    return null
  }
}

export function setSession(session) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(AUTH_KEY)
}


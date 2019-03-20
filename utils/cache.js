const UserKey = 'User' 
const LoginStateKey = 'LoginState'

export function loadLoginState () {
  return JSON.parse(localStorage.getItem(LoginStateKey)) || false
}

export function saveLoginState (state) {
  localStorage.setItem(LoginStateKey, JSON.stringify(state))
  return userInfo
}

export function removeLoginState () {
  localStorage.removeItem(LoginStateKey)
  return false
}

export function loadUser () {
  return JSON.parse(localStorage.getItem(UserKey))
}

export function saveUser (userInfo) {
  // localStorage.setItem(UserKey, JSON.stringify(userInfo))
  return userInfo
}

export function removeUser () {
  localStorage.removeItem(UserKey)
  return {}
}
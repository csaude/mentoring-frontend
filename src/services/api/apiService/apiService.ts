import axios from 'axios'
import { ENV } from 'src/config/env'

const instance = axios.create({
  baseURL: ENV.API_BASE_URL,
  responseType: 'json',
  validateStatus(status) {
    return status >= 200 && status < 300
  },
})

function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('username')
  localStorage.removeItem('userInfo')
  localStorage.removeItem('tokenExpiration')
  window.location.reload()
}

function fixNextTokenExpirationTime() {
  localStorage.setItem(
    'tokenExpiration',
    String(Date.now() + ENV.ACCESS_TOKEN_TTL)
  )
}

instance.interceptors.request.use(
  (request) => {
    const userLogged = localStorage.getItem('userInfo')

    request.headers = {
      ...(request.headers ?? {}),
      Accept: 'application/json',
    }

    if (request.url === ENV.REFRESH_TOKEN_ENDPOINT) {
      delete (request.headers as any).Authorization
      return request
    }

    if (userLogged && userLogged !== 'null') {
      const tokenExpiration = localStorage.getItem('tokenExpiration')
      const now = Date.now()

      if (tokenExpiration && now < Number(tokenExpiration)) {
        fixNextTokenExpirationTime()
      } else {
        localStorage.setItem('tokenExpiration', '0')
        logout()
        return Promise.reject(
          new axios.Cancel('Token expirado (client-side)')
        )
      }

      const token = localStorage.getItem('access_token')
      if (token) {
        ;(request.headers as any).Authorization = `Bearer ${token}`
      } else {
        delete (request.headers as any).Authorization
      }
    } else {
      delete (request.headers as any).Authorization
    }

    return request
  },
  (error) => Promise.reject(error)
)

export default () => instance

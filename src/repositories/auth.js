import api from '@/services/api'

export const authRepository = {
  login: (email, password) =>
    api.post('/auth/jwt/create/', { email, password }).then((r) => r.data),

  getMe: () =>
    api.get('/auth/users/me/').then((r) => r.data),

  refreshToken: (refresh) =>
    api.post('/auth/jwt/refresh/', { refresh }).then((r) => r.data),

  changePassword: (current_password, new_password, re_new_password) =>
    api.post('/auth/users/set_password/', { current_password, new_password, re_new_password }),

  resetPasswordRequest: (email) =>
    api.post('/auth/users/reset_password/', { email }),
}

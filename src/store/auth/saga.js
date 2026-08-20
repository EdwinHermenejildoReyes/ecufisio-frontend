import { call, put, takeLatest } from 'redux-saga/effects'
import { loginRequest, loginSuccess, loginFailure } from './slices'
import { authRepository } from '@/repositories/auth'

function* handleLogin(action) {
  try {
    const { email, password } = action.payload
    const { access, refresh } = yield call(authRepository.login, email, password)
    const user = yield call(authRepository.getMe)
    yield put(loginSuccess({ user, access, refresh }))

    const rol = user.rol
    if (rol === 'paciente') window.location.href = '/paciente'
    else window.location.href = '/dashboard'
  } catch (error) {
    const msg = error?.response?.data?.detail || 'Credenciales incorrectas'
    yield put(loginFailure(msg))
  }
}

export default function* authSaga() {
  yield takeLatest('auth/LOGIN_REQUEST', handleLogin)
}

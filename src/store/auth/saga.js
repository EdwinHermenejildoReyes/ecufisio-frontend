import { call, put, takeLatest } from 'redux-saga/effects'
import {
  loginRequest, loginSuccess, loginFailure,
  registerRequest, registerSuccess, registerFailure,
} from './slices'
import { authRepository } from '@/repositories/auth'

function* handleLogin(action) {
  try {
    const { email, password } = action.payload
    const { access, refresh } = yield call(authRepository.login, email, password)
    const user = yield call(authRepository.getMe)
    yield put(loginSuccess({ user, access, refresh }))

    if (user.rol === 'paciente') window.location.href = '/paciente'
    else window.location.href = '/dashboard'
  } catch (error) {
    const msg = error?.response?.data?.detail || 'Credenciales incorrectas'
    yield put(loginFailure(msg))
  }
}

function* handleRegister(action) {
  try {
    const { nombres, apellidos, email, telefono, password, re_password } = action.payload
    yield call(authRepository.register, { nombres, apellidos, email, telefono, password, re_password })
    yield put(registerSuccess())

    // Auto-login tras el registro
    const { access, refresh } = yield call(authRepository.login, email, password)
    const user = yield call(authRepository.getMe)
    yield put(loginSuccess({ user, access, refresh }))

    window.location.href = '/dashboard'
  } catch (error) {
    const data = error?.response?.data
    let msg = 'No se pudo completar el registro'
    if (data?.email)           msg = `Correo: ${data.email[0]}`
    else if (data?.password)   msg = `Contraseña: ${data.password[0]}`
    else if (data?.non_field_errors) msg = data.non_field_errors[0]
    else if (data?.detail)     msg = data.detail
    yield put(registerFailure(msg))
  }
}

export default function* authSaga() {
  yield takeLatest('auth/LOGIN_REQUEST', handleLogin)
  yield takeLatest('auth/REGISTER_REQUEST', handleRegister)
}

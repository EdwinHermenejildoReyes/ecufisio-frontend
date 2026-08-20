import { all } from 'redux-saga/effects'
import authSaga from '@/store/auth/saga'

export default function* rootSaga() {
  yield all([
    authSaga(),
    // agendaSaga(),
    // pacientesSaga(),
  ])
}

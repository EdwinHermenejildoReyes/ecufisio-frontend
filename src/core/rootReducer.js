import { combineReducers } from '@reduxjs/toolkit'
import authReducer from '@/store/auth/slices'

const rootReducer = combineReducers({
  auth: authReducer,
  // agenda: agendaReducer,
  // pacientes: pacientesReducer,
})

export default rootReducer

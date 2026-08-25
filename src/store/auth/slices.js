import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    loginRequest(state) {
      state.loading = true
      state.error = null
    },
    loginSuccess(state, action) {
      state.user = action.payload.user
      state.accessToken = action.payload.access
      state.refreshToken = action.payload.refresh
      state.isAuthenticated = true
      state.loading = false
    },
    loginFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    registerRequest(state) {
      state.loading = true
      state.error = null
    },
    registerSuccess(state) {
      state.loading = false
    },
    registerFailure(state, action) {
      state.loading = false
      state.error = action.payload
    },
    setTokens(state, action) {
      if (action.payload.accessToken)  state.accessToken  = action.payload.accessToken
      if (action.payload.refreshToken) state.refreshToken = action.payload.refreshToken
    },
    logoutUser(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
    clearError(state) {
      state.error = null
    },
  },
})

export const {
  loginRequest, loginSuccess, loginFailure,
  registerRequest, registerSuccess, registerFailure,
  setTokens, logoutUser, clearError,
} = authSlice.actions
export default authSlice.reducer

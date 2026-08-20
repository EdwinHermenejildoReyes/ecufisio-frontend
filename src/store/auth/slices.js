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
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken
    },
    logoutUser(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    },
  },
})

export const { loginRequest, loginSuccess, loginFailure, setTokens, logoutUser } = authSlice.actions
export default authSlice.reducer

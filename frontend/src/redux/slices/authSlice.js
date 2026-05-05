import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  requireOTP: false,
  registeredEmail: '',
};

export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return { message: response.data.message, email: response.data.email };
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const verifyOTP = createAsyncThunk('auth/verifyOTP', async (verificationData, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/verify`, verificationData);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

import { reset as resetNotifications } from './notificationSlice';

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  localStorage.removeItem('user');
  thunkAPI.dispatch(resetNotifications());
});

export const updateUserProfile = createAsyncThunk('auth/updateProfile', async (userData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, userData, config);
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    resetOTPState: (state) => {
      state.requireOTP = false;
      state.registeredEmail = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.isLoading = true; })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requireOTP = true;
        state.registeredEmail = action.payload.email;
        state.message = action.payload.message;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => { state.isLoading = true; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requireOTP = false;
        state.user = action.payload;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.requireOTP = false;
        state.registeredEmail = '';
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { reset, resetOTPState } = authSlice.actions;
export default authSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/notifications`;

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  isError: false,
  message: '',
};

// Get notifications
export const getNotifications = createAsyncThunk('notifications/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Mark all as read
export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.put(`${API_URL}/read`, {}, config);
    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});
// Mark single as read
export const markSingleRead = createAsyncThunk('notifications/markSingleRead', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.put(`${API_URL}/${id}/read`, {}, config);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markSingleRead.fulfilled, (state, action) => {
        state.notifications = state.notifications.map(n => 
          n._id === action.payload ? { ...n, isRead: true } : n
        );
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      });
  },
});

export const { addNotification, reset } = notificationSlice.actions;
export default notificationSlice.reducer;

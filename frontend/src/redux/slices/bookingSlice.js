import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/bookings`;

const initialState = {
  bookings: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const getMyBookings = createAsyncThunk('bookings/getMyBookings', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/mybookings`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Provider gets incoming bookings
export const getProviderBookings = createAsyncThunk('bookings/getProviderBookings', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/provider`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({id, status}, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}/status`, { status }, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const createBooking = createAsyncThunk('bookings/create', async (bookingData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, bookingData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    reset: (state) => initialState,
    addBooking: (state, action) => {
      state.bookings.unshift(action.payload);
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyBookings.pending, (state) => { state.isLoading = true; })
      .addCase(getMyBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(getMyBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProviderBookings.pending, (state) => { state.isLoading = true; })
      .addCase(getProviderBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(getProviderBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.bookings.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
            state.bookings[index] = action.payload;
        }
      });
  },
});

export const { reset, addBooking, updateBooking } = bookingSlice.actions;
export default bookingSlice.reducer;

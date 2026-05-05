import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Create Review
export const createReview = createAsyncThunk('reviews/create', async (reviewData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/reviews`, reviewData, config);
    return data;
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

// Get Service Reviews
export const getServiceReviews = createAsyncThunk('reviews/getServiceReviews', async (serviceId, thunkAPI) => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/reviews/service/${serviceId}`);
    return data;
  } catch (error) {
    const message = error.response && error.response.data.message ? error.response.data.message : error.message;
    return thunkAPI.rejectWithValue(message);
  }
});

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: ''
  },
  reducers: {
    resetReviewState: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReview.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.reviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getServiceReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServiceReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload;
      })
      .addCase(getServiceReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;

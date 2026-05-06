import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/wellness`;

const initialState = {
  plan: null,
  isLoading: false,
  isError: false,
  message: '',
};

export const getWellnessPlan = createAsyncThunk('wellness/getPlan', async (petId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/${petId}`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const updateMilestone = createAsyncThunk('wellness/updateMilestone', async ({ petId, milestoneId, isCompleted }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${petId}/milestone/${milestoneId}`, { isCompleted }, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const wellnessSlice = createSlice({
  name: 'wellness',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWellnessPlan.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getWellnessPlan.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plan = action.payload;
      })
      .addCase(getWellnessPlan.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.plan = action.payload;
      });
  },
});

export const { reset } = wellnessSlice.actions;
export default wellnessSlice.reducer;

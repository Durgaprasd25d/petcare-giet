import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/services`;

const initialState = {
  services: [],
  myServices: [],
  isLoading: false,
  isError: false,
  message: '',
};

// Get all active services (for browsing)
export const getAllServices = createAsyncThunk('services/getAll', async (category, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { 
      headers: { Authorization: `Bearer ${token}` },
      params: category ? { category } : {}
    };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Get provider's own services
export const getProviderServices = createAsyncThunk('services/getProvider', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/provider`, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Create a new service
export const createService = createAsyncThunk('services/create', async (serviceData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, serviceData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Update a service
export const updateService = createAsyncThunk('services/update', async ({ id, serviceData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, serviceData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// Delete a service
export const deleteService = createAsyncThunk('services/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`${API_URL}/${id}`, config);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllServices.pending, (state) => { state.isLoading = true; })
      .addCase(getAllServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(getAllServices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProviderServices.pending, (state) => { state.isLoading = true; })
      .addCase(getProviderServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myServices = action.payload;
      })
      .addCase(getProviderServices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.myServices.push(action.payload);
      })
      .addCase(updateService.fulfilled, (state, action) => {
        const index = state.myServices.findIndex(s => s._id === action.payload._id);
        if (index !== -1) {
          state.myServices[index] = action.payload;
        }
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.myServices = state.myServices.filter(s => s._id !== action.payload);
      });
  },
});

export const { reset } = serviceSlice.actions;
export default serviceSlice.reducer;

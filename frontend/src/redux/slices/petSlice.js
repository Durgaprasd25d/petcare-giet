import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/pets`;

const initialState = {
  pets: [],
  isLoading: false,
  isError: false,
  message: '',
};

export const getPets = createAsyncThunk('pets/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const addPet = createAsyncThunk('pets/add', async (petData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, petData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const updatePet = createAsyncThunk('pets/update', async ({ id, petData }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(`${API_URL}/${id}`, petData, config);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const deletePet = createAsyncThunk('pets/delete', async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    await axios.delete(`${API_URL}/${id}`, config);
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const petSlice = createSlice({
  name: 'pets',
  initialState,
  reducers: {
    reset: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPets.pending, (state) => { state.isLoading = true; })
      .addCase(getPets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = action.payload;
      })
      .addCase(getPets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addPet.fulfilled, (state, action) => {
        state.pets.push(action.payload);
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.pets = state.pets.map(pet => pet._id === action.payload._id ? action.payload : pet);
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.pets = state.pets.filter(pet => pet._id !== action.payload);
      });
  },
});

export const { reset } = petSlice.actions;
export default petSlice.reducer;

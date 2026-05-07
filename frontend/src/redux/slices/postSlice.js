import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/posts`;

const getConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.user.token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const fetchPosts = createAsyncThunk('posts/fetch', async (_, thunkAPI) => {
  try {
    const { data } = await axios.get(API_URL, getConfig(thunkAPI));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const createPost = createAsyncThunk('posts/create', async (postData, thunkAPI) => {
  try {
    const { data } = await axios.post(API_URL, postData, getConfig(thunkAPI));
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const toggleLike = createAsyncThunk('posts/like', async (id, thunkAPI) => {
  try {
    const { data } = await axios.put(`${API_URL}/${id}/like`, {}, getConfig(thunkAPI));
    return { id, likes: data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const addComment = createAsyncThunk('posts/comment', async ({ id, text }, thunkAPI) => {
  try {
    const { data } = await axios.post(`${API_URL}/${id}/comment`, { text }, getConfig(thunkAPI));
    return { id, comments: data };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

export const deletePost = createAsyncThunk('posts/delete', async (id, thunkAPI) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getConfig(thunkAPI));
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
  }
});

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    isLoading: false,
    isError: false,
    message: ''
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.id);
        if (post) post.likes = action.payload.likes;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find(p => p._id === action.payload.id);
        if (post) post.comments = action.payload.comments;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(p => p._id !== action.payload);
      });
  }
});

export default postSlice.reducer;

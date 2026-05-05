import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import petReducer from './slices/petSlice';
import bookingReducer from './slices/bookingSlice';
import serviceReducer from './slices/serviceSlice';
import reviewReducer from './slices/reviewSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pets: petReducer,
    bookings: bookingReducer,
    services: serviceReducer,
    reviews: reviewReducer,
    notifications: notificationReducer,
  },
});

// redux/slices/videoSlice.js
import { getLocalStorage, setLocalStorage } from '@/utills/LocalStorageUtills';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stream: null,
  roomData: getLocalStorage("roomData") || null,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    setStream(state, action) {
      state.stream = action.payload;
    },
    setRoomData(state, action) {
      state.roomData = action.payload;
      setLocalStorage("roomData", action.payload);
    },
    clearStream(state) {
      state.stream = null;
    },
  },
});

export const { setStream, clearStream, setRoomData } = videoSlice.actions;
export default videoSlice;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { store } from '../index';

// Infer RootState type from store
type RootState = ReturnType<typeof store.getState>;

// Định nghĩa state type
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

// Khởi tạo state
const initialState: CounterState = {
  value: 0,
  status: 'idle',
};

// Tạo slice với reducers
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    setStatus: (state, action: PayloadAction<CounterState['status']>) => {
      state.status = action.payload;
    },
  },
});

// Export actions
export const { increment, decrement, incrementByAmount, setStatus } = counterSlice.actions;

// Export selectors
export const selectCount = (state: RootState) => state.counter.value;
export const selectStatus = (state: RootState) => state.counter.status;

// Export reducer
export default counterSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState { /* fields */ }

interface InboxTaskCountsResponse { /* fields */ }
interface CountriesResponse { /* fields */ }

let initialState: any = {
  users: [{}],
  taskCount: {},
  countries : [{}]
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<UserState>) => {
      state.users = { ...action.payload };
    },
    addTaskCount: (state, action: PayloadAction<InboxTaskCountsResponse>) => {
      state.taskCount = { ...action.payload };
    },
    addCountries: (state, action: PayloadAction<CountriesResponse>) => {
      state.countries = action.payload ;
    }
  },
});

export const { addUser, addTaskCount, addCountries } = userSlice.actions;
export default userSlice.reducer;

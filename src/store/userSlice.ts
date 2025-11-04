import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState { /* fields */ }

interface InboxTaskCountsResponse { /* fields */ }
interface CountriesResponse { /* fields */ }
interface SelectedRecords { /* fields */ }

let initialState: any = {
  users: [{}],
  taskCount: {},
  countries : [{}],
  selectedRecords: [{}]
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
    },
    resetRecords: (state, action: PayloadAction<SelectedRecords>) => {
      state.selectedRecords = action.payload ;
    }
  },
});

export const { addUser, addTaskCount, addCountries, resetRecords } = userSlice.actions;
export default userSlice.reducer;

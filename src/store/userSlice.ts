import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UserState { /* fields */ }

interface InboxTaskCountsResponse { /* fields */ }
interface CountriesResponse { /* fields */ }
interface SelectedRecords { /* fields */ }
interface UserApprovals { /* fields */ }
interface TaskDetails { /* fields */ }

let initialState: any = {
  users: [{}],
  taskCount: {},
  countries : [{}],
  selectedRecords: [{}],
  userApprovals: [{}],
  taskDetails: {}
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
    ,
    userApprovalRecord: (state, action: PayloadAction<UserApprovals>) => {
      state.userApprovals = action.payload ;
    },
    taskId: (state, action: PayloadAction<TaskDetails>) => {
      state.taskDetails = action.payload ;
    }
  },
});

export const { addUser, addTaskCount, addCountries, resetRecords, userApprovalRecord, taskId } = userSlice.actions;
export default userSlice.reducer;

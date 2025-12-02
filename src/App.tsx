import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Drafts from "./pages/Dashboard/Drafts";
import InProgress from "./pages/Dashboard/InProgress";
import AwaitingResults from "./pages/Dashboard/AwaitingResults";
import Completed from "./pages/Dashboard/Completed";
import Cancelled from "./pages/Dashboard/Cancelled";
import Trash from "./pages/Dashboard/Trash";
import All from "./pages/Dashboard/All";
import PricingDashboard from "./pages/Pricing/PricingDashboard";
import GroupsData from "./pages/Pricing/GroupsData";
import PriceListsData from "./pages/Pricing/PriceListsData";
import PricingAccount from "./pages/Pricing/Accounts/Account";
import CompletedTasks from "./pages/Pricing/ERPLoad/CompletedTasks";
import Advanced from "./pages/Reports/Advanced";
import BasicReports from "./pages/Reports/BasicReports";
import Explorer from "./pages/Reports/Explorer";
import SIA from "./pages/Reports/SIA";

import Segmentation from "./pages/Strategy/Segmentation";
import SegmentationGroup from "./pages/Strategy/SegmentationGroup";
import TargetsAndFloors from "./pages/Strategy/TargetsAndFloors";
import ApprovalControls from "./pages/Strategy/ApprovalControls";
import Competitors from "./pages/Strategy/Competitors";
import Promotions from "./pages/Strategy/Promotions";
import EditSegmentation from "./pages/Strategy/EditSegmentation";

import EmailAll from "./pages/Email/EmailAll";
// import Archive from "./pages/Email/Archive";
// import Unread from "./pages/Email/Unread";

import Users from "./pages/Admin/Users";
import Translation from "./pages/Admin/Translation";
import CountrySettings from "./pages/Admin/CountrySettings";
import Templates from "./pages/Admin/Templates";
import EditApprovalRoles from "./pages/Admin/EditApprovalRoles";
import EditColumnPermissions from "./pages/Admin/EditColumnPermissions";

import AwaitingLoad from "./pages/Pricing/ERPLoad/AwaitingLoad";
import ManuallyUpdating from "./pages/Pricing/ERPLoad/ManuallyUpdating";
import LettingExpire from "./pages/Pricing/ERPLoad/LettingExpire";
import RecentlyLoaded from "./pages/Pricing/ERPLoad/RecentlyLoaded";
import TaskDetailsPage from "./pages/Pricing/TaskDetailsPage";
import GroupConfirmSelection from "./pages/Pricing/GroupConfirmSelection";
import Approvals from "./pages/Pricing/Approvals";
import ConfirmSelectionAccount from "./pages/Pricing/Accounts/ConfirmSelection";
import ConfirmSelectionMultiple from "./pages/Pricing/Accounts/ConfirmSelectionMultiple";
import NewCustomer from "./pages/Pricing/Accounts/NewCustomer";
import TaskDetails from "./pages/Pricing/Accounts/TaskDetails";
import PricingSite from "./pages/Pricing/Accounts/Site";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import PricingTable from "./pages/Pricing/PricingTable";
import AddItem from "./pages/Pricing/AddItem";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import UserSettings from "./pages/Settings/Settings";

import Currency from "./pages/AdminPages/Currency";
import CurrentCurrency from "./pages/AdminPages/CurrentCurrency";
import CurrencyHistory from "./pages/AdminPages/CurrencyHistory";
import UpdateCurrency from "./pages/AdminPages/UpdateCurrency";

export default function App() {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router>
            <ScrollToTop />
            <Routes>
              {/* Dashboard Layout */}
              <Route element={<AppLayout />}>
                <Route index path="/home" element={<Home />} />
                <Route index path="/drafts" element={<Drafts />} />
                <Route index path="/inprogress" element={<InProgress />} />
                <Route index path="/awaitingresults" element={<AwaitingResults />} />
                <Route index path="/completed" element={<Completed />} />
                <Route index path="/cancelled" element={<Cancelled />} />
                <Route index path="/trash" element={<Trash />} />
                <Route index path="/all" element={<All />} />
                <Route index path="/pricingDashboard" element={<PricingDashboard />} />
                <Route index path="/taskDetailsPage" element={<TaskDetailsPage />} />
                <Route index path="/approvals" element={<Approvals />} />
                <Route index path="/pricingAccount" element={<PricingAccount />} />
                <Route index path="/completedTasks" element={<CompletedTasks />} />
                <Route index path="/pricingSite" element={<PricingSite />} />
                <Route index path="/groupsData" element={<GroupsData />} />
                <Route index path="/priceListsData" element={<PriceListsData />} />
                <Route index path="/confirmSelectionAccount" element={<ConfirmSelectionAccount />} />
                <Route index path="/confirmSelectionMultiple" element={<ConfirmSelectionMultiple />} />
                <Route index path="/groupConfirmSelection" element={<GroupConfirmSelection />} />
                
                <Route index path="/newCustomer" element={<NewCustomer />} />
                <Route index path="/taskDetails" element={<TaskDetails />} />
                <Route index path="/pricingTable/:id" element={<PricingTable />} />
                <Route index path="/addItem" element={<AddItem />} />
                <Route index path="/awaitingLoad" element={<AwaitingLoad />} />
                <Route index path="/manuallyUpdating" element={<ManuallyUpdating />} />
                <Route index path="/lettingExpire" element={<LettingExpire />} />
                <Route index path="/recentlyLoaded" element={<RecentlyLoaded />} />
                <Route index path="/advanced" element={<Advanced />} />
                <Route index path="/basicReports" element={<BasicReports />} />
                <Route index path="/explorer" element={<Explorer />} />
                <Route index path="/sia" element={<SIA />} />

                <Route index path="/segmentation" element={<Segmentation />} />
                <Route index path="/segmentationGroup" element={<SegmentationGroup />} />
                <Route index path="/targetsAndFloors" element={<TargetsAndFloors />} />
                <Route index path="/approvalControls" element={<ApprovalControls />} />
                <Route index path="/competitors" element={<Competitors />} />
                <Route index path="/promotions" element={<Promotions />} />
                <Route index path="/editSegmentation" element={<EditSegmentation />} />

                <Route index path="/emailAll" element={<EmailAll />} />
                {/* <Route index path="/unread" element={<Unread />} />
                <Route index path="/archive" element={<Archive />} /> */}

                <Route index path="/users" element={<Users />} />
                <Route index path="/translation" element={<Translation />} />
                <Route index path="/countrySettings" element={<CountrySettings />} />
                <Route index path="/templates" element={<Templates />} />
                <Route index path="/editApprovalRoles" element={<EditApprovalRoles />} />
                <Route index path="/editColumnPermissions" element={<EditColumnPermissions />} />
                 <Route index path="/resetPassword" element={<ResetPassword />} />
                 <Route index path="/UserSettings" element={<UserSettings />} />

                 <Route index path="/currency" element={<Currency />} />
                <Route index path="/currentCurrency" element={<CurrentCurrency />} />
                <Route index path="/currencyHistory" element={<CurrencyHistory />} />
                <Route index path="/updateCurrency" element={<UpdateCurrency /> } />


                {/* Others Page */}
                <Route path="/profile" element={<UserProfiles />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/blank" element={<Blank />} />

                {/* Forms */}
                <Route path="/form-elements" element={<FormElements />} />

                {/* Tables */}
                {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

                {/* Ui Elements */}
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />

                {/* Charts */}
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
              </Route>

              {/* Auth Layout */}
              <Route path="/" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
             

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </PersistGate>
      </Provider>
    </>
  );
}

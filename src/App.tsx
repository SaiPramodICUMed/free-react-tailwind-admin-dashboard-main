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
import PricingSite from "./pages/Pricing/Accounts/Site";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";

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
            <Route index path="/pricingAccount" element={<PricingAccount />} />
            <Route index path="/pricingSite" element={<PricingSite />} />
            <Route index path="/groupsData" element={<GroupsData />} />
            <Route index path="/priceListsData" element={<PriceListsData />} />

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

import { BrowserRouter, Routes, Route } from "react-router-dom";


import Login from "./components/Login";

import CustomerDashboard from "./components/CustomerDashboard";

import VendorDashboard from "./components/VendorDashboard";

import Profile from "./components/Profile";



function App() {


  return (


    <BrowserRouter>


      <Routes>



        {/* Login Page */}

        <Route

          path="/"

          element={<Login />}

        />




        {/* Customer Dashboard */}

        <Route

          path="/customer-dashboard"

          element={<CustomerDashboard />}

        />





        {/* Vendor Dashboard */}

        <Route

          path="/vendor-dashboard"

          element={<VendorDashboard />}

        />





        {/* Profile */}

        <Route

          path="/profile"

          element={<Profile />}

        />



      </Routes>


    </BrowserRouter>


  );


}


export default App;
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";

import CustomerDashboard from "./components/CustomerDashboard";

import VendorDashboard from "./components/VendorDashboard";

import VendorProfile from "./components/VendorProfile";

import CustomerProfile from "./components/customer/CustomerProfile";

import BrowseProducts from "./components/customer/BrowseProducts";

import Cart from "./components/customer/Cart";

import Checkout from "./components/customer/Checkout";

import Wishlist from "./components/customer/Wishlist";
import Orders from "./components/customer/Orders";

import AddProduct from "./components/vendor/AddProduct";

import ManageProducts from "./components/vendor/ManageProducts";




function App() {


  return (


    <BrowserRouter>


      <Routes>

        <Route path="/forgot-password" element={<ForgotPassword />} />



        {/* Login */}

        <Route

          path="/"

          element={<Login />}

        />





        {/* Customer Dashboard */}

        <Route

          path="/customer-dashboard"

          element={<CustomerDashboard />}

        />





        {/* Customer Products */}

        <Route

          path="/customer/products"

          element={<BrowseProducts />}

        />



        {/* Customer Cart */}

        <Route

          path="/customer/cart"

          element={<Cart />}

        />



        {/* Customer Checkout */}

        <Route

          path="/customer/checkout"

          element={<Checkout />}

        />

        <Route
          path="/customer/wishlist"
          element={<Wishlist />}
        />

        <Route path="/customer/orders" element={<Orders />} />





        {/* Customer Profile */}

        <Route

          path="/customer-profile"

          element={<CustomerProfile />}

        />

        <Route path="/customer/profile" element={<CustomerProfile />} />







        {/* Vendor Dashboard */}

        <Route

          path="/vendor-dashboard"

          element={<VendorDashboard />}

        />






        {/* Vendor Profile */}

        <Route

          path="/vendor-profile"

          element={<VendorProfile />}

        />






        {/* Vendor Add Product */}

        <Route

          path="/vendor/add-product"

          element={<AddProduct />}

        />






        {/* Vendor Manage Products */}

        <Route

          path="/vendor/products"

          element={<ManageProducts />}

        />



      </Routes>


    </BrowserRouter>


  );


}


export default App;

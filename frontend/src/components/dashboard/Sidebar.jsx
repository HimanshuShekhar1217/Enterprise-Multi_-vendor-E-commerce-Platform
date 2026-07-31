import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";


function Sidebar() {


  const navigate = useNavigate();




  function logout(){


    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");


    navigate("/");


  }





  return (


    <div className="sidebar">



      <h2>
        🛒 ShopStack
      </h2>




      <button
        onClick={() => navigate("/customer-dashboard")}
      >
        Dashboard
      </button>





      <button>
        Products
      </button>





      <button>
        Orders
      </button>





      <button>
        Customers
      </button>





      <button

        onClick={() => navigate("/profile")}

      >
        Profile
      </button>





      <button

        onClick={logout}

      >
        Logout
      </button>




    </div>


  );


}


export default Sidebar;
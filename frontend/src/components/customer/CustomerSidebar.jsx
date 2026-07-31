import React from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard/Sidebar.css";


function CustomerSidebar(){


    const navigate = useNavigate();



    function logout(){

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");

        navigate("/");

    }




    return(


        <div className="sidebar">


            <h2>
                🛒 ShopStack
            </h2>



            <button
                onClick={() =>
                    navigate("/customer-dashboard")
                }
            >
                🏠 Dashboard
            </button>



            <button>
                🛍 Browse Products
            </button>



            <button>
                🛒 My Cart
            </button>



            <button>
                📦 My Orders
            </button>



            <button>
                ❤️ Wishlist
            </button>



            <button
                onClick={() =>
                    navigate("/profile")
                }
            >
                👤 Profile
            </button>



            <button
                onClick={logout}
            >
                🚪 Logout
            </button>



        </div>


    );


}


export default CustomerSidebar;
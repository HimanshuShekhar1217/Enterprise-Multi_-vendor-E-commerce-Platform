import React from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerSidebar.css";


function CustomerSidebar() {


    const navigate = useNavigate();






    function logout(){


        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("email");


        navigate("/");


    }








    return (


        <div className="customer-sidebar">






            <h2>
                🛒 ShopStack
            </h2>








            <button

                onClick={() => navigate("/customer-dashboard")}

            >

                🏠 Dashboard

            </button>








            <button

                onClick={() => navigate("/customer/products")}

            >

                🛍️ Products

            </button>








            <button>

                🛒 Orders

            </button>








            <button>

                ❤️ Wishlist

            </button>








            <button

                onClick={() => navigate("/customer-profile")}

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
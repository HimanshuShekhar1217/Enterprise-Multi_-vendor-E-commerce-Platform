import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";


function Sidebar() {


    const navigate = useNavigate();


    const role = localStorage.getItem("role");






    function logout(){


        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("email");


        navigate("/");


    }







    function goDashboard(){


        if(role === "VENDOR"){


            navigate("/vendor-dashboard");


        }
        else{


            navigate("/customer-dashboard");


        }


    }







    return (


        <div className="sidebar">





            <h2>

                🛒 ShopStack

            </h2>









            <button

                onClick={goDashboard}

            >

                🏠 Dashboard

            </button>









            {
                role === "VENDOR" && (

                    <>


                        <button

                            onClick={() => navigate("/vendor/products")}

                        >

                            📦 Products

                        </button>






                        <button

                            onClick={() => navigate("/vendor/add-product")}

                        >

                            ➕ Add Product

                        </button>






                        <button>

                            🛒 Orders

                        </button>






                        <button

                            onClick={() => navigate("/vendor-profile")}

                        >

                            🏪 Vendor Profile

                        </button>



                    </>

                )

            }









            {
                role === "CUSTOMER" && (

                    <>


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



                    </>

                )

            }









            <button

                onClick={logout}

            >

                🚪 Logout

            </button>






        </div>


    );


}


export default Sidebar;
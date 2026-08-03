import React from "react";
import CustomerSidebar from "./customer/CustomerSidebar";
import "./customer/CustomerDashboard.css";


function CustomerDashboard() {


    const username = localStorage.getItem("username");



    return (

        <div className="dashboard-container">



            <CustomerSidebar />




            <div className="dashboard-main">





                <div className="dashboard-header">


                    <h1>

                        Welcome back, {username} 👋

                    </h1>



                    <p>

                        Discover premium products and enjoy your shopping experience

                    </p>


                </div>







                <div className="cards">



                    <div className="card">

                        <div className="card-icon">

                            📦

                        </div>


                        <h2>
                            0
                        </h2>


                        <p>
                            My Orders
                        </p>


                    </div>






                    <div className="card">


                        <div className="card-icon">

                            ❤️

                        </div>


                        <h2>

                            0

                        </h2>


                        <p>

                            Wishlist

                        </p>


                    </div>






                    <div className="card">


                        <div className="card-icon">

                            🛒

                        </div>


                        <h2>

                            0

                        </h2>


                        <p>

                            Cart Items

                        </p>


                    </div>







                    <div className="card">


                        <div className="card-icon">

                            ⭐

                        </div>


                        <h2>

                            Active

                        </h2>


                        <p>

                            Account Status

                        </p>


                    </div>


                </div>









                <div className="section-card">



                    <h2>

                        🛍️ Trending Categories

                    </h2>





                    <div className="category-container">



                        <div className="category-card">


                            <img

                                src="/images/laptop.jpg"

                                alt="Laptop"

                            />


                            <h3>

                                Laptops

                            </h3>


                        </div>








                        <div className="category-card">


                            <img

                                src="/images/mobile.jpg"

                                alt="Mobile"

                            />


                            <h3>

                                Mobiles

                            </h3>


                        </div>








                        <div className="category-card">


                            <img

                                src="/images/accessories.jpg"

                                alt="Accessories"

                            />


                            <h3>

                                Accessories

                            </h3>


                        </div>





                    </div>


                </div>









                <div className="section-card">



                    <h2>

                        🔥 Recommended Products

                    </h2>







                    <div className="product-box">





                        <div className="product-card">


                            <img

                                src="/images/laptop.jpg"

                                alt="Gaming Laptop"

                            />



                            <h3>

                                Gaming Laptop

                            </h3>


                            <p>

                                Premium performance laptops

                            </p>


                        </div>









                        <div className="product-card">


                            <img

                                src="/images/mobile.jpg"

                                alt="Smartphone"

                            />



                            <h3>

                                Smartphones

                            </h3>


                            <p>

                                Latest technology devices

                            </p>


                        </div>









                        <div className="product-card">


                            <img

                                src="/images/accessories.jpg"

                                alt="Accessories"

                            />



                            <h3>

                                Accessories

                            </h3>


                            <p>

                                Upgrade your setup

                            </p>


                        </div>





                    </div>




                </div>









                <div className="section-card">



                    <h2>

                        📦 Recent Orders

                    </h2>





                    <div className="empty-orders">


                        No orders yet


                    </div>




                </div>







            </div>





        </div>


    );

}


export default CustomerDashboard;
import Sidebar from "./dashboard/Sidebar";
import "./dashboard/Dashboard.css";


function VendorDashboard() {


    return (

        <div className="dashboard-container">


            <Sidebar />



            <main className="dashboard-main">



                <section className="hero-card">


                    <div>

                        <h1>
                            Welcome back, {localStorage.getItem("username")} 👋
                        </h1>


                        <p>
                            Grow your store, manage products and track your business.
                        </p>

                    </div>



                    <div className="hero-icon">

                        🏪

                    </div>



                </section>







                <section className="stats-grid">



                    <div className="stat-card blue">

                        <span>
                            📦
                        </span>

                        <h2>
                            0
                        </h2>

                        <p>
                            Total Products
                        </p>

                    </div>





                    <div className="stat-card purple">

                        <span>
                            🛒
                        </span>

                        <h2>
                            0
                        </h2>

                        <p>
                            Orders
                        </p>

                    </div>






                    <div className="stat-card green">

                        <span>
                            💰
                        </span>

                        <h2>
                            ₹0
                        </h2>

                        <p>
                            Revenue
                        </p>

                    </div>






                    <div className="stat-card orange">

                        <span>
                            ⭐
                        </span>

                        <h2>
                            5.0
                        </h2>

                        <p>
                            Store Rating
                        </p>

                    </div>



                </section>







                <section className="glass-card">


                    <h2>
                        Store Profile
                    </h2>



                    <div className="profile-content">


                        <div className="store-avatar">

                            🏪

                        </div>



                        <div>

                            <h3>
                                {localStorage.getItem("username")}
                            </h3>


                            <p>
                                Premium Vendor Account
                            </p>


                            <p>
                                📍 Location will appear here
                            </p>


                        </div>


                    </div>


                </section>







                <section className="glass-card">


                    <h2>
                        Quick Actions
                    </h2>



                    <div className="action-grid">


                        <button>
                            ➕ Add Product
                        </button>



                        <button>
                            📦 Manage Products
                        </button>



                        <button>
                            📊 Analytics
                        </button>



                        <button>
                            ⚙ Settings
                        </button>



                    </div>



                </section>





            </main>


        </div>

    );

}


export default VendorDashboard;
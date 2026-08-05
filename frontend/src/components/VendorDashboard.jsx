import Sidebar from "./dashboard/Sidebar";
import "./dashboard/Dashboard.css";

function VendorDashboard() {

    const username = localStorage.getItem("username");

    return (

        <div className="dashboard-container">

            <Sidebar />

            <div className="dashboard-main">

                {/* Header */}

                <div className="dashboard-header">

                    <div>

                        <h1>

                            Vendor Dashboard

                        </h1>

                        <p>

                            Welcome back, <strong>{username}</strong>

                        </p>

                    </div>

                </div>

                {/* Statistics */}

                <div className="cards">

                    <div className="card">

                        <h2>

                            0

                        </h2>

                        <p>

                            Total Products

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            0

                        </h2>

                        <p>

                            Orders

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            ₹0

                        </h2>

                        <p>

                            Revenue

                        </p>

                    </div>

                    <div className="card">

                        <h2>

                            5.0

                        </h2>

                        <p>

                            Store Rating

                        </p>

                    </div>

                </div>

                {/* Store Profile */}

                <div className="section-card">

                    <h2>

                        Store Information

                    </h2>

                    <div className="store-info">

                        <div className="store-logo">

                            🏪

                        </div>

                        <div>

                            <h3>

                                {username}

                            </h3>

                            <p>

                                Premium Vendor Account

                            </p>

                            <p>

                                Location: Kolkata

                            </p>

                        </div>

                    </div>

                </div>

                {/* Quick Actions */}

                <div className="section-card">

                    <h2>

                        Quick Actions

                    </h2>

                    <div className="action-grid">

                        <button>

                            Add Product

                        </button>

                        <button>

                            Manage Products

                        </button>

                        <button>

                            Orders

                        </button>

                        <button>

                            Vendor Profile

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}

export default VendorDashboard;
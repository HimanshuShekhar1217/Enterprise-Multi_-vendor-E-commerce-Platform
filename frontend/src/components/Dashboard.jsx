import React from "react";
import Sidebar from "./dashboard/Sidebar";
import "./dashboard/Dashboard.css";


function Dashboard() {


  return (

    <div className="dashboard-container">


      <Sidebar />



      <div className="dashboard-main">



        <div className="dashboard-header">


          <div>

            <h1>
              Customer Dashboard
            </h1>


            <h3>
              Welcome {localStorage.getItem("username")} 👋
            </h3>


          </div>



          <div className="profile-badge">

            👤 {localStorage.getItem("username")}

          </div>



        </div>






        <div className="cards">



          <div className="card">

            <h2>
              0
            </h2>

            <p>
              🛒 Cart Items
            </p>

          </div>




          <div className="card">

            <h2>
              0
            </h2>

            <p>
              📦 My Orders
            </p>

          </div>





          <div className="card">

            <h2>
              0
            </h2>

            <p>
              ❤️ Wishlist
            </p>

          </div>





          <div className="card">

            <h2>
              0
            </h2>

            <p>
              🚚 Active Shipments
            </p>

          </div>




        </div>







        <div className="recent">


          <h2>
            Recent Orders
          </h2>



          <table>


            <thead>

              <tr>

                <th>
                  Product
                </th>


                <th>
                  Vendor
                </th>


                <th>
                  Status
                </th>


                <th>
                  Price
                </th>


              </tr>


            </thead>




            <tbody>


              <tr>

                <td>
                  No Orders
                </td>


                <td>
                  -
                </td>


                <td>
                  -
                </td>


                <td>
                  -
                </td>


              </tr>


            </tbody>


          </table>



        </div>







        <div className="recent">


          <h2>
            Recommended Products
          </h2>


          <p>
            Products from top vendors will appear here.
          </p>


        </div>




      </div>


    </div>

  );

}


export default Dashboard;
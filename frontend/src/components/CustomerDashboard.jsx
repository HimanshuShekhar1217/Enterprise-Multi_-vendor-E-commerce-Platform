import React from "react";
import CustomerSidebar from "./customer/CustomerSidebar";
import "./dashboard/Dashboard.css";


function CustomerDashboard() {


  return (


    <div className="dashboard-container">



      <CustomerSidebar />




      <div className="dashboard-main">



        <div className="dashboard-header">


          <h1>
            Customer Dashboard
          </h1>


          <h3>
            Welcome {localStorage.getItem("username")} 👋
          </h3>


        </div>






        <div className="cards">



          <div className="card">


            <h2>
              📦 0
            </h2>


            <p>
              My Orders
            </p>


          </div>






          <div className="card">


            <h2>
              ❤️ 0
            </h2>


            <p>
              Wishlist
            </p>


          </div>






          <div className="card">


            <h2>
              🛒 0
            </h2>


            <p>
              Cart Items
            </p>


          </div>






          <div className="card">


            <h2>
              ✅ Active
            </h2>


            <p>
              Account Status
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
                  Order ID
                </th>


                <th>
                  Product
                </th>


                <th>
                  Status
                </th>


              </tr>


            </thead>




            <tbody>


              <tr>

                <td>
                  #1024
                </td>


                <td>
                  No orders yet
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



          <div className="product-box">



            <div className="product-card">

              <h3>
                Laptop
              </h3>

              <p>
                Coming soon
              </p>

            </div>





            <div className="product-card">

              <h3>
                Mobile
              </h3>

              <p>
                Coming soon
              </p>

            </div>





            <div className="product-card">

              <h3>
                Accessories
              </h3>

              <p>
                Coming soon
              </p>

            </div>



          </div>



        </div>





      </div>




    </div>


  );


}


export default CustomerDashboard;
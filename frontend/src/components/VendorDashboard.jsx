import React from "react";


function VendorDashboard(){


return(

<div>


<h1>
Vendor Dashboard
</h1>


<h3>
Welcome {localStorage.getItem("username")} 👋
</h3>


<div className="cards">


<div className="card">

<h2>0</h2>

<p>
Total Products
</p>

</div>



<div className="card">

<h2>0</h2>

<p>
Orders Received
</p>

</div>



<div className="card">

<h2>₹0</h2>

<p>
Total Revenue
</p>

</div>



<div className="card">

<h2>Active</h2>

<p>
Store Status
</p>

</div>



</div>


</div>

);


}


export default VendorDashboard;
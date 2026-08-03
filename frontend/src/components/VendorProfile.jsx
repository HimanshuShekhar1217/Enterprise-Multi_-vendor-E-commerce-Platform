import React, { useEffect, useState } from "react";
import "./VendorProfile.css";


function VendorProfile() {


    const [vendor, setVendor] = useState({

        displayName:"",
        email:"",
        businessName:"",
        phone:"",
        address:"",
        description:""

    });





    useEffect(()=>{


        fetchVendorProfile();


    },[]);








    async function fetchVendorProfile(){


        const token = localStorage.getItem("token");


        const response = await fetch(

            "http://localhost:8080/api/vendor/profile",

            {

                method:"GET",

                headers:{

                    "Authorization":`Bearer ${token}`

                }

            }

        );





        if(response.ok){


            const data = await response.json();


            setVendor(data);


        }
        else{


            console.log("Unable to load vendor profile");


        }


    }







    return (


        <div className="vendor-profile-container">





            <div className="vendor-profile-card">







                <div className="vendor-profile-header">



                    <div className="vendor-avatar">

                        🏪

                    </div>





                    <div>


                        <h1>

                            {vendor.displayName}

                        </h1>



                        <p>

                            Vendor Account

                        </p>


                    </div>




                </div>









                <div className="vendor-details">






                    <div className="detail-box">


                        <h3>

                            Business Name

                        </h3>


                        <p>

                            {vendor.businessName || "Not Added"}

                        </p>


                    </div>







                    <div className="detail-box">


                        <h3>

                            Email

                        </h3>


                        <p>

                            {vendor.email}

                        </p>


                    </div>








                    <div className="detail-box">


                        <h3>

                            Contact Number

                        </h3>


                        <p>

                            {vendor.phone || "Not Added"}

                        </p>


                    </div>








                    <div className="detail-box">


                        <h3>

                            Address

                        </h3>


                        <p>

                            {vendor.address || "Not Added"}

                        </p>


                    </div>









                    <div className="detail-box">


                        <h3>

                            Description

                        </h3>


                        <p>

                            {vendor.description || "Not Added"}

                        </p>


                    </div>





                </div>









                <button className="edit-profile-btn">


                    Edit Profile


                </button>






            </div>






        </div>


    );


}


export default VendorProfile;
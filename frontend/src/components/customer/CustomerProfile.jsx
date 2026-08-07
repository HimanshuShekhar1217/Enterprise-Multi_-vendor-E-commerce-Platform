import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerProfile.css";
import CustomerSidebar from "./CustomerSidebar";



function CustomerProfile() {


    const navigate = useNavigate();


    const [username,setUsername] = useState("");

    const [email,setEmail] = useState("");

    const [phone,setPhone] = useState("");

    const [address,setAddress] = useState("");
    const [notifications,setNotifications] = useState(true);






    useEffect(()=>{


        fetchUser();


    },[]);








    async function fetchUser(){


        const token = localStorage.getItem("token");



        const response = await fetch(

            "http://localhost:8080/api/users/me",

            {

                headers:{

                    "Authorization":`Bearer ${token}`

                }

            }

        );




        if(response.ok){


            const data = await response.json();


            setUsername(data.name || localStorage.getItem("username") || "Customer");

            setEmail(data.email);
            setPhone(data.phone || "");
            setAddress(data.address || "");


        }



    }









    async function saveProfile(){


        const token = localStorage.getItem("token");



        const response = await fetch(

            "http://localhost:8080/api/users/profile",

            {

                method:"PUT",

                headers:{


                    "Content-Type":"application/json",

                    "Authorization":`Bearer ${token}`


                },


                body:JSON.stringify({

                    username:username,

                    email:email,
                    phone:phone,
                    address:address

                })

            }

        );





        if(response.ok){


            localStorage.setItem("username", username);
            alert("Customer profile updated successfully");


        }
        else {
            alert("Unable to save profile. Please try again.");
        }


    }








    function logout(){


        localStorage.clear();


        navigate("/");


    }








    return (


        <div className="customer-profile-layout">
            <CustomerSidebar />
            <div className="customer-profile-container">






            <div className="customer-profile-card">







                <div className="customer-profile-header">



                    <div className="customer-avatar">

                        {username.charAt(0).toUpperCase()}

                    </div>




                    <div>


                        <h1>

                            {username}

                        </h1>



                        <p>

                            Customer Account

                        </p>



                    </div>



                </div>









                <h2>

                    👤 Personal Information

                </h2>








                <label>

                    Username

                </label>


                <input

                    value={username}

                    onChange={
                        (e)=>setUsername(e.target.value)
                    }

                />








                <label>

                    Email

                </label>


                <input

                    value={email}

                    disabled

                />








                <label>

                    Phone Number

                </label>


                <input

                    placeholder="+91 XXXXX XXXXX"

                    value={phone}

                    onChange={
                        (e)=>setPhone(e.target.value)
                    }

                />









                <label>

                    Address

                </label>


                <textarea

                    placeholder="Enter your address"

                    value={address}

                    onChange={
                        (e)=>setAddress(e.target.value)
                    }

                />









                <h2>

                    ⚙ Preferences

                </h2>





                <label className="customer-switch">


                    <input

                        type="checkbox"

                        checked={notifications}

                        onChange={()=>setNotifications(!notifications)}

                    />


                    Enable Email Notifications


                </label>









                <div className="customer-actions">



                    <button

                        className="customer-save"

                        onClick={saveProfile}

                    >

                        Save Changes

                    </button>







                    <button

                        className="customer-logout"

                        onClick={logout}

                    >

                        Logout

                    </button>



                </div>







            </div>
            </div>





        </div>


    );


}


export default CustomerProfile;

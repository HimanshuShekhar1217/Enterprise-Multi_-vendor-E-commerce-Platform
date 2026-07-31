import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";


function Login() {


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);



  const navigate = useNavigate();





  async function handleLogin(){


    try {


      setLoading(true);



      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },


          body:JSON.stringify({

            email: email,

            password: password

          })

        }

      );





      if(response.ok){


        const data = await response.json();




        // Save JWT token

        localStorage.setItem(
          "token",
          data.token
        );




        // Save username

        localStorage.setItem(
          "username",
          data.username
        );




        // Save email

        localStorage.setItem(
          "email",
          email
        );




        // Save role

        localStorage.setItem(
          "role",
          data.role
        );







        // Role based navigation

        if(data.role === "CUSTOMER"){


          navigate("/customer-dashboard");


        }


        else if(data.role === "VENDOR"){


          navigate("/vendor-dashboard");


        }


        else{


          alert("Role not assigned");

        }



      }


      else{


        alert("Invalid email or password");


      }





    }


    catch(error){


      alert("Server is not running");


    }


    finally{


      setLoading(false);


    }



  }








  return (


    <div className="login-container">



      <div className="login-card">



        <div className="brand">


          <h1>
            🛒 ShopStack
          </h1>


          <p>
            Enterprise Multi Vendor Platform
          </p>


        </div>






        <h2>
          Welcome Back
        </h2>



        <p className="subtitle">
          Login to manage your account
        </p>







        <label>
          Email
        </label>


        <input


          type="email"


          placeholder="Enter your email"


          value={email}


          onChange={
            (e)=>setEmail(e.target.value)
          }


        />







        <label>
          Password
        </label>





        <div className="password-box">



          <input


            type={
              showPassword 
              ? "text" 
              : "password"
            }


            placeholder="Enter password"



            value={password}



            onChange={
              (e)=>setPassword(e.target.value)
            }



          />





          <span


            onClick={()=>
              setShowPassword(!showPassword)
            }


          >


            {
              showPassword 
              ? "🙈" 
              : "👁️"
            }



          </span>




        </div>







        <button


          onClick={handleLogin}


          disabled={loading}



        >


          {
            loading 
            ? "Logging in..." 
            : "Login"
          }



        </button>






        <p className="footer-text">


          © 2026 ShopStack


        </p>





      </div>



    </div>


  );


}


export default Login;
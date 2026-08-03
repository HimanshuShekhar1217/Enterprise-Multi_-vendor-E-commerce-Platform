import { useState } from "react";
import "./VendorProducts.css";


function AddProduct() {


    const [product, setProduct] = useState({

        name:"",
        description:"",
        price:"",
        category:"",
        imageUrl:""

    });



    const [message,setMessage] = useState("");






    function handleChange(e){


        setProduct({

            ...product,

            [e.target.name]:e.target.value

        });


    }







    async function addProduct(){


        const token = localStorage.getItem("token");



        const response = await fetch(

            "http://localhost:8080/api/vendor/products",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    "Authorization":`Bearer ${token}`

                },


                body:JSON.stringify(product)

            }

        );






        if(response.ok){


            setMessage("Product Added Successfully ✅");


            setProduct({

                name:"",
                description:"",
                price:"",
                category:"",
                imageUrl:""

            });


        }

        else{


            setMessage("Failed to add product ❌");


        }



    }







    return (


        <div className="add-product-page">



            <div className="add-product-card">



                <div className="add-product-header">


                    <h1>
                        ➕ Add New Product
                    </h1>


                    <p>
                        Add products to your ShopStack store
                    </p>


                </div>







                <div className="product-form">



                    <input

                        name="name"

                        placeholder="Product Name"

                        value={product.name}

                        onChange={handleChange}

                    />







                    <textarea

                        name="description"

                        placeholder="Product Description"

                        value={product.description}

                        onChange={handleChange}

                    />








                    <input

                        name="price"

                        type="number"

                        placeholder="Price"

                        value={product.price}

                        onChange={handleChange}

                    />








                    <input

                        name="category"

                        placeholder="Category"

                        value={product.category}

                        onChange={handleChange}

                    />








                    <input

                        name="imageUrl"

                        placeholder="Product Image URL"

                        value={product.imageUrl}

                        onChange={handleChange}

                    />







                    <button onClick={addProduct}>

                        Add Product 🚀

                    </button>






                    <p className="message">

                        {message}

                    </p>



                </div>




            </div>




        </div>


    );


}


export default AddProduct;
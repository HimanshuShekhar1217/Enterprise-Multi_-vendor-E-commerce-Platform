import { useEffect, useState } from "react";
import { FaLaptop, FaMobileAlt, FaShoppingBag } from "react-icons/fa";
import "./VendorProducts.css";


function ManageProducts() {


    const [products, setProducts] = useState([]);




    async function fetchProducts(){


        const token = localStorage.getItem("token");


        const response = await fetch(

            "http://localhost:8080/api/vendor/products",

            {

                headers:{

                    "Authorization":`Bearer ${token}`

                }

            }

        );


        if(response.ok){


            const data = await response.json();

            setProducts(data);


        }


    }








    async function deleteProduct(id){


        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );



        if(!confirmDelete){

            return;

        }




        const token = localStorage.getItem("token");



        const response = await fetch(

            `http://localhost:8080/api/vendor/products/${id}`,

            {

                method:"DELETE",

                headers:{

                    "Authorization":`Bearer ${token}`

                }

            }

        );





        if(response.ok){


            alert("Product deleted successfully ✅");


            fetchProducts();


        }

        else{


            alert("Failed to delete product ❌");


        }



    }








    function getProductIcon(category){


        if(category?.toLowerCase().includes("laptop")){


            return <FaLaptop />;


        }



        if(category?.toLowerCase().includes("mobile")){


            return <FaMobileAlt />;


        }



        return <FaShoppingBag />;


    }








    useEffect(()=>{


        fetchProducts();


    },[]);








    return (


        <div className="manage-products-page">



            <div className="products-header">

                <h1>
                    📦 Manage Products
                </h1>

                <p>
                    Manage your store inventory
                </p>

            </div>







            <div className="products-grid">


            {


                products.map((product)=>(


                    <div 
                        className="modern-product-card"
                        key={product.id}
                    >



                        <div className="product-image">


                            <div className="product-icon">

                                {getProductIcon(product.category)}

                            </div>


                        </div>







                        <div className="product-content">


                            <h2>
                                {product.name}
                            </h2>



                            <p>
                                {product.description}
                            </p>





                            <div className="product-info">


                                <span className="price">

                                    ₹{product.price}

                                </span>



                                <span className="category">

                                    {product.category}

                                </span>


                            </div>






                            <div className="product-actions">



                                <button className="edit-btn">

                                    ✏️ Edit

                                </button>





                                <button

                                    className="delete-btn"

                                    onClick={() => deleteProduct(product.id)}

                                >

                                    🗑 Delete

                                </button>



                            </div>




                        </div>



                    </div>


                ))


            }


            </div>



        </div>


    );


}


export default ManageProducts;
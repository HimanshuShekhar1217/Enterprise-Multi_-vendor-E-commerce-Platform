import { useEffect, useState } from "react";
import { FaLaptop, FaMobileAlt, FaShoppingBag } from "react-icons/fa";
import "./BrowseProducts.css";


function BrowseProducts() {


    const [products, setProducts] = useState([]);






    async function fetchProducts(){


        try {


            const response = await fetch(

                "http://localhost:8080/api/products"

            );



            if(response.ok){


                const data = await response.json();


                setProducts(data);


            }


        }


        catch(error){


            console.log(error);


        }


    }







    useEffect(()=>{


        fetchProducts();


    },[]);









    function getProductIcon(category){


        if(category?.toLowerCase().includes("laptop")){


            return <FaLaptop />;


        }




        if(category?.toLowerCase().includes("mobile")){


            return <FaMobileAlt />;


        }




        return <FaShoppingBag />;


    }








    return (


        <div className="browse-page">





            <div className="browse-header">


                <h1>
                    🛍️ Browse Products
                </h1>


                <p>
                    Explore products from our trusted vendors
                </p>


            </div>







            <div className="browse-grid">





                {


                    products.length === 0 ?


                    (

                        <h2>
                            No Products Available
                        </h2>

                    )


                    :


                    products.map((product)=>(



                        <div

                            className="browse-card"

                            key={product.id}

                        >





                            <div className="browse-image">


                                <div className="browse-icon">

                                    {
                                        getProductIcon(
                                            product.category
                                        )
                                    }

                                </div>


                            </div>







                            <div className="browse-content">



                                <h2>
                                    {product.name}
                                </h2>





                                <p>
                                    {product.description}
                                </p>







                                <div className="browse-info">



                                    <span className="browse-price">

                                        ₹{product.price}

                                    </span>





                                    <span className="browse-category">

                                        {product.category}

                                    </span>



                                </div>







                                <button>

                                    🛒 Add To Cart

                                </button>






                            </div>





                        </div>



                    ))


                }







            </div>






        </div>


    );


}


export default BrowseProducts;
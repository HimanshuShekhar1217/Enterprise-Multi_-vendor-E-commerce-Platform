package com.shopstack.backend.service;


import java.util.List;

import org.springframework.stereotype.Service;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class ProductService {



    private final ProductRepository productRepository;







    // Vendor Add Product

    public Product addProduct(
            Product product,
            User vendor
    ) {


        product.setVendor(vendor);


        return productRepository.save(product);


    }








    // Vendor View Own Products

    public List<Product> getVendorProducts(
            User vendor
    ) {


        return productRepository.findByVendor(vendor);


    }









    // Customer View All Products

    public List<Product> getAllProducts(){


        return productRepository.findAll();


    }









    // Vendor Update Product

    public Product updateProduct(
            Long id,
            Product updatedProduct
    ) {



        Product product =
                productRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Product not found"
                        )
                );



        product.setName(
                updatedProduct.getName()
        );



        product.setDescription(
                updatedProduct.getDescription()
        );



        product.setPrice(
                updatedProduct.getPrice()
        );



        product.setCategory(
                updatedProduct.getCategory()
        );



        product.setImageUrl(
                updatedProduct.getImageUrl()
        );



        return productRepository.save(product);


    }









    // Vendor Delete Product

    public void deleteProduct(
            Long id
    ) {


        productRepository.deleteById(id);


    }



}
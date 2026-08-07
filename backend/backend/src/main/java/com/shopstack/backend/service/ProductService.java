package com.shopstack.backend.service;


import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        product.setStock(Math.max(0, product.getStock()));


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

    @Transactional
    public void reserveProducts(Map<Long, Integer> quantities) {
        quantities.forEach((id, quantity) -> {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

            if (quantity == null || quantity < 1 || product.getStock() < quantity) {
                throw new IllegalStateException(product.getName() + " is unavailable in the requested quantity");
            }

            product.setStock(product.getStock() - quantity);
            productRepository.save(product);
        });
    }

    @Transactional
    public void releaseProducts(Map<Long, Integer> quantities) {
        quantities.forEach((id, quantity) -> {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

            if (quantity == null || quantity < 1) {
                throw new IllegalArgumentException("Release quantity must be at least 1");
            }

            product.setStock(product.getStock() + quantity);
            productRepository.save(product);
        });
    }

    @Transactional
    public void completeProducts(Map<Long, Integer> quantities) {
        quantities.forEach((id, quantity) -> {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));

            if (quantity == null || quantity < 1) {
                throw new IllegalArgumentException("Quantity must be at least 1");
            }

            product.setSoldQuantity(product.getSoldQuantity() + quantity);
            productRepository.save(product);
        });
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

        product.setStock(
                Math.max(0, updatedProduct.getStock())
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

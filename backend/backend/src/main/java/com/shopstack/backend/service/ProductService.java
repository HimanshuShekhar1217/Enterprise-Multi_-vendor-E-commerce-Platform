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

    /**
     * Adds the demo catalog for a vendor that has no inventory yet. This is
     * used both on application startup and when a new vendor registers.
     */
    public void seedDefaultProducts(User vendor) {
        if (!productRepository.findByVendor(vendor).isEmpty()) {
            return;
        }

        List<ProductSeed> seeds = List.of(
                new ProductSeed("Lenovo IdeaPad Laptop", "Fast everyday laptop for work, study and entertainment.", 54999, "Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900", 12),
                new ProductSeed("Apple MacBook Air M3", "Lightweight premium laptop with long battery life and fast Apple silicon.", 99999, "Laptop", "https://images.unsplash.com/photo-1517337104128-4f1b1b1b1b1b?w=900", 8),
                new ProductSeed("HP Pavilion 15", "Reliable 15-inch laptop for productivity, study and everyday use.", 62999, "Laptop", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900", 14),
                new ProductSeed("ASUS ROG Gaming Laptop", "High-performance gaming laptop with dedicated graphics and fast display.", 114999, "Gaming Laptop", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=900", 6),
                new ProductSeed("Samsung Galaxy Phone", "Modern smartphone with a bright display and powerful camera.", 29999, "Phone", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900", 20),
                new ProductSeed("Apple iPhone 15", "Premium smartphone with an advanced camera and smooth performance.", 69999, "Phone", "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=900", 10),
                new ProductSeed("OnePlus 12", "Fast Android smartphone with a high-refresh display and powerful charging.", 54999, "Phone", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900", 16),
                new ProductSeed("Google Pixel 9", "Smartphone with an excellent camera and clean Android experience.", 74999, "Phone", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900", 9),
                new ProductSeed("Wireless Bluetooth Headphones", "Comfortable wireless headphones with clear sound and long battery life.", 2499, "Headphones", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900", 25)
        );

        seeds.forEach(seed -> {
            Product product = new Product();
            product.setName(seed.name());
            product.setDescription(seed.description());
            product.setPrice(seed.price());
            product.setCategory(seed.category());
            product.setImageUrl(seed.imageUrl());
            product.setStock(seed.stock());
            product.setVendor(vendor);
            productRepository.save(product);
        });
    }

    private record ProductSeed(String name, String description, double price, String category, String imageUrl, int stock) {}

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

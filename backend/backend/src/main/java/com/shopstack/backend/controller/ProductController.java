package com.shopstack.backend.controller;


import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.service.ProductService;

import lombok.RequiredArgsConstructor;



@RestController
@RequiredArgsConstructor
public class ProductController {



    private final ProductService productService;

    private final UserRepository userRepository;

    public record PurchaseItem(Long productId, Integer quantity) {}

    @PostMapping("/api/products/purchase")
    public ResponseEntity<?> purchaseProducts(@RequestBody List<PurchaseItem> items) {
        try {
            Map<Long, Integer> quantities = items.stream()
                    .collect(java.util.stream.Collectors.toMap(PurchaseItem::productId, PurchaseItem::quantity));
            productService.purchaseProducts(quantities);
            return ResponseEntity.ok(Map.of("message", "Stock updated successfully"));
        } catch (IllegalStateException | IllegalArgumentException exception) {
            return ResponseEntity.status(409).body(Map.of("message", exception.getMessage()));
        }
    }





    // ==============================
    // CUSTOMER - VIEW ALL PRODUCTS
    // ==============================

    @GetMapping("/api/products")
    public ResponseEntity<List<Product>> getAllProducts(){


        return ResponseEntity.ok(

            productService.getAllProducts()

        );


    }








    // ==============================
    // VENDOR PRODUCT APIs
    // ==============================


    @PostMapping("/api/vendor/products")
    public ResponseEntity<?> addProduct(
            @RequestBody Product product,
            Authentication authentication
    ) {



        User vendor =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Vendor not found"
                        )
                );



        return ResponseEntity.ok(
                productService.addProduct(
                        product,
                        vendor
                )
        );


    }







    @GetMapping("/api/vendor/products")
    public ResponseEntity<List<Product>> getVendorProducts(
            Authentication authentication
    ) {



        User vendor =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException(
                                "Vendor not found"
                        )
                );



        return ResponseEntity.ok(

                productService.getVendorProducts(
                        vendor
                )

        );


    }









    @PutMapping("/api/vendor/products/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product
    ){



        return ResponseEntity.ok(

                productService.updateProduct(
                        id,
                        product
                )

        );


    }









    @DeleteMapping("/api/vendor/products/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id
    ){


        productService.deleteProduct(id);



        return ResponseEntity.ok(
                "Product deleted successfully"
        );


    }



}

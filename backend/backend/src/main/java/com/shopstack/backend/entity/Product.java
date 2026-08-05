package com.shopstack.backend.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;



@Entity
@Table(name = "products")
public class Product {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false)
    private String name;



    @Column(nullable = false)
    private String description;



    @Column(nullable = false)
    private double price;



    private String category;



    private String imageUrl;

    private int stock = 0;




    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "vendor_id",
            nullable = false
    )
    private User vendor;






    public Product() {

    }







    public Long getId() {

        return id;

    }



    public void setId(Long id) {

        this.id = id;

    }








    public String getName() {

        return name;

    }



    public void setName(String name) {

        this.name = name;

    }








    public String getDescription() {

        return description;

    }



    public void setDescription(String description) {

        this.description = description;

    }








    public double getPrice() {

        return price;

    }



    public void setPrice(double price) {

        this.price = price;

    }








    public String getCategory() {

        return category;

    }



    public void setCategory(String category) {

        this.category = category;

    }








    public String getImageUrl() {

        return imageUrl;

    }



    public void setImageUrl(String imageUrl) {

        this.imageUrl = imageUrl;

    }

    public int getStock() {
        return stock;
    }

    public void setStock(int stock) {
        this.stock = stock;
    }








    public User getVendor() {

        return vendor;

    }



    public void setVendor(User vendor) {

        this.vendor = vendor;

    }



}

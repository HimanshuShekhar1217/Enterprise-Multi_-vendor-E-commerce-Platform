package com.shopstack.backend.entity;


import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;



@Entity
@Table(name = "users")
public class User implements UserDetails {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(nullable = false)
    private String username;



    @Column(nullable = false, unique = true)
    private String email;



    @Column(nullable = false)
    @JsonIgnore
    private String password;



    @Column(nullable = false)
    private String role;





    public User() {

    }





    public User(
            String username,
            String email,
            String password,
            String role
    ) {

        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;

    }






    public Long getId() {

        return id;

    }



    public void setId(Long id) {

        this.id = id;

    }





    public String getDisplayName() {

        return username;

    }





    public void setUsername(String username) {

        this.username = username;

    }





    public String getEmail() {

        return email;

    }





    public void setEmail(String email) {

        this.email = email;

    }





    public String getRole() {

        return role;

    }





    public void setRole(String role) {

        this.role = role;

    }






    /*
     * Spring Security uses this as login username.
     * We login using email.
     */
    @Override
    @JsonIgnore
    public String getUsername() {

        return email;

    }





    @Override
    @JsonIgnore
    public String getPassword() {

        return password;

    }





    public void setPassword(String password) {

        this.password = password;

    }





    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of();

    }





    @Override
    public boolean isAccountNonExpired() {

        return true;

    }





    @Override
    public boolean isAccountNonLocked() {

        return true;

    }





    @Override
    public boolean isCredentialsNonExpired() {

        return true;

    }





    @Override
    public boolean isEnabled() {

        return true;

    }


}
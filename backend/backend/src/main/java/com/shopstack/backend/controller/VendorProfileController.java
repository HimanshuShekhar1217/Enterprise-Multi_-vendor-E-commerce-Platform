package com.shopstack.backend.controller;


import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorProfile;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorProfileRepository;

import lombok.RequiredArgsConstructor;



@RestController
@RequestMapping("/api/vendor/profile")
@RequiredArgsConstructor
public class VendorProfileController {



    private final VendorProfileRepository vendorProfileRepository;

    private final UserRepository userRepository;





    @PostMapping
    public ResponseEntity<?> createProfile(
            @RequestBody VendorProfile profile,
            Authentication authentication
    ) {


        User user =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        profile.setUser(user);



        VendorProfile saved =
                vendorProfileRepository.save(profile);



        return ResponseEntity.ok(saved);

    }







    @GetMapping
    public ResponseEntity<?> getProfile(
            Authentication authentication
    ) {


        User user =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        Optional<VendorProfile> profile =
                vendorProfileRepository.findByUser(user);



        return ResponseEntity.ok(profile);

    }







    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestBody VendorProfile updatedProfile,
            Authentication authentication
    ) {


        User user =
                userRepository.findByEmail(
                        authentication.getName()
                )
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );



        VendorProfile profile =
                vendorProfileRepository.findByUser(user)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Profile not found"
                        )
                );



        profile.setBusinessName(
                updatedProfile.getBusinessName()
        );


        profile.setContactNumber(
                updatedProfile.getContactNumber()
        );


        profile.setAddress(
                updatedProfile.getAddress()
        );


        profile.setDescription(
                updatedProfile.getDescription()
        );



        return ResponseEntity.ok(
                vendorProfileRepository.save(profile)
        );

    }


}
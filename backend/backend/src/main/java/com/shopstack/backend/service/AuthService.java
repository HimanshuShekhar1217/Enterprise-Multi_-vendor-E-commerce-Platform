package com.shopstack.backend.service;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shopstack.backend.dto.AuthResponse;
import com.shopstack.backend.dto.LoginRequest;
import com.shopstack.backend.dto.RegisterRequest;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.security.JwtService;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class AuthService {



    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final AuthenticationManager authenticationManager;





    public AuthResponse register(RegisterRequest request) {



        if(userRepository.existsByEmail(request.getEmail())){

            throw new IllegalArgumentException(
                    "Email already exists"
            );

        }





        User user = new User();



        user.setUsername(
                request.getUsername()
        );


        user.setEmail(
                request.getEmail()
        );


        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );



        user.setRole(
                request.getRole()
        );



        userRepository.save(user);





        String token =
                jwtService.generateToken(
                        user.getEmail()
                );





        return new AuthResponse(

                token,

                user.getDisplayName(),

                user.getRole()

        );


    }








    public AuthResponse login(
            LoginRequest request
    ) {



        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(

                        request.getEmail(),

                        request.getPassword()

                )

        );





        User user =
                userRepository
                .findByEmail(request.getEmail())

                .orElseThrow(
                        () -> new IllegalArgumentException(
                                "User not found"
                        )
                );





        String token =
                jwtService.generateToken(
                        user.getEmail()
                );






        return new AuthResponse(

                token,

                user.getDisplayName(),

                user.getRole()

        );


    }



}
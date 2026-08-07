package com.shopstack.backend.service;


import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.shopstack.backend.dto.AuthResponse;
import com.shopstack.backend.dto.LoginRequest;
import com.shopstack.backend.dto.RegisterRequest;
import com.shopstack.backend.dto.ForgotPasswordRequest;
import com.shopstack.backend.dto.PasswordResetResponse;
import com.shopstack.backend.dto.ResetPasswordRequest;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.security.JwtService;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;



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

    public PasswordResetResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("No account found for that email"));
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
        return new PasswordResetResponse("Reset token created. It expires in 15 minutes.", token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));
        if (user.getPasswordResetTokenExpiry() == null
                || user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Invalid or expired reset token");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }



}

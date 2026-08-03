package com.shopstack.backend.security;


import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;




@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {



    private final JwtService jwtService;


    private final UserDetailsService userDetailsService;






    @Override
    protected void doFilterInternal(


            HttpServletRequest request,


            HttpServletResponse response,


            FilterChain filterChain


    ) throws ServletException, IOException {




        // Allow CORS preflight request

        if(request.getMethod().equals("OPTIONS")){


            filterChain.doFilter(
                    request,
                    response
            );


            return;

        }







        final String authHeader =

                request.getHeader("Authorization");





        final String jwt;


        final String email;






        // No token found

        if(authHeader == null || 
           !authHeader.startsWith("Bearer ")) {



            filterChain.doFilter(
                    request,
                    response
            );


            return;


        }








        jwt = authHeader.substring(7);





        email = jwtService.extractEmail(jwt);







        if(email != null &&

           SecurityContextHolder
           .getContext()
           .getAuthentication() == null){





            UserDetails userDetails =

                    userDetailsService
                    .loadUserByUsername(email);







            if(jwtService.isTokenValid(
                    jwt,
                    email
            )){





                UsernamePasswordAuthenticationToken authToken =



                        new UsernamePasswordAuthenticationToken(


                                userDetails,


                                null,


                                userDetails.getAuthorities()


                        );







                SecurityContextHolder
                .getContext()
                .setAuthentication(authToken);




            }




        }







        filterChain.doFilter(
                request,
                response
        );



    }



}
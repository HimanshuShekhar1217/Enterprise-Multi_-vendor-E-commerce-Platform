package com.shopstack.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.service.EmailService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/email-test")
@RequiredArgsConstructor
public class EmailTestController {

    private final EmailService emailService;

    @GetMapping("/send")
    public ResponseEntity<String> sendTestEmail(
            @RequestParam String to) {

        boolean sent = emailService.sendEmail(
                to,
                "ShopStack Email Test",
                "This is a test email from the ShopStack Notification Module."
        );

        if (sent) {
            return ResponseEntity.ok("Test email sent successfully.");
        }

        return ResponseEntity.internalServerError()
                .body("Failed to send test email.");
    }
}
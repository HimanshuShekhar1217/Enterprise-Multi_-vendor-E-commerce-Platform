package com.shopstack.backend.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final String keyId;
    private final String keySecret;
    private final RestClient razorpayClient;

    public PaymentController(
            @Value("${razorpay.key.id:}") String keyId,
            @Value("${razorpay.key.secret:}") String keySecret
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.razorpayClient = RestClient.builder()
                .baseUrl("https://api.razorpay.com/v1")
                .defaultHeaders(headers -> headers.setBasicAuth(keyId, keySecret))
                .build();
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        if (keyId.isBlank() || keySecret.isBlank()) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Razorpay keys are not configured on the backend"
            ));
        }

        Map<String, Object> order = razorpayClient.post()
                .uri("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "amount", request.amountInPaise(),
                        "currency", "INR",
                        "receipt", request.receipt()
                ))
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

        return ResponseEntity.ok(Map.of(
                "keyId", keyId,
                "orderId", order.get("id"),
                "amount", order.get("amount"),
                "currency", order.get("currency")
        ));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody VerifyPaymentRequest request) throws Exception {
        String payload = request.razorpayOrderId() + "|" + request.razorpayPaymentId();
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String expectedSignature = bytesToHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));

        boolean valid = MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                request.razorpaySignature().getBytes(StandardCharsets.UTF_8)
        );

        return ResponseEntity.ok(Map.of("verified", valid));
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte value : bytes) result.append(String.format("%02x", value));
        return result.toString();
    }

    public record CreateOrderRequest(long amountInPaise, String receipt) {}
    public record VerifyPaymentRequest(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {}
}

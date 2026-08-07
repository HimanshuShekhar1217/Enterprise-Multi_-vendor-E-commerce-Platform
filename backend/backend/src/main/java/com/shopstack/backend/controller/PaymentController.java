package com.shopstack.backend.controller;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.json.JSONObject;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final String keyId;
    private final String keySecret;

    public PaymentController(
            @Value("${razorpay.key.id:}") String keyId,
            @Value("${razorpay.key.secret:}") String keySecret
    ) {
        this.keyId = keyId == null ? "" : keyId.trim();
        this.keySecret = keySecret == null ? "" : keySecret.trim();
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        if (keyId.isBlank() || keySecret.isBlank()) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Razorpay keys are not configured on the backend"
            ));
        }

        if (request.amountInPaise() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Amount must be greater than zero"));
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.amountInPaise());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", request.receipt());
            Order order = razorpay.orders.create(orderRequest);
            String orderId = (String) order.get("id");
            Number amount = (Number) order.get("amount");
            String currency = (String) order.get("currency");

            return ResponseEntity.ok(Map.of(
                    "keyId", keyId,
                    "orderId", orderId,
                    "amount", amount,
                    "currency", currency
            ));
        } catch (RazorpayException exception) {
            logger.error("Razorpay order creation failed", exception);
            return ResponseEntity.internalServerError().body(Map.of(
                    "message", "Razorpay error: " + exception.getMessage()
            ));
        }
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

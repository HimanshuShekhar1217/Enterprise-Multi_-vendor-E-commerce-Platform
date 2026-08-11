package com.shopstack.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorOrder;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorOrderRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VendorOrderController {
    private final VendorOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public record OrderLine(Long productId, Integer quantity) {}
    public record CreateOrderRequest(String orderReference, String customerName, String customerPhone, String deliveryAddress, String paymentMethod, String deliveryMethod, List<OrderLine> items) {}
    public record StatusRequest(String status) {}

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request, Authentication authentication) {
        User customer = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        String customerName = request.customerName() == null || request.customerName().isBlank()
                ? customer.getDisplayName() : request.customerName();

        for (OrderLine line : request.items()) {
            Product product = productRepository.findById(line.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId()));
            VendorOrder order = new VendorOrder();
            order.setVendor(product.getVendor());
            order.setProductId(product.getId());
            order.setOrderReference(request.orderReference());
            order.setProductName(product.getName());
            order.setCustomerName(customerName);
            order.setCustomerEmail(customer.getEmail());
            order.setCustomerPhone(request.customerPhone());
            order.setDeliveryAddress(request.deliveryAddress());
            order.setPaymentMethod(request.paymentMethod());
            order.setDeliveryMethod(request.deliveryMethod());
            order.setQuantity(line.quantity());
            order.setUnitPrice(product.getSalePrice());
            order.setTotalAmount(product.getSalePrice() * line.quantity());
            order.setOrderStatus("PROCESSING");
            orderRepository.save(order);
        }
        return ResponseEntity.ok(Map.of("message", "Vendor notifications created"));
    }

    @GetMapping("/vendor/orders")
    public ResponseEntity<?> getVendorOrders(Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return ResponseEntity.ok(orderRepository.findByVendorOrderByPlacedAtDesc(vendor));
    }

    @GetMapping("/vendor/orders/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return ResponseEntity.ok(Map.of("count", orderRepository.countByVendorAndStatus(vendor, "NEW")));
    }

    @GetMapping("/vendor/orders/summary")
    public ResponseEntity<?> getVendorOrderSummary(Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        return ResponseEntity.ok(Map.of(
                "revenue", orderRepository.sumDeliveredRevenue(vendor),
                "deliveredItems", orderRepository.sumDeliveredItems(vendor)
        ));
    }

    @GetMapping("/customer/order-notifications")
    public ResponseEntity<?> getCustomerOrderNotifications(Authentication authentication) {
        return ResponseEntity.ok(orderRepository.findByCustomerEmailOrderByPlacedAtDesc(authentication.getName()));
    }

    @GetMapping("/customer/order-notifications/unread-count")
    public ResponseEntity<?> getCustomerUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(Map.of("count", orderRepository.countByCustomerEmailAndCustomerNotificationReadFalse(authentication.getName())));
    }

    @PatchMapping("/customer/order-notifications/read-all")
    public ResponseEntity<?> markCustomerNotificationsRead(Authentication authentication) {
        List<VendorOrder> unread = orderRepository.findByCustomerEmailAndCustomerNotificationReadFalse(authentication.getName());
        unread.forEach(item -> item.setCustomerNotificationRead(true));
        orderRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("message", "Customer notifications marked as read"));
    }

    @PatchMapping("/vendor/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody StatusRequest request, Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        VendorOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order notification not found"));
        if (!order.getVendor().getId().equals(vendor.getId())) return ResponseEntity.status(403).build();
        if (!isValidStatus(request.status())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid delivery status"));
        }
        order.setOrderStatus(request.status());
        order.setCustomerNotificationRead(false);
        orderRepository.save(order);
        return ResponseEntity.ok(order);
    }

    private boolean isValidStatus(String status) {
        return List.of("PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED").contains(status);
    }

    @PatchMapping("/vendor/orders/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id, Authentication authentication) {
        User vendor = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("Vendor not found"));
        VendorOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order notification not found"));
        if (!order.getVendor().getId().equals(vendor.getId())) return ResponseEntity.status(403).build();
        order.setStatus("READ");
        orderRepository.save(order);
        return ResponseEntity.ok(Map.of("message", "Notification read"));
    }
}

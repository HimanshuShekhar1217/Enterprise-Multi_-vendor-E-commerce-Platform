package com.shopstack.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.Product;
import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorProfile;
import com.shopstack.backend.entity.VendorOrder;
import com.shopstack.backend.repository.ProductRepository;
import com.shopstack.backend.repository.UserRepository;
import com.shopstack.backend.repository.VendorOrderRepository;
import com.shopstack.backend.repository.VendorProfileRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    public record StatusRequest(String status) {}
    public record RefundDecision(String decision) {}
    public record VendorUpdateRequest(String phone, String address, Double commissionPercentage) {}

    private final UserRepository userRepository;
    private final VendorOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final VendorProfileRepository vendorProfileRepository;

    public record InventoryItem(Long id, String name, String category, double price, int stock,
                                int soldQuantity, Long vendorId, String vendorName, String vendorEmail) {}

    public record VendorSummary(Long id, String displayName, String email, String phone, String address,
                                double commissionPercentage, String businessName, String contactNumber,
                                String businessAddress, String description) {}

    @GetMapping("/summary")
    public Map<String, Object> getAdminSummary(Authentication authentication) {
        return Map.of(
                "users", userRepository.countByRole("CUSTOMER"),
                "vendors", userRepository.countByRole("VENDOR"),
                "orders", orderRepository.count(),
                "refunds", orderRepository.countByOrderStatus("REFUND_REQUESTED"),
                "revenue", orderRepository.sumTotalAmountByOrderStatus("DELIVERED"),
                "commissionRevenue", orderRepository.sumCommissionRevenue()
        );
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/vendors")
    public List<VendorSummary> getVendors() {
        return userRepository.findAllByRole("VENDOR").stream().map(vendor -> {
            VendorProfile profile = vendorProfileRepository.findByUser(vendor).orElse(null);
            return new VendorSummary(
                    vendor.getId(), vendor.getDisplayName(), vendor.getEmail(), vendor.getPhone(), vendor.getAddress(),
                    User.VENDOR_COMMISSION_PERCENTAGE, profile == null ? "" : profile.getBusinessName(),
                    profile == null ? "" : profile.getContactNumber(), profile == null ? "" : profile.getAddress(),
                    profile == null ? "" : profile.getDescription());
        }).toList();
    }

    @GetMapping("/vendors/{id}/orders")
    public ResponseEntity<?> getVendorOrders(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(vendor -> ResponseEntity.ok(orderRepository.findByVendor_IdOrderByPlacedAtDesc(vendor.getId())))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/vendors/{id}")
    public ResponseEntity<?> updateVendor(@PathVariable Long id, @RequestBody VendorUpdateRequest request) {
        return userRepository.findById(id).map(vendor -> {
            if (!"VENDOR".equals(vendor.getRole())) {
                return ResponseEntity.badRequest().body(Map.of("message", "User is not a vendor"));
            }
            vendor.setCommissionPercentage(User.VENDOR_COMMISSION_PERCENTAGE);
            if (request != null && request.phone() != null) {
                vendor.setPhone(request.phone());
            }
            return ResponseEntity.ok(userRepository.save(vendor));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/orders")
    public List<VendorOrder> getOrders() {
        return orderRepository.findAllByOrderByPlacedAtDesc();
    }

    @PatchMapping("/orders/mark-all-delivered")
    public ResponseEntity<?> markAllOrdersDelivered() {
        List<VendorOrder> orders = orderRepository.findAll();
        orders.forEach(order -> {
            if (!"REFUNDED".equals(order.getOrderStatus())) {
                order.setOrderStatus("DELIVERED");
                order.setCustomerNotificationRead(false);
            }
        });
        orderRepository.saveAll(orders);
        return ResponseEntity.ok(Map.of("updated", orders.size(), "message", "All active orders marked as delivered."));
    }

    @GetMapping("/inventory")
    public List<InventoryItem> getInventory() {
        return productRepository.findAll().stream().map(this::toInventoryItem).toList();
    }

    private InventoryItem toInventoryItem(Product product) {
        User vendor = product.getVendor();
        return new InventoryItem(product.getId(), product.getName(), product.getCategory(), product.getSalePrice(),
                product.getStock(), product.getSoldQuantity(), vendor.getId(), vendor.getDisplayName(), vendor.getEmail());
    }

    @GetMapping("/refunds")
    public List<VendorOrder> getRefundRequests() {
        return orderRepository.findAll().stream()
                .filter(order -> (order.getRefundStatus() != null && !"NONE".equals(order.getRefundStatus()))
                        || "REFUNDED".equals(order.getOrderStatus()))
                .sorted((left, right) -> {
                    if (left.getRefundRequestedAt() == null) return 1;
                    if (right.getRefundRequestedAt() == null) return -1;
                    return right.getRefundRequestedAt().compareTo(left.getRefundRequestedAt());
                })
                .toList();
    }

    @PatchMapping("/refunds/{orderReference}/decision")
    public ResponseEntity<?> decideRefund(@PathVariable String orderReference, @RequestBody RefundDecision request) {
        List<VendorOrder> orders = orderRepository.findByOrderReference(orderReference);
        if (orders.isEmpty()) return ResponseEntity.notFound().build();
        if (request == null || !("APPROVE".equals(request.decision()) || "REJECT".equals(request.decision()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Decision must be APPROVE or REJECT."));
        }
        LocalDateTime processedAt = LocalDateTime.now();
        orders.forEach(order -> {
            if ("APPROVE".equals(request.decision())) {
                order.setOrderStatus("REFUNDED");
                order.setRefundStatus("APPROVED");
            } else {
                order.setOrderStatus(order.getPreviousOrderStatus() == null ? "DELIVERED" : order.getPreviousOrderStatus());
                order.setRefundStatus("REJECTED");
            }
            order.setRefundProcessedAt(processedAt);
            order.setCustomerNotificationRead(false);
        });
        orderRepository.saveAll(orders);
        return ResponseEntity.ok(Map.of("message", "Refund decision saved.", "refundStatus", orders.get(0).getRefundStatus()));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        VendorOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

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
}

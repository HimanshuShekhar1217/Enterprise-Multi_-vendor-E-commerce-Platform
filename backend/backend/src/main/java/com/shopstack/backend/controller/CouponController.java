package com.shopstack.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shopstack.backend.entity.Coupon;
import com.shopstack.backend.repository.CouponRepository;
import com.shopstack.backend.service.CouponService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CouponController {
    private final CouponRepository couponRepository;
    private final CouponService couponService;

    public record ValidateRequest(String code, double subtotal) {}
    public record CouponRequest(String code, String discountType, Double discountValue, Double minimumOrderAmount,
                                Double maximumDiscount, LocalDateTime startDate, LocalDateTime expiryDate,
                                Integer usageLimit, Boolean active) {}

    @PostMapping("/api/coupons/validate")
    public ResponseEntity<?> validate(@RequestBody ValidateRequest request) {
        try {
            if (request == null || request.code() == null) return ResponseEntity.badRequest().body(Map.of("message", "Coupon code is required."));
            CouponService.CouponCalculation result = couponService.calculate(request.code(), request.subtotal());
            return ResponseEntity.ok(Map.of("code", result.code(), "discount", result.discount(), "total", result.total(), "message", "Coupon applied successfully."));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }

    @GetMapping("/api/admin/coupons")
    public List<Coupon> all() { return couponRepository.findAll(); }

    @PostMapping("/api/admin/coupons")
    public ResponseEntity<?> create(@RequestBody CouponRequest request) { return save(null, request); }

    @PutMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody CouponRequest request) { return save(id, request); }

    @DeleteMapping("/api/admin/coupons/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) { couponRepository.deleteById(id); return ResponseEntity.ok(Map.of("message", "Coupon deleted.")); }

    private ResponseEntity<?> save(Long id, CouponRequest request) {
        try {
            if (request == null || request.code() == null || request.code().isBlank()) throw new IllegalArgumentException("Coupon code is required.");
            String code = request.code().trim().toUpperCase();
            if (request.discountValue() == null || request.discountValue() <= 0) throw new IllegalArgumentException("Discount value must be greater than zero.");
            if (!"PERCENTAGE".equals(request.discountType()) && !"FIXED".equals(request.discountType())) throw new IllegalArgumentException("Discount type must be PERCENTAGE or FIXED.");
            if ("PERCENTAGE".equals(request.discountType()) && request.discountValue() > 100) throw new IllegalArgumentException("Percentage discount cannot exceed 100.");
            if (request.startDate() == null || request.expiryDate() == null || !request.expiryDate().isAfter(request.startDate())) throw new IllegalArgumentException("Expiry date must be after the start date.");
            Coupon coupon = id == null ? new Coupon() : couponRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Coupon not found."));
            if (couponRepository.findByCodeIgnoreCase(code).filter(existing -> !existing.getId().equals(coupon.getId())).isPresent()) throw new IllegalArgumentException("Coupon code already exists.");
            coupon.setCode(code); coupon.setDiscountType(request.discountType()); coupon.setDiscountValue(request.discountValue());
            coupon.setMinimumOrderAmount(request.minimumOrderAmount()); coupon.setMaximumDiscount(request.maximumDiscount());
            coupon.setStartDate(request.startDate()); coupon.setExpiryDate(request.expiryDate()); coupon.setUsageLimit(request.usageLimit());
            if (request.active() != null) coupon.setActive(request.active());
            return ResponseEntity.ok(couponRepository.save(coupon));
        } catch (IllegalArgumentException exception) { return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage())); }
    }
}

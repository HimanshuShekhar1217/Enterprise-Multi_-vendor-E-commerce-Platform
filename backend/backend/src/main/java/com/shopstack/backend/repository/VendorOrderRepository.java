package com.shopstack.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.shopstack.backend.entity.User;
import com.shopstack.backend.entity.VendorOrder;

public interface VendorOrderRepository extends JpaRepository<VendorOrder, Long> {
    List<VendorOrder> findByVendorOrderByPlacedAtDesc(User vendor);
    long countByVendorAndStatus(User vendor, String status);
    List<VendorOrder> findByCustomerEmailOrderByPlacedAtDesc(String customerEmail);
    long countByCustomerEmailAndCustomerNotificationReadFalse(String customerEmail);
    List<VendorOrder> findByCustomerEmailAndCustomerNotificationReadFalse(String customerEmail);

    @Query("select coalesce(sum(o.totalAmount), 0) from VendorOrder o where o.vendor = :vendor and o.orderStatus = 'DELIVERED'")
    double sumDeliveredRevenue(@Param("vendor") User vendor);

    @Query("select coalesce(sum(o.quantity), 0) from VendorOrder o where o.vendor = :vendor and o.orderStatus = 'DELIVERED'")
    long sumDeliveredItems(@Param("vendor") User vendor);
}

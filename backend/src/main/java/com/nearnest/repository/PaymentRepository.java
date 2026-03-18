package com.nearnest.repository;

import com.nearnest.model.Payment;
import com.nearnest.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBooking(Booking booking);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    List<Payment> findByTransactionId(String transactionId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p JOIN p.booking b WHERE b.service.provider.id = :providerId AND p.status = 'COMPLETED'")
    BigDecimal sumCompletedAmountByProviderId(@Param("providerId") Long providerId);
}

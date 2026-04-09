package com.nearnest.repository;

import com.nearnest.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByProviderId(Long providerId);
    List<Transaction> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    Page<Transaction> findByProviderId(Long providerId, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.provider.id = :providerId AND t.payoutStatus = :status")
    java.math.BigDecimal sumAmountByProviderIdAndPayoutStatus(Long providerId, Transaction.PayoutStatus status);
}

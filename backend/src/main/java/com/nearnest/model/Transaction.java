package com.nearnest.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions", indexes = {
    @Index(name = "idx_transaction_provider_id", columnList = "provider_id"),
    @Index(name = "idx_transaction_payout_status", columnList = "payout_status")
})
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id")
    private Payment payment;

    @NotNull
    @Column(name = "amount", precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payout_status", length = 50)
    @Enumerated(EnumType.STRING)
    private PayoutStatus payoutStatus = PayoutStatus.PENDING;
    
    @Column(name = "payout_method", length = 50)
    private String payoutMethod; // BANK_TRANSFER, UPI, etc.
    
    @Column(name = "payout_reference", length = 200)
    private String payoutReference;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum PayoutStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getProvider() {
        return provider;
    }

    public void setProvider(User provider) {
        this.provider = provider;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public PayoutStatus getPayoutStatus() {
        return payoutStatus;
    }

    public void setPayoutStatus(PayoutStatus payoutStatus) {
        this.payoutStatus = payoutStatus;
    }

    public String getPayoutMethod() {
        return payoutMethod;
    }

    public void setPayoutMethod(String payoutMethod) {
        this.payoutMethod = payoutMethod;
    }

    public String getPayoutReference() {
        return payoutReference;
    }

    public void setPayoutReference(String payoutReference) {
        this.payoutReference = payoutReference;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}

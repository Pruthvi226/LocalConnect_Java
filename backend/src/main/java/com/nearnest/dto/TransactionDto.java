package com.nearnest.dto;

import com.nearnest.model.Transaction;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionDto {
    private Long id;
    private Long providerId;
    private Long paymentId;
    private BigDecimal amount;
    private String payoutStatus;
    private String payoutMethod;
    private String payoutReference;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public TransactionDto() {}

    public static TransactionDto fromEntity(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setProviderId(transaction.getProvider().getId());
        if (transaction.getPayment() != null) {
            dto.setPaymentId(transaction.getPayment().getId());
        }
        dto.setAmount(transaction.getAmount());
        dto.setPayoutStatus(transaction.getPayoutStatus().name());
        dto.setPayoutMethod(transaction.getPayoutMethod());
        dto.setPayoutReference(transaction.getPayoutReference());
        dto.setCreatedAt(transaction.getCreatedAt());
        dto.setProcessedAt(transaction.getProcessedAt());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPayoutStatus() { return payoutStatus; }
    public void setPayoutStatus(String payoutStatus) { this.payoutStatus = payoutStatus; }

    public String getPayoutMethod() { return payoutMethod; }
    public void setPayoutMethod(String payoutMethod) { this.payoutMethod = payoutMethod; }

    public String getPayoutReference() { return payoutReference; }
    public void setPayoutReference(String payoutReference) { this.payoutReference = payoutReference; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}

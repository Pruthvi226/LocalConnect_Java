package com.nearnest.dto;

public class BookingCompletionRequest {
    private String paymentStatus; // "PAID" or "PENDING"

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}

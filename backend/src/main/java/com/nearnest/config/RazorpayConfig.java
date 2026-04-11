package com.nearnest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Scalable environment-based configuration for Razorpay.
 * Follows production-grade practices by ensuring credentials are never hardcoded.
 */
@Component
public class RazorpayConfig {

    @Value("${RAZORPAY_KEY_ID:${razorpay.key-id:}}")
    private String keyId;

    @Value("${RAZORPAY_KEY_SECRET:${razorpay.key-secret:}}")
    private String keySecret;

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public boolean isConfigured() {
        return keyId != null && !keyId.isEmpty() && !keyId.contains("placeholder") && 
               keySecret != null && !keySecret.isEmpty() && !keySecret.contains("placeholder");
    }
}

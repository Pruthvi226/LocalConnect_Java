package com.nearnest.controller;

import com.nearnest.dto.PaymentDto;
import com.nearnest.service.PaymentService;
import com.nearnest.service.StripeService;
import com.nearnest.service.PayPalService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class PaymentController {
    private final PaymentService paymentService;
    private final StripeService stripeService;
    private final PayPalService payPalService;

    @Value("${stripe.publishable-key:}")
    private String stripePublishableKey;

    public PaymentController(PaymentService paymentService, StripeService stripeService, PayPalService payPalService) {
        this.paymentService = paymentService;
        this.stripeService = stripeService;
        this.payPalService = payPalService;
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getPaymentConfig() {
        return ResponseEntity.ok(Map.of(
                "stripePublishableKey", stripePublishableKey != null ? stripePublishableKey : "",
                "stripeEnabled", stripeService.isConfigured(),
                "paypalEnabled", payPalService.isConfigured(),
                "razorpayEnabled", true // Enabling by default for demo
        ));
    }

    @PostMapping("/stripe/create-intent")
    public ResponseEntity<Map<String, String>> createStripeIntent(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(request.get("bookingId").toString());
        StripeService.StripeIntentResponse resp = stripeService.createPaymentIntent(bookingId);
        return ResponseEntity.ok(Map.of("clientSecret", resp.getClientSecret(), "paymentIntentId", resp.getPaymentIntentId()));
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<Void> stripeWebhook(@RequestBody String payload, @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        if (signature == null || signature.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        stripeService.handleWebhook(payload, signature);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/paypal/create-order")
    public ResponseEntity<Map<String, String>> createPayPalOrder(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(request.get("bookingId").toString());
        PayPalService.PayPalOrderResponse resp = payPalService.createOrder(bookingId);
        return ResponseEntity.ok(Map.of("orderId", resp.getOrderId(), "approveUrl", resp.getApproveUrl() != null ? resp.getApproveUrl() : ""));
    }

    @PostMapping("/paypal/capture")
    public ResponseEntity<PaymentDto> capturePayPalOrder(@RequestBody Map<String, Object> request) {
        String orderId = request.get("orderId").toString();
        return ResponseEntity.ok(payPalService.captureOrder(orderId));
    }

    @PostMapping("/razorpay/create-order")
    public ResponseEntity<Map<String, String>> createRazorpayOrder(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(request.get("bookingId").toString());
        return ResponseEntity.ok(paymentService.createRazorpayOrder(bookingId));
    }

    @PostMapping("/razorpay/verify")
    public ResponseEntity<PaymentDto> verifyRazorpayPayment(@RequestBody Map<String, String> request) {
        String orderId = request.get("razorpay_order_id");
        String paymentId = request.get("razorpay_payment_id");
        String signature = request.get("razorpay_signature");
        return ResponseEntity.ok(paymentService.verifyRazorpayPayment(orderId, paymentId, signature));
    }

    @PostMapping("/process")
    public ResponseEntity<PaymentDto> processPayment(@RequestBody Map<String, Object> request) {
        Long bookingId = Long.parseLong(request.get("bookingId").toString());
        String paymentMethod = request.get("paymentMethod").toString();
        String transactionId = request.get("transactionId") != null ? 
                request.get("transactionId").toString() : null;

        return ResponseEntity.ok(paymentService.processPayment(bookingId, paymentMethod, transactionId));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentDto> getPaymentByBooking(@PathVariable(name = "bookingId") Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBooking(bookingId));
    }
}

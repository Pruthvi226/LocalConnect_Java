package com.nearnest.controller;

import com.nearnest.dto.BookingDto;
import com.nearnest.dto.CustomerSummaryDto;
import com.nearnest.service.CustomerDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class CustomerController {
    private final CustomerDashboardService dashboardService;

    public CustomerController(CustomerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<CustomerSummaryDto> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto>> getBookings() {
        return ResponseEntity.ok(dashboardService.getCustomerBookings());
    }
}

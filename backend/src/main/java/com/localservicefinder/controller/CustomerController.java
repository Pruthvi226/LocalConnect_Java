package com.localservicefinder.controller;

import com.localservicefinder.dto.CustomerSummaryDto;
import com.localservicefinder.service.CustomerDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customer")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class CustomerController {
    private final CustomerDashboardService dashboardService;

    public CustomerController(CustomerDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        try {
            CustomerSummaryDto summary = dashboardService.getSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

package com.localservicefinder.controller;

import com.localservicefinder.model.Booking;
import com.localservicefinder.model.Booking.BookingStatus;
import com.localservicefinder.model.Service;
import com.localservicefinder.dto.ProviderSummaryDto;
import com.localservicefinder.service.BookingService;
import com.localservicefinder.service.ProviderDashboardService;
import com.localservicefinder.service.ServiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/provider")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}, allowCredentials = "true")
public class ProviderController {
    private final ProviderDashboardService dashboardService;
    private final ServiceService serviceService;
    private final BookingService bookingService;

    public ProviderController(ProviderDashboardService dashboardService, ServiceService serviceService,
                             BookingService bookingService) {
        this.dashboardService = dashboardService;
        this.serviceService = serviceService;
        this.bookingService = bookingService;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        try {
            ProviderSummaryDto summary = dashboardService.getSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/services")
    public ResponseEntity<?> getMyServices() {
        try {
            List<Service> services = serviceService.getMyServices();
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getProviderBookings() {
        try {
            List<Booking> bookings = dashboardService.getProviderBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long id,
                                                  @RequestParam(required = false) BookingStatus status,
                                                  @RequestParam(required = false) String notes) {
        try {
            Booking updated = bookingService.updateBooking(id, status, notes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
